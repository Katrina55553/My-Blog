export const POSTS_PER_PAGE = 6;

export type PaginationPage = number | 'ellipsis';

export function getPaginationPages(current: number, total: number): PaginationPage[] {
  const pages: PaginationPage[] = [];

  if (total <= 7) {
    for (let page = 1; page <= total; page++) pages.push(page);
  } else {
    const start = current <= 4 ? 1 : current >= total - 3 ? total - 4 : current - 1;
    const end = current <= 4 ? 5 : current >= total - 3 ? total : current + 1;

    if (start > 1) pages.push(1, 'ellipsis');
    for (let page = start; page <= end; page++) pages.push(page);
    if (end < total) pages.push('ellipsis', total);
  }

  return pages;
}
