/**
 * Normalize a shop-provided link so it works with both ar and en.
 *
 * Rules:
 *  - https://estajer.com/en/X  →  /${langPrefix}X
 *  - https://estajer.com/X     →  /${langPrefix}X   (any path after domain)
 *  - Already relative /X       →  as-is (unchanged)
 *  - Anchor #X                 →  as-is (unchanged)
 *  - External URL              →  as-is (unchanged)
 *
 * @param {string} url        The raw URL from section data
 * @param {string} langPrefix e.g. "" for ar, "en/" for en
 * @returns {string}
 */
export function normalizeShopLink(url, langPrefix = "") {
  if (!url) return "#";

  // Strip estajer.com with optional language segment
  const estajerPattern =
    /^https?:\/\/(?:www\.)?estajer\.com(?:\/[a-z]{2})?(\/.*)?$/i;
  const match = url.match(estajerPattern);
  if (match) {
    const path = match[1] || "/";
    return `/${langPrefix}${path.replace(/^\//, "")}`;
  }

  // Already relative or anchor — return unchanged
  return url;
}
