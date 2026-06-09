import { NextResponse } from "next/server";

export async function GET() {
  const siteURL = process.env.NEXT_PUBLIC_APP_URL || "https://estajer.com";
  const host = siteURL.replace(/^https?:\/\//, "");

  const robotsTxt = `User-agent: *
Allow: /
Disallow: /request-product
Disallow: /add-product
Disallow: /edit-product/
Disallow: /favorites
Disallow: /admin/
Disallow: /dashboard/
Disallow: /contract/
Disallow: /documentation/
Disallow: /product-documentation/
Disallow: /payment-completed/
Disallow: /_next/
Disallow: /cart/
Disallow: /checkout/
Disallow: /confirm-account
Disallow: /api/
Disallow: /estajer/images/
Disallow: /*/my-products/preview/
Disallow: /*/requests/preview/
Disallow: /*?*
Content-Signal: ai-train=no, search=yes, ai-input=no

User-agent: Googlebot
Allow: /
Disallow: /request-product
Disallow: /add-product
Disallow: /edit-product/
Disallow: /favorites
Disallow: /admin/
Disallow: /dashboard/
Disallow: /contract/
Disallow: /documentation/
Disallow: /product-documentation/
Disallow: /payment-completed/
Disallow: /_next/
Disallow: /cart
Disallow: /checkout
Disallow: /confirm-account
Disallow: /api/
Disallow: /estajer/images/
Disallow: /*/my-products/preview/
Disallow: /*/requests/preview/
Disallow: /*?*
Crawl-delay: 1

User-agent: Bingbot
Allow: /
Disallow: /request-product
Disallow: /add-product
Disallow: /edit-product/
Disallow: /favorites
Disallow: /admin/
Disallow: /dashboard/
Disallow: /contract/
Disallow: /documentation/
Disallow: /product-documentation/
Disallow: /payment-completed/
Disallow: /_next/
Disallow: /cart
Disallow: /checkout
Disallow: /confirm-account
Disallow: /api/
Disallow: /estajer/images/
Disallow: /*/my-products/preview/
Disallow: /*/requests/preview/
Disallow: /*?*
Crawl-delay: 2

Sitemap: ${siteURL}/sitemap.xml
Sitemap: ${siteURL}/products/sitemap.xml
Sitemap: ${siteURL}/blogs/sitemap.xml
Sitemap: ${siteURL}/categories/sitemap.xml
Sitemap: ${siteURL}/profile/sitemap.xml

Host: ${host}
`;

  return new NextResponse(robotsTxt, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
