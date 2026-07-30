"use client";

import React from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { getSectionMeta } from "@/components/shop/themes/registry";
import {
  FaTrash,
  FaEdit,
  FaGripVertical,
} from "@/components/ui/svgs/AdminIcons";
import ConfirmModal from "@/components/dashboard/ConfirmModal";

export default function ActiveSectionsList({
  sections,
  lang,
  activeSectionInstanceId,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  onReorder,
  translate,
}) {
  const trans = useTranslations(translate);
  const t = (key) => trans(`admin.shops.${key}`);
  const [draggedIdx, setDraggedIdx] = React.useState(null);
  const [dragOverIdx, setDragOverIdx] = React.useState(null);
  const [deleteTargetId, setDeleteTargetId] = React.useState(null);

  if (!sections || sections.length === 0) {
    return (
      <div
        className="py-10 rounded-xl flex flex-col items-center gap-2.5 text-center bg-neutral-50"
        style={{
          borderWidth: "1.5px",
          borderStyle: "dashed",
          borderColor: "hsl(220 15% 82%)",
        }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="w-8 h-8"
          style={{ color: "hsl(220 10% 65%)" }}
        >
          <rect x="3" y="3" width="18" height="5" rx="1" />
          <path d="M3 10h18M3 15h18M3 20h18" />
        </svg>
        <p className="text-xs font-bold" style={{ color: "hsl(225 35% 18%)" }}>
          {t("noSectionsYet")}
        </p>
        <p className="text-[10px]" style={{ color: "hsl(220 10% 55%)" }}>
          {t("addSection")}
        </p>
      </div>
    );
  }

  const handleDragStart = (e, idx) => {
    setDraggedIdx(idx);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, idx) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx) return;
    const targetSection = sections[idx];
    const isTargetLocked = ["header", "footer", "hero"].includes(
      targetSection.sectionType,
    );
    if (!isTargetLocked) {
      setDragOverIdx(idx);
      e.dataTransfer.dropEffect = "move";
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOverIdx(null);
  };

  const handleDrop = (e, idx) => {
    e.preventDefault();
    if (draggedIdx !== null && draggedIdx !== idx) {
      const targetSection = sections[idx];
      const isTargetLocked = ["header", "footer", "hero"].includes(
        targetSection.sectionType,
      );
      if (!isTargetLocked && onReorder) onReorder(draggedIdx, idx);
    }
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  return (
    <div className="flex flex-col gap-1">
      {sections.map((section, idx) => {
        const meta = getSectionMeta(section.themeId, section.sectionType);
        const isActive = activeSectionInstanceId === section.instanceId;
        const isLocked = ["header", "footer", "hero"].includes(
          section.sectionType,
        );
        const isDragging = draggedIdx === idx;
        const isDragOver = dragOverIdx === idx;

        return (
          <div
            key={section.instanceId}
            draggable={!isLocked}
            onDragStart={(e) => !isLocked && handleDragStart(e, idx)}
            onDragOver={(e) => !isLocked && handleDragOver(e, idx)}
            onDrop={(e) => !isLocked && handleDrop(e, idx)}
            onDragEnd={handleDragEnd}
            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg transition-all group shadow-sm"
            style={{
              background: isActive
                ? "hsl(var(--primary-hsl, 24 89% 61%) / 0.06)"
                : isDragOver
                  ? "hsl(220 15% 95%)"
                  : "#ffffff",
              borderWidth: "1px",
              borderStyle: "solid",
              borderTopColor: isDragOver
                ? "var(--color-primary, #f48a42)"
                : isActive
                  ? "hsl(var(--primary-hsl, 24 89% 61%) / 0.4)"
                  : "hsl(220 15% 88%)",
              borderRightColor: isActive
                ? "hsl(var(--primary-hsl, 24 89% 61%) / 0.4)"
                : "hsl(220 15% 88%)",
              borderBottomColor: isActive
                ? "hsl(var(--primary-hsl, 24 89% 61%) / 0.4)"
                : "hsl(220 15% 88%)",
              borderLeftColor: isActive
                ? "hsl(var(--primary-hsl, 24 89% 61%) / 0.4)"
                : "hsl(220 15% 88%)",
              opacity: isDragging ? 0.4 : 1,
              boxShadow: isActive
                ? "0 1px 3px hsl(var(--primary-hsl, 24 89% 61%) / 0.08)"
                : "none",
            }}
          >
            {/* Drag handle or Lock */}
            {!isLocked ? (
              <span
                className="shrink-0 cursor-grab active:cursor-grabbing transition-colors"
                style={{ color: "hsl(220 10% 70%)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "hsl(220 10% 45%)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "hsl(220 10% 70%)")
                }
              >
                <FaGripVertical className="w-2.5 h-2.5" />
              </span>
            ) : (
              <span className="shrink-0" style={{ color: "hsl(220 10% 65%)" }}>
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-2.5 h-2.5"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            )}

            {/* Icon */}
            <span
              className="shrink-0 w-[26px] h-[26px] rounded-md flex items-center justify-center"
              style={{
                background: isActive
                  ? "hsl(var(--primary-hsl, 24 89% 61%) / 0.12)"
                  : "hsl(220 12% 94%)",
              }}
            >
              {meta?.icon && meta.icon.startsWith("<svg") ? (
                <span
                  className="w-3.5 h-3.5 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
                  style={{
                    color: isActive
                      ? "var(--color-primary, #f48a42)"
                      : "hsl(220 10% 50%)",
                  }}
                  dangerouslySetInnerHTML={{ __html: meta.icon }}
                />
              ) : (
                <span className="text-xs">{meta?.icon || "📦"}</span>
              )}
            </span>

            {/* Label */}
            <div className="flex-1 min-w-0">
              <p
                className="text-xs font-bold truncate"
                style={{
                  color: isActive
                    ? "var(--color-primary, #f48a42)"
                    : "hsl(225 35% 18%)",
                }}
              >
                {lang === "ar" ? meta?.label.ar : meta?.label.en}
              </p>
              <p
                className="text-[9px] truncate"
                style={{ color: "hsl(220 10% 60%)" }}
              >
                {section.themeId} · #{idx + 1}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              {/* Move Up */}
              {!isLocked && idx > 0 && (
                <button
                  type="button"
                  onClick={() => onMoveUp(idx)}
                  className="w-6 h-6 rounded flex items-center justify-center transition-all"
                  style={{ color: "hsl(220 10% 55%)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "hsl(220 12% 93%)";
                    e.currentTarget.style.color = "hsl(225 35% 18%)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "hsl(220 10% 55%)";
                  }}
                  title={t("moveUp")}
                >
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-3 h-3"
                  >
                    <path
                      fillRule="evenodd"
                      d="M14.77 12.79a.75.75 0 01-1.06-.02L10 8.832 6.29 12.77a.75.75 0 11-1.08-1.04l4.25-4.5a.75.75 0 011.08 0l4.25 4.5a.75.75 0 01-.02 1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}
              {/* Move Down */}
              {!isLocked && idx < sections.length - 1 && (
                <button
                  type="button"
                  onClick={() => onMoveDown(idx)}
                  className="w-6 h-6 rounded flex items-center justify-center transition-all"
                  style={{ color: "hsl(220 10% 55%)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "hsl(220 12% 93%)";
                    e.currentTarget.style.color = "hsl(225 35% 18%)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "hsl(220 10% 55%)";
                  }}
                  title={t("moveDown")}
                >
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-3 h-3"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}
              {/* Edit */}
              <button
                type="button"
                onClick={() => onEdit(section)}
                className="w-6 h-6 rounded flex items-center justify-center transition-all"
                style={
                  isActive
                    ? {
                        background:
                          "hsl(var(--primary-hsl, 24 89% 61%) / 0.15)",
                        color: "var(--color-primary, #f48a42)",
                      }
                    : { color: "hsl(220 10% 55%)" }
                }
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background =
                      "hsl(var(--primary-hsl, 24 89% 61%) / 0.1)";
                    e.currentTarget.style.color =
                      "var(--color-primary, #f48a42)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "hsl(220 10% 55%)";
                  }
                }}
                title={t("edit")}
              >
                <FaEdit className="w-2.5 h-2.5" />
              </button>
              {/* Delete */}
              {!isLocked && (
                <button
                  type="button"
                  onClick={() => setDeleteTargetId(section.instanceId)}
                  className="w-6 h-6 rounded flex items-center justify-center transition-all"
                  style={{ color: "hsl(220 10% 50%)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "hsl(0 80% 55% / 0.1)";
                    e.currentTarget.style.color = "hsl(0 75% 55%)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "hsl(220 10% 50%)";
                  }}
                  title={t("delete")}
                >
                  <FaTrash className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          </div>
        );
      })}
      <ConfirmModal
        disableScrollbarGutter={true}
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={() => {
          onDelete(deleteTargetId);
          setDeleteTargetId(null);
        }}
        title={t("deleteSectionTitle")}
        message={t("deleteSectionConfirm")}
        cancelText={t("cancel")}
        confirmText={t("delete")}
        type="delete"
      />
    </div>
  );
}
