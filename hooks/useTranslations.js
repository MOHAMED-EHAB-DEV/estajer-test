export function useTranslations(translate) {
  return (path) => {
    const keys = path?.split(".");
    const result = keys?.reduce(
      (acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined),
      translate
    );
    if (!result) console.log("Missing: ", path);
    return result !== undefined ? result : "Missing translation for: " + path;
  };
}
