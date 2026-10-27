/**
 * Prefix a public asset path with the deployment base path so the same build
 * works at `/` and at `/portfolio/` (GitHub Pages project sites).
 */
export const asset = (path: string): string => {
  const base = import.meta.env.BASE_URL || '/';
  const clean = path.replace(/^\/+/, '');
  return `${base.replace(/\/+$/, '')}/${clean}`;
};
