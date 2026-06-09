const siteURL = process.env.NEXT_PUBLIC_APP_URL;

export const getUrlName = (name) => {
  return name
    ?.trim()
    .replace(/[^\w\s'\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g, " ")
    .replace(/\s+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replaceAll("'", "")
    .toLowerCase();
};

export async function getProducts() {
  const params = new URLSearchParams({
    limit: 5000,
    fields: `nameEn,nameAr,updatedAt`,
    fetch: "all",
  });
  try {
    const res = await fetch(`${siteURL}/api/products?${params}`, {
      next: { revalidate: 60 * 60 * 24 },
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error("Failed to fetch products for sitemap:", error);
    return [];
  }
}

export async function getCategories() {
  try {
    const res = await fetch(
      `${siteURL}/api/categories?mainOnly=true&status=active&includeSubcategories=true`,
      { next: { revalidate: 60 * 60 * 24 } },
    );
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error("Failed to fetch categories for sitemap:", error);
    return [];
  }
}

export async function getBlogs() {
  try {
    const params = new URLSearchParams({ limit: 500, length: 0 });
    const res = await fetch(`${siteURL}/api/blog?${params}`, {
      next: { revalidate: 60 * 60 * 24 },
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error("Failed to fetch blogs for sitemap:", error);
    return [];
  }
}

export async function getProfiles() {
  try {
    const params = new URLSearchParams({ limit: 500, sitemap: "true" });
    const res = await fetch(`${siteURL}/api/profiles?${params}`, {
      next: { revalidate: 60 * 60 * 24 },
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error("Failed to fetch profiles for sitemap:", error);
    return [];
  }
}

export function generateProductEntries(products) {
  return products.flatMap((product) => {
    const { nameAr, nameEn, _id, updatedAt } = product;
    return [
      {
        url: `${siteURL}/products/${getUrlName(nameAr)}_ref_${_id}`,
        lastModified: new Date(updatedAt),
        changeFrequency: "weekly",
        priority: 0.9,
      },
      {
        url: `${siteURL}/en/products/${getUrlName(nameEn)}_ref_${_id}`,
        lastModified: new Date(updatedAt),
        changeFrequency: "weekly",
        priority: 0.9,
      },
    ];
  });
}

export function generateCategoryEntries(categories) {
  return categories.flatMap((category) => {
    const { key, updatedAt, subcategories } = category;
    const categoryEntries = [
      {
        url: `${siteURL}/${key}/products`,
        lastModified: new Date(updatedAt || Date.now()),
        changeFrequency: "weekly",
        priority: 0.8,
      },
      {
        url: `${siteURL}/en/${key}/products`,
        lastModified: new Date(updatedAt || Date.now()),
        changeFrequency: "weekly",
        priority: 0.8,
      },
    ];

    const subcategoryEntries = (subcategories || []).flatMap((sub) => {
      const subKey = sub.key;
      const subUpdatedAt = sub.updatedAt || updatedAt || Date.now();
      return [
        {
          url: `${siteURL}/${key}/${subKey}/products`,
          lastModified: new Date(subUpdatedAt),
          changeFrequency: "weekly",
          priority: 0.7,
        },
        {
          url: `${siteURL}/en/${key}/${subKey}/products`,
          lastModified: new Date(subUpdatedAt),
          changeFrequency: "weekly",
          priority: 0.7,
        },
      ];
    });

    return [...categoryEntries, ...subcategoryEntries];
  });
}

export function generateBlogEntries(blogs) {
  return blogs.flatMap((blog) => {
    const { urlName, createdAt } = blog;
    if (!urlName) return [];

    return [
      {
        url: `${siteURL}/blogs/${urlName}`,
        lastModified: new Date(createdAt),
        changeFrequency: "monthly",
        priority: 0.7,
      },
      {
        url: `${siteURL}/en/blogs/${urlName}`,
        lastModified: new Date(createdAt),
        changeFrequency: "monthly",
        priority: 0.7,
      },
    ];
  });
}

export function generateBlogCategoryEntries() {
  const categories = ["partnerships", "eventParticipation", "topics"];
  return categories.flatMap((category) => {
    return [
      {
        url: `${siteURL}/blogs/category/${category}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.6,
      },
      {
        url: `${siteURL}/en/blogs/category/${category}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.6,
      },
    ];
  });
}

export function generateProfileEntries(profiles) {
  return profiles.flatMap((profile) => {
    const { pathName, updatedAt } = profile;
    if (!pathName) return [];

    return [
      {
        url: `${siteURL}/profile/${pathName}/products`,
        lastModified: new Date(updatedAt || Date.now()),
        changeFrequency: "weekly",
        priority: 0.6,
      },
      {
        url: `${siteURL}/en/profile/${pathName}/products`,
        lastModified: new Date(updatedAt || Date.now()),
        changeFrequency: "weekly",
        priority: 0.6,
      },
    ];
  });
}

export { siteURL };
