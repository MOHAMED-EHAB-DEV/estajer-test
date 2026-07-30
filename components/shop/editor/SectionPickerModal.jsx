"use client";

import React, { useState } from "react";
import { THEMES } from "@/components/shop/themes/registry";
import { FaTimes } from "@/components/ui/svgs/AdminIcons";
import { useTranslations } from "@/hooks/useTranslations";

export default function SectionPickerModal({
  lang,
  existingSections,
  onSelect,
  onAddAll,
  onClose,
  translate,
  userPlan = null,
  onUpgrade,
}) {
  const trans = useTranslations(translate);
  const tEditor = (key) => trans(`admin.editor.${key}`);
  const tShops = (key) => trans(`admin.shops.${key}`);

  const [activeThemeId, setActiveThemeId] = useState(THEMES[0]?.id);
  const isAr = lang === "ar";

  const activeTheme = THEMES.find((t) => t.id === activeThemeId) || THEMES[0];

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-modal flex items-center justify-center p-4 animate-in fade-in duration-200"
      style={{
        background: "rgba(15, 23, 42, 0.45)",
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      {/* Modal Panel */}
      <div
        className="relative w-full max-w-5xl max-h-[88vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 rounded-2xl"
        style={{
          background: "#ffffff",
          borderWidth: "1px",
          borderStyle: "solid",
          borderColor: "hsl(220 15% 90%)",
          boxShadow:
            "0 24px 64px -12px rgba(15, 23, 42, 0.12), 0 0 0 1px hsl(220 15% 90%)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-6 py-4 flex items-center justify-between shrink-0"
          style={{
            borderBottomWidth: "1px",
            borderBottomStyle: "solid",
            borderBottomColor: "hsl(220 15% 90%)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{
                background: "hsl(var(--primary-hsl, 24 89% 61%) / 0.1)",
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="w-4 h-4"
                style={{ color: "var(--color-primary, #f48a42)" }}
              >
                <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z" />
              </svg>
            </div>
            <div>
              <h2
                className="text-sm font-bold leading-tight"
                style={{ color: "hsl(225 35% 18%)" }}
              >
                {tEditor("sectionPickerTitle")}
              </h2>
              <p
                className="text-[11px] mt-0.5"
                style={{ color: "hsl(220 10% 55%)" }}
              >
                {tShops("chooseSectionToAdd")}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
            style={{
              background: "hsl(220 12% 95%)",
              color: "hsl(220 10% 50%)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "hsl(220 12% 90%)";
              e.currentTarget.style.color = "hsl(225 35% 18%)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "hsl(220 12% 95%)";
              e.currentTarget.style.color = "hsl(220 10% 50%)";
            }}
          >
            <FaTimes className="w-3 h-3" />
          </button>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Left — Theme Tabs */}
          <div
            className="w-44 md:w-56 shrink-0 flex flex-col overflow-y-auto py-3"
            style={{
              borderInlineEndWidth: "1px",
              borderInlineEndStyle: "solid",
              borderInlineEndColor: "hsl(220 15% 90%)",
              background: "hsl(220 15% 97%)",
            }}
          >
            <p
              className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest px-4 mb-2"
              style={{ color: "hsl(220 10% 45%)" }}
            >
              {tEditor("themes")}
            </p>
            {THEMES.map((theme) => {
              const isActive = activeThemeId === theme.id;
              const isLocked = theme.id !== "classic" && userPlan === "starter";
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setActiveThemeId(theme.id)}
                  className="w-full text-start px-3 py-2.5 mx-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2.5"
                  style={{
                    width: "calc(100% - 16px)",
                    background: isActive
                      ? "hsl(var(--primary-hsl, 24 89% 61%) / 0.08)"
                      : "transparent",
                    color: isActive
                      ? "var(--color-primary, #f48a42)"
                      : isLocked
                        ? "hsl(220 10% 60%)"
                        : "hsl(220 10% 45%)",
                    borderInlineStartWidth: "2px",
                    borderInlineStartStyle: "solid",
                    borderInlineStartColor: isActive
                      ? "var(--color-primary, #f48a42)"
                      : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "hsl(220 12% 93%)";
                      e.currentTarget.style.color = "hsl(225 35% 18%)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = isLocked
                        ? "hsl(220 10% 60%)"
                        : "hsl(220 10% 45%)";
                    }
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <span className="flex items-center gap-1.5 font-bold">
                      <span className="truncate">
                        {isAr ? theme.label.ar : theme.label.en}
                      </span>
                      {isLocked && (
                        <svg
                          className="w-3 h-3 text-neutral-400 shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                          />
                        </svg>
                      )}
                    </span>
                    <span
                      className="block text-[9px] mt-0.5 font-medium"
                      style={{
                        color: isActive
                          ? "hsl(var(--primary-hsl, 24 89% 61%) / 0.8)"
                          : "hsl(220 10% 60%)",
                      }}
                    >
                      {theme.sections.length} {tShops("sectionsCount")}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right — Section Cards */}
          <div
            className="flex-1 overflow-y-auto p-5 md:p-6 flex flex-col"
            style={{ background: "#ffffff" }}
          >
            {/* Theme description */}
            <div
              className="mb-5 p-4 rounded-xl"
              style={{
                background: "hsl(220 15% 97%)",
                borderWidth: "1px",
                borderStyle: "solid",
                borderColor: "hsl(220 15% 90%)",
              }}
            >
              <p
                className="text-xs font-medium"
                style={{ color: "hsl(220 10% 45%)" }}
              >
                {isAr ? activeTheme.description.ar : activeTheme.description.en}
              </p>
            </div>

            {activeTheme.id !== "classic" && userPlan === "starter" ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 md:p-10 bg-gradient-to-br from-[#fff8f3] to-[#fff5ec] border border-[#FDE5D0] rounded-2xl my-auto">
                <div className="w-14 h-14 rounded-full bg-[#FFF5EC] border border-[#FDE5D0] flex items-center justify-center mb-5 shadow-sm">
                  <svg
                    className="w-6 h-6 text-[#F97316]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                    />
                  </svg>
                </div>
                <h3 className="text-sm font-black text-slate-800 mb-2">
                  {isAr ? "باقة النمو مطلوبة" : "Growth Plan Required"}
                </h3>
                <p className="text-[11px] text-neutral-500 max-w-md leading-relaxed mb-5">
                  {isAr
                    ? `ثيم "${activeTheme.label.ar}" ومميزاته الحصرية متوفرة فقط لمشتركي باقة النمو. قم بترقية متجرك الآن للوصول لجميع الثيمات والمميزات الرائعة.`
                    : `The "${activeTheme.label.en}" theme and its exclusive features are only available to Growth plan subscribers. Upgrade your shop now to unlock all themes and premium features.`}
                </p>
                {onUpgrade ? (
                  <button
                    type="button"
                    onClick={onUpgrade}
                    className="inline-flex items-center justify-center gap-2 bg-[#F97316] text-white font-extrabold px-5 py-2.5 rounded-full hover:bg-[#ea580c] transition-all text-[10px] shadow-md shadow-orange-500/10"
                  >
                    {isAr
                      ? "ترقية إلى باقة النمو الآن"
                      : "Upgrade to Growth Now"}
                    <svg
                      className={`w-3 h-3 ${isAr ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </button>
                ) : (
                  <a
                    href={
                      isAr
                        ? "/premium-checkout?plan=growth"
                        : "/en/premium-checkout?plan=growth"
                    }
                    className="inline-flex items-center justify-center gap-2 bg-[#F97316] text-white font-extrabold px-5 py-2.5 rounded-full hover:bg-[#ea580c] transition-all text-[10px] shadow-md shadow-orange-500/10"
                  >
                    {isAr ? "ترقية إلى النمو الآن" : "Upgrade to Growth Now"}
                    <svg
                      className={`w-3 h-3 ${isAr ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </a>
                )}
              </div>
            ) : (
              <>
                {/* Header bar */}
                <div className="flex items-center justify-between mb-4">
                  <h3
                    className="text-xs font-bold uppercase tracking-widest"
                    style={{ color: "hsl(220 10% 50%)" }}
                  >
                    {tShops("availableSections")}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      onAddAll(activeTheme.id);
                      onClose();
                    }}
                    className="text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all"
                    style={{
                      background: "hsl(var(--primary-hsl, 24 89% 61%) / 0.1)",
                      color: "var(--color-primary, #f48a42)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "hsl(var(--primary-hsl, 24 89% 61%) / 0.18)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        "hsl(var(--primary-hsl, 24 89% 61%) / 0.1)";
                    }}
                  >
                    + {tShops("addAllSections")}
                  </button>
                </div>

                {/* Section Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  {activeTheme.sections.map((section) => {
                    const existingSection = existingSections?.find(
                      (s) => (s?.sectionType || s) === section.id,
                    );
                    const isAdded = !!existingSection;
                    const isSameTheme =
                      existingSection &&
                      (existingSection.themeId === activeTheme.id ||
                        existingSection === activeTheme.id);
                    const isDisabled = isSameTheme && !section.allowMultiple;
                    const isReplaceable =
                      isAdded && !isSameTheme && !section.allowMultiple;

                    return (
                      <button
                        key={section.id}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => {
                          onSelect({ themeId: activeTheme.id, section });
                          onClose();
                        }}
                        className="group text-start flex flex-col rounded-xl overflow-hidden transition-all duration-300 shadow-sm"
                        style={
                          isDisabled
                            ? {
                                opacity: 0.45,
                                filter: "grayscale(0.6)",
                                cursor: "not-allowed",
                                background: "hsl(220 15% 97%)",
                                borderWidth: "1px",
                                borderStyle: "solid",
                                borderColor: "hsl(220 15% 92%)",
                              }
                            : {
                                background: "hsl(220 15% 98% / 0.5)",
                                borderWidth: "1px",
                                borderStyle: "solid",
                                borderColor: "hsl(220 15% 90%)",
                              }
                        }
                        onMouseEnter={(e) => {
                          if (!isDisabled) {
                            e.currentTarget.style.borderWidth = "1px";
                            e.currentTarget.style.borderStyle = "solid";
                            e.currentTarget.style.borderColor =
                              "hsl(var(--primary-hsl, 24 89% 61%) / 0.5)";
                            e.currentTarget.style.background = "#ffffff";
                            e.currentTarget.style.transform =
                              "translateY(-2px)";
                            e.currentTarget.style.boxShadow =
                              "0 12px 32px -8px rgba(15, 23, 42, 0.08)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isDisabled) {
                            e.currentTarget.style.borderWidth = "1px";
                            e.currentTarget.style.borderStyle = "solid";
                            e.currentTarget.style.borderColor =
                              "hsl(220 15% 90%)";
                            e.currentTarget.style.background =
                              "hsl(220 15% 98% / 0.5)";
                            e.currentTarget.style.transform = "none";
                            e.currentTarget.style.boxShadow = "none";
                          }
                        }}
                      >
                        {/* Section Icon Thumbnail */}
                        <div
                          className="w-full h-24 md:h-28 flex items-center justify-center relative overflow-hidden"
                          style={{
                            background: "hsl(220 15% 96% / 0.7)",
                            borderBottomWidth: "1px",
                            borderBottomStyle: "solid",
                            borderBottomColor: "hsl(220 15% 92%)",
                          }}
                        >
                          {/* Subtle grid pattern */}
                          <div
                            className="absolute inset-0"
                            style={{
                              backgroundImage:
                                "radial-gradient(hsl(220 10% 88%) 1px, transparent 1px)",
                              backgroundSize: "20px 20px",
                              opacity: 0.45,
                            }}
                          />

                          {/* Icon */}
                          {section.icon && section.icon.startsWith("<svg") ? (
                            <span
                              className="relative z-10 w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 [&>svg]:w-full [&>svg]:h-full"
                              style={{
                                background:
                                  "hsl(var(--primary-hsl, 24 89% 61%) / 0.08)",
                                color: "var(--color-primary, #f48a42)",
                                padding: "10px",
                              }}
                              dangerouslySetInnerHTML={{ __html: section.icon }}
                            />
                          ) : (
                            <span
                              className="relative z-10 w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 [&>svg]:w-full [&>svg]:h-full text-2xl"
                              style={{
                                background:
                                  "hsl(var(--primary-hsl, 24 89% 61%) / 0.08)",
                                color: "var(--color-primary, #f48a42)",
                                padding: "10px",
                              }}
                            >
                              {section.icon}
                            </span>
                          )}

                          {/* Status overlays */}
                          {isDisabled && (
                            <div className="absolute inset-0 flex items-end justify-end p-2">
                              <span
                                className="text-[8px] md:text-[9px] font-bold px-2 py-0.5 rounded-md"
                                style={{
                                  background: "hsl(220 15% 90%)",
                                  color: "hsl(220 10% 50%)",
                                }}
                              >
                                {tEditor("alreadyAdded")}
                              </span>
                            </div>
                          )}
                          {isReplaceable && (
                            <div className="absolute inset-0 flex items-end justify-end p-2">
                              <span
                                className="text-[8px] md:text-[9px] font-bold px-2 py-0.5 rounded-md shadow-sm"
                                style={{
                                  background: "var(--color-primary, #f48a42)",
                                  color: "#fff",
                                }}
                              >
                                {tEditor("replaceTheme")}
                              </span>
                            </div>
                          )}

                          {/* Hover add indicator */}
                          {!isDisabled && (
                            <div
                              className="absolute top-2 end-2 w-6 h-6 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-md"
                              style={{
                                background: "var(--color-primary, #f48a42)",
                                color: "#fff",
                              }}
                            >
                              <svg
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                className="w-3 h-3"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 3a.75.75 0 01.75.75V9h5.25a.75.75 0 010 1.5H10.75v5.25a.75.75 0 01-1.5 0V10.5H4a.75.75 0 010-1.5h5.25V3.75A.75.75 0 0110 3z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Section Info */}
                        <div className="p-3 flex flex-col gap-1 w-full">
                          <div className="flex items-center justify-between gap-1 w-full">
                            <h4
                              className="text-xs font-bold truncate transition-colors duration-200"
                              style={{
                                color: isDisabled
                                  ? "hsl(220 10% 60%)"
                                  : "hsl(225 35% 18%)",
                              }}
                            >
                              {isAr ? section.label.ar : section.label.en}
                            </h4>
                            {section.allowMultiple && (
                              <span
                                className="text-[7px] md:text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase shrink-0"
                                style={{
                                  background: "hsl(220 12% 93%)",
                                  color: "hsl(220 10% 50%)",
                                }}
                              >
                                {tShops("multi")}
                              </span>
                            )}
                          </div>
                          <p
                            className="text-[10px] md:text-[11px] leading-relaxed line-clamp-2"
                            style={{ color: "hsl(220 10% 55%)" }}
                          >
                            {isAr
                              ? section.description.ar
                              : section.description.en}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
