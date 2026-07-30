"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  FaSave,
  FaArrowLeft,
  FaChevronLeft,
  FaChevronRight,
  FaEdit,
  FaTimes,
} from "@/components/ui/svgs/AdminIcons";
import Button from "@/components/ui/Button";

const VIEWPORT_MODES = [
  {
    id: "responsive",
    label: "Responsive",
    maxWidth: null,
    width: "100%",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="w-4 h-4"
      >
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M6 21h12M12 17v4M17 7l3 3-3 3M7 7l-3 3 3 3" />
      </svg>
    ),
  },
  {
    id: "desktop",
    label: "Desktop",
    maxWidth: null,
    width: "1400px",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="w-4 h-4"
      >
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
  {
    id: "tablet",
    label: "Tablet",
    maxWidth: "768px",
    width: "768px",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="w-4 h-4"
      >
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <circle cx="12" cy="18" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    id: "mobile",
    label: "Mobile",
    maxWidth: "390px",
    width: "390px",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="w-4 h-4"
      >
        <rect x="6" y="2" width="12" height="20" rx="2" />
        <circle cx="12" cy="18" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
];

export default function PreviewSidebarLayout({
  title,
  subtitle,
  sections,
  activeSection,
  setActiveSection,
  activeSectionContent,
  onSave,
  isSubmitting,
  onBack,
  previewContent,
  previewUrl,
  iframeRef,
  t,
  lang,
  nestedPanelContent,
  onNestedBack,
  nestedTitle,
  sidebarFooter,
  headerRightExtra,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [viewportMode, setViewportMode] = useState("responsive");
  const editPanelRef = useRef(null);
  const isRtl = lang === "en";

  const currentViewport = VIEWPORT_MODES.find((m) => m.id === viewportMode);

  useEffect(() => {
    if (activeSection) {
      if (!previewUrl) {
        setTimeout(() => {
          const element = document.getElementById(
            `preview-section-${activeSection}`,
          );
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
          } else if (
            activeSection === "sliders" ||
            activeSection === "offer-banners"
          ) {
            const firstItem = document.getElementById(
              `preview-section-${activeSection === "sliders" ? "slider" : "banner"}-0`,
            );
            if (firstItem)
              firstItem.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 100);
      } else if (iframeRef?.current) {
        setTimeout(() => {
          iframeRef.current?.contentWindow?.postMessage(
            { type: "SHOP_PREVIEW_SCROLL", sectionId: activeSection },
            "*",
          );
        }, 100);
      }
    }
  }, [activeSection, previewUrl, iframeRef]);

  const handleSectionClick = (sectionId) => setActiveSection(sectionId);
  const closeEditPanel = () => setActiveSection(null);

  return (
    <div
      className="flex flex-col overflow-hidden h-dvh"
      style={{ background: "hsl(220 15% 97%)" }}
    >
      {/* ── Top Bar ─────────────────────────────────────────────────────── */}
      <div
        className="h-14 flex items-center justify-between px-4 shrink-0 z-50 shadow-sm"
        style={{
          background: "#ffffff",
          borderBottomWidth: "1px",
          borderBottomStyle: "solid",
          borderBottomColor: "hsl(220 15% 90%)",
        }}
      >
        {/* Left: Back + Title */}
        <div className="flex items-center gap-3 min-w-0 lg:pe-28">
          <button
            onClick={onBack}
            type="button"
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all shrink-0"
            style={{
              background: "hsl(220 12% 95%)",
              color: "hsl(220 10% 45%)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "hsl(220 12% 90%)";
              e.currentTarget.style.color = "hsl(225 35% 18%)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "hsl(220 12% 95%)";
              e.currentTarget.style.color = "hsl(220 10% 45%)";
            }}
          >
            <FaArrowLeft size={13} className="rtl:rotate-180" />
          </button>

          <div className="flex items-center gap-2 min-w-0">
            {/* Brand dot */}
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: "var(--color-primary, #f48a42)" }}
            />
            <h1
              className="text-sm font-bold leading-tight truncate"
              style={{ color: "hsl(225 35% 18%)" }}
            >
              {title}
            </h1>
            {subtitle && (
              <>
                <span style={{ color: "hsl(220 10% 80%)" }}>/</span>
                <span
                  className="text-xs truncate font-medium"
                  style={{ color: "hsl(220 10% 55%)" }}
                >
                  {subtitle}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Center: Viewport Toggle */}
        <div
          className="items-center gap-0.5 rounded-lg p-1 flex"
          style={{ background: "hsl(220 12% 95%)" }}
        >
          {VIEWPORT_MODES.map((mode) => (
            <button
              key={mode.id}
              type="button"
              title={t(mode.id)}
              onClick={() => setViewportMode(mode.id)}
              className="flex items-center gap-1.5 px-3 h-7 rounded-md text-[11px] font-semibold transition-all"
              style={
                viewportMode === mode.id
                  ? {
                      background: "#fff",
                      color: "hsl(225 35% 18%)",
                      boxShadow:
                        "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
                    }
                  : { color: "hsl(220 10% 50%)" }
              }
              onMouseEnter={(e) => {
                if (viewportMode !== mode.id)
                  e.currentTarget.style.color = "hsl(225 35% 18%)";
              }}
              onMouseLeave={(e) => {
                if (viewportMode !== mode.id)
                  e.currentTarget.style.color = "hsl(220 10% 50%)";
              }}
            >
              {mode.icon}
              <span className="hidden lg:inline">{t(mode.id)}</span>
            </button>
          ))}
        </div>

        {/* Right: Save & Extra actions */}
        <div className="flex items-center gap-2">
          {headerRightExtra}
          <Button
            type="button"
            onPress={onSave}
            isLoading={isSubmitting}
            className="lg:px-5 px-4 h-9 gap-2 min-w-0 rounded-lg text-sm font-bold text-white shadow-md hover:opacity-90 transition-opacity"
            style={{ background: "var(--color-primary, #f48a42)" }}
          >
            <FaSave size={13} />
            <span>{t("save")}</span>
            <span className="hidden lg:inline">{t("changes")}</span>
          </Button>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Preview Area */}
        <div
          className={`flex-1 flex flex-col overflow-x-auto overflow-y-hidden transition-all duration-300 py-3 ${
            sidebarOpen ? "ps-0 md:ps-[320px]" : "ps-0"
          }`}
        >
          {/* Device label */}
          {currentViewport.maxWidth && (
            <div
              className="flex items-center justify-center gap-2 mb-3 shrink-0 w-full mx-auto"
              style={{ maxWidth: currentViewport.maxWidth }}
            >
              <div
                className="h-px flex-1"
                style={{ background: "hsl(220 10% 88%)" }}
              />
              <span
                className="text-[10px] font-semibold uppercase tracking-widest px-2"
                style={{ color: "hsl(220 10% 60%)" }}
              >
                {t(currentViewport.id)} — {currentViewport.maxWidth}
              </span>
              <div
                className="h-px flex-1"
                style={{ background: "hsl(220 10% 88%)" }}
              />
            </div>
          )}

          {/* Preview frame */}
          <div
            className="transition-all duration-500 flex-1 flex flex-col h-full mx-auto"
            style={{
              width: currentViewport.width || "100%",
              maxWidth: currentViewport.id === "mobile" ? "100%" : undefined,
              paddingInline: currentViewport.maxWidth ? "0" : "0.75rem",
            }}
          >
            <div
              className="bg-white rounded-xl overflow-hidden flex-1 flex flex-col h-full"
              style={{
                boxShadow: currentViewport.maxWidth
                  ? "0 0 0 6px hsl(220 15% 92%), 0 24px 64px -12px rgba(0,0,0,0.12)"
                  : "0 4px 24px -4px rgba(0,0,0,0.04)",
                borderWidth: "1px",
                borderStyle: "solid",
                borderColor: "hsl(220 15% 90%)",
              }}
            >
              {previewUrl ? (
                <iframe
                  ref={iframeRef}
                  src={previewUrl}
                  className="w-full flex-1 border-0 h-full"
                  style={{ minHeight: "0" }}
                  title="Shop Preview"
                />
              ) : (
                <div
                  id="preview-scroll-container"
                  className="overflow-auto scroll-smooth flex-1"
                  style={{ maxHeight: "calc(100vh - 80px)" }}
                >
                  {previewContent}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Left Sidebar ─────────────────────────────────────────────── */}
        <div
          className={`fixed bottom-0 w-[320px] flex flex-col transition-transform duration-300 z-40 start-0 ${
            sidebarOpen
              ? "translate-x-0"
              : isRtl
                ? "-translate-x-full"
                : "translate-x-full"
          }`}
          style={{
            top: "56px",
            background: "#ffffff",
            borderInlineEndWidth: "1px",
            borderInlineEndStyle: "solid",
            borderInlineEndColor: "hsl(220 15% 90%)",
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
          }}
        >
          {/* Sidebar Header */}
          <div
            className="flex items-center justify-between px-4 py-3 shrink-0"
            style={{
              borderBottomWidth: "1px",
              borderBottomStyle: "solid",
              borderBottomColor: "hsl(220 15% 90%)",
            }}
          >
            <div className="flex items-center gap-2">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="w-4 h-4"
                style={{ color: "hsl(220 10% 50%)" }}
              >
                <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z" />
              </svg>
              <span
                className="text-sm font-bold"
                style={{ color: "hsl(225 35% 18%)" }}
              >
                {t("shopSettings")}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="w-6 h-6 rounded-md flex items-center justify-center transition-all"
              style={{ color: "hsl(220 10% 55%)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "hsl(220 12% 95%)";
                e.currentTarget.style.color = "hsl(225 35% 18%)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "hsl(220 10% 55%)";
              }}
            >
              <FaTimes size={11} />
            </button>
          </div>

          {/* Static Nav Items */}
          <div className="px-3 pt-3 pb-2 flex flex-col gap-1 shrink-0">
            {sections.map((section) => (
              <button
                data-sidebar-item
                type="button"
                key={section.id}
                onClick={() => handleSectionClick(section.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-start transition-all rounded-lg group"
                style={
                  activeSection === section.id
                    ? {
                        background:
                          "hsl(var(--primary-hsl, 24 89% 61%) / 0.08)",
                        color: "var(--color-primary, #f48a42)",
                      }
                    : { color: "hsl(220 10% 45%)" }
                }
                onMouseEnter={(e) => {
                  if (activeSection !== section.id) {
                    e.currentTarget.style.background = "hsl(220 12% 95%)";
                    e.currentTarget.style.color = "hsl(225 35% 18%)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeSection !== section.id) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "hsl(220 10% 45%)";
                  }
                }}
              >
                <span
                  className="shrink-0"
                  style={{
                    color:
                      activeSection === section.id
                        ? "var(--color-primary, #f48a42)"
                        : "hsl(220 10% 50%)",
                  }}
                >
                  {section.icon}
                </span>
                <span className="text-sm font-semibold truncate flex-1">
                  {section.label}
                </span>
                <FaEdit
                  size={11}
                  className="shrink-0 opacity-0 group-hover:opacity-60 transition-opacity"
                />
              </button>
            ))}
          </div>

          {/* Divider */}
          <div
            className="mx-3 mb-1"
            style={{ height: "1px", background: "hsl(220 15% 92%)" }}
          />

          {/* Scrollable content (footer injected from parent — sections list etc) */}
          <div
            className="flex-1 overflow-y-auto custom-scrollbar px-3 pb-4 pt-2"
            style={{ overflowY: "overlay" }}
          >
            {sidebarFooter}
          </div>
        </div>

        {/* Sidebar Toggle (collapsed) */}
        {!sidebarOpen && (
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="fixed top-1/2 -translate-y-1/2 w-7 h-14 flex items-center justify-center transition-all z-50 start-0 rounded-e-xl shadow-md"
            style={{
              background: "#ffffff",
              borderInlineEndWidth: "1px",
              borderInlineEndStyle: "solid",
              borderInlineEndColor: "hsl(220 15% 90%)",
              borderTopWidth: "1px",
              borderTopStyle: "solid",
              borderTopColor: "hsl(220 15% 90%)",
              borderBottomWidth: "1px",
              borderBottomStyle: "solid",
              borderBottomColor: "hsl(220 15% 90%)",
              color: "hsl(220 10% 45%)",
            }}
          >
            {isRtl ? <FaChevronRight size={11} /> : <FaChevronLeft size={11} />}
          </button>
        )}

        {/* ── Edit Panel ───────────────────────────────────────────────── */}
        {activeSection && (
          <>
            <div
              ref={editPanelRef}
              className={`fixed bottom-0 start-0 w-[400px] max-w-[90vw] flex flex-col z-50 animate-in duration-200 ${
                isRtl ? "slide-in-from-left" : "slide-in-from-right"
              }`}
              style={{
                top: "56px",
                background: "hsl(220 15% 97%)",
                borderInlineStart: "none",
                borderInlineEndWidth: "1px",
                borderInlineEndStyle: "solid",
                borderInlineEndColor: "hsl(220 12% 88%)",
                boxShadow: "4px 0 32px -8px rgba(0,0,0,0.18)",
                marginInlineStart: "0",
                paddingBottom: "env(safe-area-inset-bottom, 0px)",
              }}
            >
              {/* Edit Panel Header */}
              <div
                className="flex items-center gap-2.5 px-4 py-3 shrink-0"
                style={{
                  background: "#fff",
                  borderBottomWidth: "1px",
                  borderBottomStyle: "solid",
                  borderBottomColor: "hsl(220 12% 91%)",
                }}
              >
                <button
                  type="button"
                  onClick={nestedPanelContent ? onNestedBack : closeEditPanel}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-all shrink-0"
                  style={{
                    background: "hsl(220 12% 94%)",
                    color: "hsl(220 12% 45%)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "hsl(220 12% 88%)";
                    e.currentTarget.style.color = "hsl(220 12% 25%)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "hsl(220 12% 94%)";
                    e.currentTarget.style.color = "hsl(220 12% 45%)";
                  }}
                >
                  {isRtl ? (
                    <FaChevronLeft size={11} />
                  ) : (
                    <FaChevronRight size={11} />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <h3
                    className="text-[13px] font-bold truncate"
                    style={{ color: "hsl(225 35% 18%)" }}
                  >
                    {nestedTitle ||
                      sections.find((s) => s.id === activeSection)?.label}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={closeEditPanel}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-all shrink-0"
                  style={{ color: "hsl(220 12% 55%)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "hsl(220 12% 93%)";
                    e.currentTarget.style.color = "hsl(220 12% 25%)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "hsl(220 12% 55%)";
                  }}
                >
                  <FaTimes size={11} />
                </button>
              </div>

              {/* Edit Panel Content */}
              <div className="flex-1 overflow-y-auto relative">
                {nestedPanelContent ? (
                  <div
                    className="absolute inset-0 z-10 animate-in slide-in-from-right-5 duration-300"
                    style={{ background: "hsl(220 15% 97%)" }}
                  >
                    <div
                      className="p-5 h-full overflow-y-auto custom-scrollbar"
                      style={{ overflowY: "overlay" }}
                    >
                      {nestedPanelContent}
                    </div>
                  </div>
                ) : null}
                <div
                  className="p-5 h-full overflow-y-auto custom-scrollbar"
                  style={{ overflowY: "overlay" }}
                >
                  {activeSectionContent}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
