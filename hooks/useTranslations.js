const reportedKeys = new Set();

function reportMissingKey(key) {
  if (!key || reportedKeys.has(key)) return;
  reportedKeys.add(key);

  if (typeof window !== "undefined") {
    const pageUrl = window.location.pathname + window.location.search;
    const lang = document.documentElement.lang || "ar";
    const userAgent = navigator.userAgent || "";

    fetch("/api/missing-translations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key,
        pageUrl,
        lang,
        source: "client",
        userAgent,
      }),
    }).catch(() => {});
  }
}

export function useTranslations(translate) {
  return (path) => {
    if (typeof translate === "function") return translate(path);
    const keys = path?.split(".");
    const result = keys?.reduce(
      (acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined),
      translate,
    );
    if (!result && path) {
      console.log("Missing: ", path);
      reportMissingKey(path);
    }
    return result !== undefined ? result : "Missing translation for: " + path;
  };
}

