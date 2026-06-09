// Fetch categories and subcategories from database
async function fetchCategoriesFromDB(seo = false) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/categories?mainOnly=true&includeSubcategories=true&status=active&seo=${seo}`,
      { next: { revalidate: 60 * 60 * 24 * 2 }, tags: ["categories"] }, // Cache for 2 days
    );
    if (res.ok) {
      const data = await res.json();
      return data.success ? data.data : null;
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch categories from DB:", error);
    return [];
  }
}

export async function categories({ lang, seo }) {
  const dbCategories = await fetchCategoriesFromDB(seo);

  if (dbCategories && dbCategories?.length > 0) {
    // Transform DB categories to the expected format
    return dbCategories.map((cat) => ({
      _id: cat._id,
      key: cat.key,
      label: lang === "en" ? cat.nameEn : cat.nameAr,
      href: `/${cat.key
        .toLowerCase()
        .replace(/([A-Z])/g, "-$1")
        .replace(/^-/, "")}`,
      ...(seo
        ? {
            image: cat.image,
            seoTitleAr: cat.seoTitleAr,
            seoTitleEn: cat.seoTitleEn,
            seoDescriptionAr: cat.seoDescriptionAr,
            seoDescriptionEn: cat.seoDescriptionEn,
            seoKeywordsAr: cat.seoKeywordsAr,
            seoKeywordsEn: cat.seoKeywordsEn,
            richContentAr: cat.richContentAr,
            richContentEn: cat.richContentEn,
          }
        : {}),
    }));
  }
  // add default category
  return [{ key: "default", label: "Default", href: "/default" }];
}

export async function subCategories({ lang, seo = false }) {
  const dbCategories = await fetchCategoriesFromDB(seo);

  if (dbCategories && dbCategories?.length > 0) {
    // Transform DB categories to the expected format for subcategories
    const subCategoriesMap = {};
    for (const cat of dbCategories) {
      if (cat.subcategories && cat.subcategories?.length > 0) {
        subCategoriesMap[cat.key] = cat.subcategories.map((sub) => ({
          _id: sub._id,
          key: sub.key,
          label: lang === "en" ? sub.nameEn : sub.nameAr,
          ...(seo
            ? {
                image: sub.image || cat.image,
                seoTitleAr: sub.seoTitleAr || "",
                seoTitleEn: sub.seoTitleEn || "",
                seoDescriptionAr: sub.seoDescriptionAr || "",
                seoDescriptionEn: sub.seoDescriptionEn || "",
                seoKeywordsAr: sub.seoKeywordsAr || "",
                seoKeywordsEn: sub.seoKeywordsEn || "",
                richContentAr: sub.richContentAr || "",
                richContentEn: sub.richContentEn || "",
              }
            : {}),
        }));
      } else {
        subCategoriesMap[cat.key] = [];
      }
    }
    return subCategoriesMap;
  }
  // add default subcategory
  return { default: [{ key: "default", label: "Default" }] };
}
