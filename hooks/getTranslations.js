import { cache } from "react";

const loadTranslations = cache(async (lang = "ar", namespace = "all") => {
  try {
    const translations = await import(
      `../public/translations/${lang}/${namespace}.json`
    );
    return translations.default;
  } catch (error) {
    console.warn(`Failed to load translation: ${lang}/${namespace}.json`);
    return {};
  }
});

export async function getTranslations(lang, namespaces = ["all"]) {
  // console.log("namespaces: ", namespaces);
  const actualLang = lang === "ar" ? "ar" : "en";

  // Load multiple namespaces and merge them
  const translationPromises = [...namespaces, "shared"].map((ns) =>
    loadTranslations(actualLang, ns)
  );

  const translationsArray = await Promise.all(translationPromises);

  // Merge all translations
  const mergedTranslations = Object.assign({}, ...translationsArray);

  return (path) => {
    if (!path) return mergedTranslations;
    const keys = path.split(".");
    const result = keys.reduce(
      (acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined),
      mergedTranslations
    );
    if (!result) console.log("Missing: ", path);
    return result || "Missing: " + path;
  };
}
