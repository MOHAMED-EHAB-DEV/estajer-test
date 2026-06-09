import {
  getBlogs,
  generateBlogEntries,
  generateBlogCategoryEntries,
} from "@/lib/sitemap";

export default async function sitemap() {
  const blogs = await getBlogs();
  const blogEntries = generateBlogEntries(blogs);
  const categoryEntries = generateBlogCategoryEntries();
  return [...blogEntries, ...categoryEntries];
}
