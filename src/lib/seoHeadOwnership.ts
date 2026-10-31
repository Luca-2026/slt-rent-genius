/** Adopt the static head once so Helmet can replace route tags on navigation. */
export function adoptSeoHead() {
  for (const element of document.head.querySelectorAll('title, meta[name="description"], meta[name="robots"], meta[name="keywords"], meta[property^="og:"], meta[name^="twitter:"], link[rel="canonical"]')) {
    element.setAttribute('data-rh', 'true');
  }
}