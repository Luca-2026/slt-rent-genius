export function isTrailerCategory(category?: string | null) {
  return category?.trim().toLowerCase() === "anhaenger";
}
export function isTrailerRoute(path: string) {
  return /\/(anhaenger)(\/|$)/.test(path);
}