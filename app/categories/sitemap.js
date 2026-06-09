import { getCategories, generateCategoryEntries } from "@/lib/sitemap";

export default async function sitemap() {
  const categories = await getCategories();
  return generateCategoryEntries(categories);
}
