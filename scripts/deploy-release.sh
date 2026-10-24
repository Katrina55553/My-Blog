#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -ne 4 ]; then
  echo "Usage: deploy-release.sh <image.tar.gz> <image-tag> <health.tsv> <commit>" >&2
  exit 2
fi
image_archive=$1
image=$2
manifest=$3
expected_commit=$4
repository_dir=${DEPLOY_REPOSITORY_DIR:-$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)}
nginx_site=${DEPLOY_NGINX_SITE:-/etc/nginx/sites-available/blog.cogod.cn}
nginx_enabled=${DEPLOY_NGINX_ENABLED:-/etc/nginx/sites-enabled/blog.cogod.cn}
state_dir=$(mktemp -d)
preview_name="my-blog-check-$$"
previous_image=
deployment_started=0
nginx_changed=0

compose() {
  docker compose --project-directory "$repository_dir" \
    -f "$repository_dir/docker-compose.yml" -f "$1" "${@:2}"
}

write_override() {
  # Only generated Docker tags/IDs reach this file; never emit arbitrary YAML.
  [[ "$2" =~ ^[a-zA-Z0-9][a-zA-Z0-9._:/-]*$ ]]
  printf 'services:\n  blog:\n    image: "%s"\n' "$2" > "$1"
}

restore_nginx_path() {
  sudo -n rm -f -- "$2" || return 1
  if [ -e "$state_dir/$1" ] || [ -L "$state_dir/$1" ]; then
    sudo -n cp -a -- "$state_dir/$1" "$2"
  fi
}

fetch_http() {
  # Docker can publish its port before nginx accepts requests, producing a TCP
  # reset (curl 56), not just a refused connection. These read-only GETs are safe
  # to retry; keep all health checks, including rollback, on the same policy.
  curl --fail --silent --show-error --noproxy '*' --connect-timeout 3 --max-time 20 \
    --retry 5 --retry-delay 1 --retry-all-errors "$@"
}

finish() {
  local status=$1 rollback_failed=0
  trap - EXIT
  set +e
  if [ "$status" -ne 0 ] && [ "$deployment_started" = 1 ]; then
    echo "Deployment failed; restoring the previous service" >&2
    if [ -n "$previous_image" ]; then
      docker tag "$previous_image" my-blog:current || rollback_failed=1
      write_override "$state_dir/rollback.yml" "$previous_image"
      compose "$state_dir/rollback.yml" up -d --no-build --pull never --remove-orphans blog || rollback_failed=1
      fetch_http --output /dev/null http://127.0.0.1:8080/ || rollback_failed=1
    else
      # A failed first installation has no older service to restore.
      compose "$state_dir/release.yml" rm --stop --force blog || rollback_failed=1
      docker image rm my-blog:current >/dev/null 2>&1
    fi
  fi
  if [ "$status" -ne 0 ] && [ "$nginx_changed" = 1 ]; then
    restore_nginx_path nginx-site "$nginx_site" || rollback_failed=1
    restore_nginx_path nginx-enabled "$nginx_enabled" || rollback_failed=1
    # Restore both the files and the configuration loaded by the running master.
    sudo -n nginx -t && sudo -n systemctl reload nginx || rollback_failed=1
  fi
  docker rm --force "$preview_name" >/dev/null 2>&1
  # The container and stable current/previous tags retain the needed images.
  # Remove only this run's transport tag; never prune other applications.
  docker image rm "$image" >/dev/null 2>&1
  sudo -n rm -rf -- "$state_dir"
  if [ "$rollback_failed" = 1 ]; then
    echo "Automatic rollback encountered an error; inspect the service and host nginx" >&2
  fi
  exit "$status"
}
trap 'finish "$?"' EXIT

check_http() {
  local base=$1 checksum resource extra
  shift
  while IFS=$'\t' read -r checksum resource extra; do
    [[ "$checksum" =~ ^[a-f0-9]{64}$ && "$resource" == /* && -z "${extra:-}" ]] || return 1
    fetch_http "$@" --output "$state_dir/response" "$base$resource" || return 1
    if ! printf '%s  %s\n' "$checksum" "$state_dir/response" | sha256sum --check --status; then
      echo "Health check content mismatch: $base$resource" >&2
      return 1
    fi
  done < "$manifest"
}

[[ "$expected_commit" =~ ^[a-f0-9]{40}$ ]]
[[ -s "$manifest" && -s "$image_archive" ]]
# Reject an empty/malformed manifest before touching the running service.
awk -F '\t' 'NF != 2 || length($1) != 64 || $1 ~ /[^a-f0-9]/ || $2 !~ /^\// { exit 1 } END { if (NR == 0) exit 1 }' "$manifest"
sudo -n true
write_override "$state_dir/release.yml" "$image"

# Capture the immutable image ID, including during the first migration from the
# old locally built Compose image. No rollback may invoke a build or a pull.
previous_container=$(compose "$state_dir/release.yml" ps -a -q blog)
if [ -n "$previous_container" ]; then
  previous_image=$(docker inspect --format '{{.Image}}' "$previous_container")
  docker tag "$previous_image" my-blog:previous
fi
for entry in nginx-site nginx-enabled; do
  if [ "$entry" = nginx-site ]; then source_path=$nginx_site; else source_path=$nginx_enabled; fi
  if sudo -n test -e "$source_path" || sudo -n test -L "$source_path"; then
    sudo -n cp -a -- "$source_path" "$state_dir/$entry"
  fi
done

docker load --input "$image_archive"
actual_commit=$(docker image inspect --format '{{ index .Config.Labels "org.opencontainers.image.revision" }}' "$image")
if [ "$actual_commit" != "$expected_commit" ]; then
  echo "Image commit mismatch: expected $expected_commit, got $actual_commit" >&2
  exit 1
fi
docker run --detach --pull never --name "$preview_name" --publish 127.0.0.1::80 "$image" >/dev/null
preview_address=$(docker port "$preview_name" 80/tcp)
[[ "$preview_address" =~ ^127\.0\.0\.1:[0-9]+$ ]]
check_http "http://$preview_address"
docker rm --force "$preview_name" >/dev/null

deployment_started=1
docker tag "$image" my-blog:current
write_override "$state_dir/release.yml" my-blog:current
compose "$state_dir/release.yml" up -d --no-build --pull never --remove-orphans blog
check_http http://127.0.0.1:8080

nginx_changed=1
sudo -n install -m 0644 "$repository_dir/host-nginx.conf" "$nginx_site"
sudo -n ln -sfn "$nginx_site" "$nginx_enabled"
sudo -n nginx -t
sudo -n systemctl reload nginx
# Exercise this host's TLS vhost, certificate, and reverse proxy, without DNS or
# an external request. Hashes prove it serves the exact CI-validated content.
check_http https://blog.cogod.cn --resolve blog.cogod.cn:443:127.0.0.1
compose "$state_dir/release.yml" ps
echo "Deployed $expected_commit ($image)"
