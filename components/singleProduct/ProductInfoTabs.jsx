"use client";

import { useState } from "react";
import { useTranslations } from "@/hooks/useTranslations";

const STATUS_MAP = {
  excellent: { ar: "ممتازة", en: "Excellent" },
  veryGood: { ar: "جيدة جداً", en: "Very Good" },
  good: { ar: "جيدة", en: "Good" },
};

/* ── tiny inline SVG helpers ── */
function CheckIcon({ className = "w-4 h-4" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function BoltIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 2L4.09 12.96A1 1 0 0 0 5 14.5h5.5l-1 7.5 8.91-10.96A1 1 0 0 0 17.5 9.5H12l1-7.5z" />
    </svg>
  );
}

function CircleCheckIcon({ className = "w-4 h-4 text-green-500" }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="#22C55E"
      className={className}
    >
      <path d="M13.5625 6.78125C13.5625 10.5273 10.5 13.5625 6.78125 13.5625C3.03516 13.5625 0 10.5273 0 6.78125C0 3.0625 3.03516 0 6.78125 0C10.5 0 13.5625 3.0625 13.5625 6.78125ZM5.98828 10.3906L11.0195 5.35938C11.1836 5.19531 11.1836 4.89453 11.0195 4.73047L10.3906 4.12891C10.2266 3.9375 9.95312 3.9375 9.78906 4.12891L5.6875 8.23047L3.74609 6.31641C3.58203 6.125 3.30859 6.125 3.14453 6.31641L2.51562 6.91797C2.35156 7.08203 2.35156 7.38281 2.51562 7.54688L5.35938 10.3906C5.52344 10.5547 5.82422 10.5547 5.98828 10.3906Z" />
    </svg>
  );
}

function TagIcon({ className = "w-4 h-4" }) {
  return (
    <svg
      width="15"
      height="15"
      className={className}
      viewBox="0 0 15 15"
      fill="#F48A42"
    >
      <path d="M0 6.91797V1.3125C0 0.601562 0.574219 0 1.3125 0H6.89062C7.24609 0 7.57422 0.164062 7.82031 0.410156L13.5898 6.17969C14.1094 6.69922 14.1094 7.54688 13.5898 8.03906L8.01172 13.6172C7.51953 14.1367 6.67188 14.1367 6.15234 13.6172L0.382812 7.84766C0.136719 7.60156 0 7.27344 0 6.91797ZM3.0625 1.75C2.32422 1.75 1.75 2.35156 1.75 3.0625C1.75 3.80078 2.32422 4.375 3.0625 4.375C3.77344 4.375 4.375 3.80078 4.375 3.0625C4.375 2.35156 3.77344 1.75 3.0625 1.75Z" />
    </svg>
  );
}

