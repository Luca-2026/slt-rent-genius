export function seoPath(path: string): string {
  return path.split('/').map(segment => {
    try { return encodeURIComponent(decodeURIComponent(segment)); }
    catch { return encodeURIComponent(segment); }
  }).join('/');
}