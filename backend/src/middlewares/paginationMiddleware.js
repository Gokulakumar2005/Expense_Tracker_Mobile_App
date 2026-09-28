const DEFAULT_PAGE_SIZE = 20;

function paginate(rows, reqQuery, req) {
  const page = Math.max(1, parseInt(reqQuery.page || '1', 10));
  const pageSize = Math.max(1, parseInt(reqQuery.page_size || DEFAULT_PAGE_SIZE, 10));
  const count = rows.length;
  const totalPages = Math.ceil(count / pageSize);
  const start = (page - 1) * pageSize;
  const results = rows.slice(start, start + pageSize);

  const baseUrl = req ? `${req.protocol}://${req.get('host')}${req.path}` : '';

  const buildUrl = (p) => {
    if (!req) return null;
    const params = new URLSearchParams({ ...reqQuery, page: p });
    return `${baseUrl}?${params.toString()}`;
  };

  return {
    count,
    next: page < totalPages ? buildUrl(page + 1) : null,
    previous: page > 1 ? buildUrl(page - 1) : null,
    results,
  };
}

export { paginate, DEFAULT_PAGE_SIZE };
export default { paginate, DEFAULT_PAGE_SIZE };