function InfoIcon({ className = "w-4 h-4" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

/* ── Main component ── */
export default function ProductInfoTabs({
  lang,
  translate,
  description,
  useCases = [],
  specs = [],
  features = [],
  status,
  quantity,
}) {
  const t = useTranslations(translate);
  const isAr = lang === "ar";

  // Filter empty rows — supports both bilingual (nameAr/nameEn) and flat (name) formats
  const validUseCases = (useCases || []).filter(
    (uc) => uc?.nameAr || uc?.nameEn || uc?.name,
  );
  const validSpecs = (specs || []).filter(
    (s) => s?.keyAr || s?.keyEn || s?.key,
  );
  const validFeatures = (features || []).filter(
    (f) => f?.titleAr || f?.titleEn || f?.title,
  );

  // Helpers to read either bilingual or flat field
  const ucName = (uc) => (isAr ? uc.nameAr || uc.name : uc.nameEn || uc.name);
  const specKey = (s) => (isAr ? s.keyAr || s.key : s.keyEn || s.key);
  const specValue = (s) => (isAr ? s.valueAr || s.value : s.valueEn || s.value);
  const featTitle = (f) => (isAr ? f.titleAr || f.title : f.titleEn || f.title);
  const featDesc = (f) => (isAr ? f.descAr || f.desc : f.descEn || f.desc);

  const tabs = [
    { id: "desc", label: t("product.tabs.description") },
    ...(validSpecs.length > 0
      ? [{ id: "specs", label: t("product.tabs.specs") }]
      : []),
    ...(validFeatures.length > 0
      ? [{ id: "features", label: t("product.tabs.features") }]
      : []),
  ];

  const [active, setActive] = useState("desc");
  const [descExpanded, setDescExpanded] = useState(false);

  const statusLabel =
    STATUS_MAP[status]?.[isAr ? "ar" : "en"] ||
    STATUS_MAP["excellent"]?.[isAr ? "ar" : "en"];

  return (
    <div className="mb-10 md:mt-6 mt-4 relative">
      {/* Tab Buttons */}
      <div className="flex flex-wrap gap-1 md:mb-6 mb-2 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            id={`tab-btn-${tab.id}`}
            onClick={() => setActive(tab.id)}
            className={`md:px-5 px-4 md:py-3 py-2 font-bold md:text-[1.05rem] text-sm border-b-2 transition-colors ${
              active === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-gray-400 hover:text-darkNavy"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Description ── */}
      <div
        id="tab-desc"
        aria-hidden={active !== "desc"}
        className={
          active === "desc"
            ? "relative opacity-100 transition-opacity duration-300"
            : "absolute top-0 left-0 w-full opacity-0 pointer-events-none -z-10"
        }
      >
        {(() => {
          const paras = description
            ? description
                .split(/\n{2,}/)
                .filter(Boolean)
                .map((p) => p.trim())
            : [];
          const first = paras.slice(0, 4);
          const rest = paras.slice(4);
          const hasMore = rest.length > 0;

          return (
            <div className="text-[#5B5656] text-[1rem] md:text-[1.1rem] lg:text-[1.2rem] leading-[2.1] whitespace-pre-line">
              {/* First 2 paragraphs — always fully visible */}
              {first.map((para, i) => (
                <p className="mb-4" key={i}>
                  {para}
                </p>
              ))}

              {/* Remaining paragraphs — in DOM for SEO, hidden visually when collapsed */}
              {hasMore && (
                <div
                  aria-hidden={!descExpanded}
                  style={{
                    maxHeight: descExpanded ? "9999px" : "0px",
                    overflow: "hidden",
                    transition: "max-height 0.5s ease",
                  }}
                  className={descExpanded ? "space-y-4 mb-4" : ""}
                >
                  {rest.map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              )}

              {/* Toggle button */}
              {hasMore && (
                <button
                  onClick={() => setDescExpanded((prev) => !prev)}
                  className="text-primary font-bold text-[1.1rem] flex items-center gap-2 hover:gap-3 transition-all"
                >
                  {descExpanded ? (
                    <>
                      {isAr ? "عرض أقل" : "Show less"}
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-3.5 h-3.5"
                      >
                        <polyline points="18 15 12 9 6 15" />
                      </svg>
                    </>
                  ) : (
                    <>
                      {isAr ? "عرض المزيد" : "Show more"}
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-3.5 h-3.5"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </>
                  )}
                </button>
              )}
            </div>
          );
        })()}

        {/* Use Cases + pills */}
        <div className="md:mt-6 mt-4 flex flex-wrap gap-3">
          {validUseCases.length > 0 && (
            <div className="w-full bg-gradient-to-l from-primary/5 to-transparent border border-primary/20 rounded-2xl md:p-6 p-4">
              <div className="font-bold text-darkNavy md:text-[1.1rem] text-[1rem] md:mb-4 mb-2 flex items-center gap-2">
                <span className="text-primary">
                  <BoltIcon />
                </span>
                {t("product.tabs.useCasesTitle")}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:gap-3 gap-2 md:text-[1rem] text-[0.9rem] text-[#5B5656]">
                {validUseCases.map((uc, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-primary flex-shrink-0">
                      <CheckIcon className="w-3 h-3" />
                    </span>
                    {ucName(uc)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {status && (
            <div className="inline-flex items-center gap-2 text-xs md:text-sm font-semibold text-gray-600 bg-gray-50 border border-gray-200 rounded-xl md:px-4 px-3 md:py-2 py-1.5">
              <CircleCheckIcon />
              {t("product.tabs.statusLabel")}:{" "}
              <strong className="text-darkNavy">{statusLabel}</strong>
            </div>
          )}

          {quantity > 0 && (
            <div className="inline-flex items-center gap-2 text-xs md:text-sm font-semibold text-gray-600 bg-gray-50 border border-gray-200 rounded-xl md:px-4 px-3 md:py-2 py-1.5">
              <span className="text-primary">
                <TagIcon />
              </span>
              {t("product.tabs.quantityLabel")}:{" "}
              <strong className="text-darkNavy">{quantity}</strong>
            </div>
          )}
        </div>
      </div>

      {/* ── Tab: Specs ── */}
      <div
        id="tab-specs"
        aria-hidden={active !== "specs"}
        className={
          active === "specs"
            ? "relative opacity-100 transition-opacity duration-300"
            : "absolute top-0 left-0 w-full opacity-0 pointer-events-none -z-10"
        }
      >
        <div className="rounded-2xl overflow-hidden border border-gray-100">
          <table className="w-full text-[0.9rem] md:text-[1rem] lg:text-[1.05rem]">
            <tbody>
              {validSpecs.map((spec, idx) => (
                <tr
                  key={idx}
                  className={`${
                    idx % 2 === 0 ? "bg-gray-50" : ""
                  } border-b border-gray-100`}
                >
                  <td className="md:px-5 px-3 md:py-4 py-3 text-gray-500 font-semibold w-2/5">
                    {specKey(spec)}
                  </td>
                  <td className="md:px-5 px-3 md:py-4 py-3 font-bold text-darkNavy">
                    {specValue(spec)}
                  </td>
                </tr>
              ))}
              {status && (
                <tr className={validSpecs.length % 2 === 0 ? "bg-gray-50" : ""}>
                  <td className="md:px-5 px-3 md:py-4 py-3 text-gray-500 font-semibold">
                    {t("product.tabs.statusLabel")}
                  </td>
                  <td className="md:px-5 px-3 md:py-4 py-3 font-bold text-green-600">
                    <span className="flex items-center gap-2">
                      <CircleCheckIcon className="w-4 h-4" />
                      {statusLabel}
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-gray-400 mt-4 flex items-center gap-2">
          <span className="text-primary">
            <InfoIcon />
          </span>
          {t("product.tabs.specsNote")}
        </p>
      </div>

      {/* ── Tab: Features ── */}
      <div
        id="tab-features"
        aria-hidden={active !== "features"}
        className={
          active === "features"
            ? "relative opacity-100 transition-opacity duration-300"
            : "absolute top-0 left-0 w-full opacity-0 pointer-events-none -z-10"
        }
      >
        <div className="space-y-3">
          {validFeatures.map((feat, idx) => (
            <div
              key={idx}
              className="flex items-start gap-4 md:p-4 p-3 rounded-2xl bg-gray-50 border border-gray-100"
            >
              <div className="md:w-12 md:h-12 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                <CheckIcon className="md:w-5 w-4 md:h-5 h-4" />
              </div>
              <div>
                <div className="font-bold md:text-[1rem] text-[0.95rem] mb-1">
                  {featTitle(feat)}
                </div>
                <div className="text-gray-500 md:text-sm text-[0.85rem] leading-relaxed">
                  {featDesc(feat)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
