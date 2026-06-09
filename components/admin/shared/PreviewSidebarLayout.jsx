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
  t,
  lang,
  nestedPanelContent,
  onNestedBack,
  nestedTitle,
  sidebarFooter,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [editPanelOpen, setEditPanelOpen] = useState(false);
  const editPanelRef = useRef(null);
  const isRtl = lang === "en";

  const handleSectionClick = (sectionId) => {
    setActiveSection(sectionId);
    setEditPanelOpen(true);

    // Scroll to section in preview
    setTimeout(() => {
      const element = document.getElementById(`preview-section-${sectionId}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (sectionId === "sliders" || sectionId === "offer-banners") {
        const firstItem = document.getElementById(
          `preview-section-${sectionId === "sliders" ? "slider" : "banner"}-0`,
        );
        if (firstItem) {
          firstItem.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    }, 100);
  };

  const closeEditPanel = () => {
    setEditPanelOpen(false);
    setActiveSection(null);
  };

  return (
    <div className="flex flex-col overflow-hidden bg-[#fef7f3] h-dvh">
      {/* Top Header Bar */}
      <div className="h-14 bg-white border-b border-neutral-200/80 flex items-center justify-between px-5 shrink-0 z-50 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            type="button"
            className="w-9 h-9 rounded-xl bg-neutral-50 hover:bg-neutral-100 flex items-center justify-center text-neutral-500 hover:text-neutral-700 transition-all shrink-0 border border-neutral-200/60"
          >
            <FaArrowLeft size={14} className="rtl:rotate-180" />
          </button>
          <div className="flex items-center gap-2.5 min-w-0">
            <h1 className="text-sm font-bold text-darkNavy leading-tight truncate">
              {title}
            </h1>
            {subtitle && (
              <>
                <span className="text-neutral-300">|</span>
                <span className="text-xs text-neutral-400 leading-tight truncate">
                  {subtitle}
                </span>
              </>
            )}
          </div>
        </div>
        {/* Save Button */}
        <Button
          type="button"
          onPress={onSave}
          isLoading={isSubmitting}
          className="px-6 h-10 rounded-xl text-sm font-bold text-white shadow-md shadow-primary/25"
        >
          <FaSave size={14} />
          {t("save")}
        </Button>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Preview Area */}
        <div
          className="flex-1 overflow-auto transition-all duration-300"
          style={{
            paddingInlineStart: sidebarOpen ? "350px" : "0",
          }}
        >
          <div className="mx-auto transition-all duration-500 py-4 h-full">
            <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-neutral-200/50">
              <div
                id="preview-scroll-container"
                className="overflow-auto scroll-smooth"
                style={{ maxHeight: "calc(100vh - 80px)" }}
              >
                {previewContent}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Section List */}
        <div
          className={`fixed bottom-0 w-[350px] bg-transparent flex flex-col transition-transform duration-300 z-40 start-0 ${
            sidebarOpen
              ? "translate-x-0"
              : isRtl
                ? "-translate-x-full"
                : "translate-x-full"
          }`}
          style={{ top: "56px" }}
        >
          <div className="flex-1 flex flex-col p-4 overflow-hidden relative">
            {/* Sidebar Header Card */}
            <div className="px-5 py-4 bg-white rounded-xl shadow-sm flex items-center shrink-0 mb-4 border border-neutral-200/50 relative">
              <h3 className="text-[15px] font-bold text-darkNavy flex gap-2">
                {t("shopSettings")}
              </h3>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="absolute top-1/2 -translate-y-1/2 end-3 w-7 h-7 rounded-lg hover:bg-neutral-100 flex items-center justify-center text-neutral-400 hover:text-neutral-600 transition-all"
              >
                <FaTimes size={12} />
              </button>
            </div>

            {/* Section Items Container */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pb-6">
              <div className="flex flex-col gap-[5px]">
                {sections.map((section) => (
                  <button
                    data-sidebar-item
                    type="button"
                    key={section.id}
                    onClick={() => handleSectionClick(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 text-start transition-all group bg-white rounded-xl shadow-sm border border-neutral-200/50 hover:border-primary/30 ${
                      activeSection === section.id && editPanelOpen
                        ? "ring-2 ring-primary ring-inset shadow-md"
                        : ""
                    }`}
                  >
                    <span
                      className={`text-lg shrink-0 transition-colors ${
                        activeSection === section.id && editPanelOpen
                          ? "text-primary"
                          : "text-neutral-400 group-hover:text-primary"
                      }`}
                    >
                      {section.icon}
                    </span>

                    <div className="flex items-center gap-2.5 flex-1 min-w-0 justify-end">
                      <span
                        className={`group-hover:text-primary duration-300 text-sm font-bold truncate flex-1 ${
                          activeSection === section.id && editPanelOpen
                            ? "text-primary"
                            : "text-darkNavy"
                        }`}
                      >
                        {section.label}
                      </span>
                    </div>

                    {/* Grip Icon with Divider */}
                    <span className="text-neutral-300 group-hover:text-neutral-500 transition-colors shrink-0 border-s border-neutral-100 ps-2.5 h-6 flex items-center">
                      <FaEdit size={13} />
                    </span>
                  </button>
                ))}

                {sidebarFooter && (
                  <div className="mt-4 pt-4 border-t border-neutral-100 flex flex-col gap-3">
                    {sidebarFooter}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Toggle Button (when collapsed) */}
        {!sidebarOpen && (
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="fixed top-1/2 -translate-y-1/2 w-8 h-16 bg-white border border-neutral-200 shadow-lg flex items-center justify-center text-neutral-500 hover:text-primary transition-all z-50 start-0 rounded-e-xl border-s-0"
          >
            {isRtl ? <FaChevronRight size={12} /> : <FaChevronLeft size={12} />}
          </button>
        )}

        {/* Edit Panel (slides in from sidebar side) */}
        {editPanelOpen && activeSection && (
          <>
            {/* Backdrop */}
            {/* <div
              className="fixed inset-0 z-40 cursor-pointer"
              style={{ top: "56px" }}
              onClick={closeEditPanel}
            /> */}

            {/* Edit Side Panel */}
            <div
              ref={editPanelRef}
              className={`fixed bottom-0 start-0 w-[420px] max-w-[90vw] bg-neutral-50 shadow-2xl z-50 flex flex-col animate-in duration-200 ${
                isRtl ? "slide-in-from-left" : "slide-in-from-right"
              }`}
              style={{ top: "56px" }}
            >
              {/* Edit Panel Header — Branded accent bar */}
              <div className="relative shrink-0">
                {/* Thin accent line at top */}
                <div className="px-5 py-3.5 border-b border-neutral-200/60 flex items-center justify-between bg-white">
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={
                        nestedPanelContent ? onNestedBack : closeEditPanel
                      }
                      className="w-8 h-8 rounded-xl bg-primary/8 hover:bg-primary/15 flex items-center justify-center text-primary transition-all shrink-0"
                    >
                      {isRtl ? (
                        <FaChevronLeft size={12} />
                      ) : (
                        <FaChevronRight size={12} />
                      )}
                    </button>
                    <h3 className="text-[13px] font-bold text-darkNavy truncate">
                      {nestedTitle ||
                        sections.find((s) => s.id === activeSection)?.label}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Edit Panel Content */}
              <div className="flex-1 overflow-y-auto relative">
                {nestedPanelContent ? (
                  <div className="absolute inset-0 z-10 bg-neutral-50 animate-in slide-in-from-right-5 duration-300">
                    <div className="p-5 h-full overflow-y-auto custom-scrollbar">
                      {nestedPanelContent}
                    </div>
                  </div>
                ) : null}
                <div className="p-5 h-full overflow-y-auto custom-scrollbar">
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
