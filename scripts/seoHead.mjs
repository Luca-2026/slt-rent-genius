// Give route metadata one owner, while preserving charset, verification and assets.
export function stripRouteHead(html) {
  return html.replace(/<head\b[^>]*>[\s\S]*?<\/head>/i, head => head
    .replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi, '')
    .replace(/<meta\b[^>]*>/gi, tag => /(?:name|property)\s*=\s*["'](?:description|robots|keywords|og:[^"']+|twitter:[^"']+)["']/i.test(tag) ? '' : tag)
    .replace(/<link\b[^>]*>/gi, tag => /rel\s*=\s*["']canonical["']/i.test(tag) ? '' : tag));
}