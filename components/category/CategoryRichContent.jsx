"use client";

import { useTranslations } from "@/hooks/useTranslations";

export default function CategoryRichContent({
  categoryName,
  richContent,
  lang,
  translate,
}) {
  const trans = useTranslations(translate);
  const t = (text) => trans(`categoryRichContent.${text}`);

  if (!richContent) return null;

  return (
    <section
      className="max-w-screen-2xl mx-auto px-4  mb-16"
      aria-label={t("aboutCategory")}
    >
      <div className="bg-gradient-to-br from-gray-50 via-white to-orange-50/30 rounded-2xl border border-gray-100 p-6 shadow-sm">
        {/* Rich Content */}
        <div
          className="prose prose-gray max-w-none text-gray-700 leading-relaxed text-base md:text-lg quill-content"
          dir={lang === "ar" ? "rtl" : "ltr"}
          dangerouslySetInnerHTML={{ __html: richContent }}
        />
      </div>
    </section>
  );
}
