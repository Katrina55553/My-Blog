interface GitHubRepoStats {
  stars: number;
  forks: number;
}

const fallbackStats: GitHubRepoStats = { stars: 22, forks: 1 };
const repoApiUrl = 'https://api.github.com/repos/Katrina55553/My-Blog';

let repoStatsPromise: Promise<GitHubRepoStats> | undefined;

export function getGitHubRepoStats(): Promise<GitHubRepoStats> {
  if (!repoStatsPromise) {
    repoStatsPromise = fetch(repoApiUrl, {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'my-blog-build',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      signal: AbortSignal.timeout(5000),
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`GitHub API returned ${response.status}`);
        }

        const data = (await response.json()) as {
          stargazers_count?: unknown;
          forks_count?: unknown;
        };
        if (
          typeof data.stargazers_count !== 'number' ||
          typeof data.forks_count !== 'number'
        ) {
          throw new Error('GitHub API response did not include repository counts');
        }

        return { stars: data.stargazers_count, forks: data.forks_count };
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`Could not fetch GitHub repository stats (${message}); using fallback counts.`);
        return fallbackStats;
      });
  }

  return repoStatsPromise;
}
