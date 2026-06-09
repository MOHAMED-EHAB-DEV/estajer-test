import { getProducts, generateProductEntries } from "@/lib/sitemap";

export default async function sitemap() {
  const products = await getProducts();
  return generateProductEntries(products);
}
