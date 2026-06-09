"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { extractColorsFromImage } from "@/utils/ImageResizer";

// ─── Upload a single File object via /api/mcp/upload-image ──────────────────

async function uploadFile(file, authCode) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("auth_code", authCode);
  const res = await fetch("/api/mcp/upload-image", {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || "Upload failed");
  return data.url;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function McpUploadImagesClient({ authCode, lang, translate }) {
  const trans = useTranslations(translate);
  const t = (key) => trans(`mcpUploadImages.${key}`);

  const [items, setItems] = useState([]); // { file, localUrl, gradientColors, gradientStyle, status, cloudUrl, error }
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);
  const MAX_FILES = 10;

  const noAuthCode = !authCode;

  // Process files picked by user into items with local preview + gradient
  const processFiles = useCallback(
    async (fileList) => {
      const remaining = MAX_FILES - items.length;
      if (remaining <= 0) return;
      const valid = Array.from(fileList)
        .filter((f) => f.type.startsWith("image/"))
        .slice(0, remaining);
      if (valid.length === 0) return;

      const newItems = await Promise.all(
        valid.map(
          (file) =>
            new Promise((resolve) => {
              const localUrl = URL.createObjectURL(file);
              const img = new Image();
              img.onload = () => {
                const colors = extractColorsFromImage(img);
                resolve({
                  file,
                  localUrl,
                  gradientColors: colors,
                  gradientStyle: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`,
                  status: "pending", // pending | uploading | done | error
                  cloudUrl: null,
                  error: null,
                });
              };
              img.onerror = () =>
                resolve({
                  file,
                  localUrl,
                  gradientColors: ["#fff7f0", "#fff3ea"],
                  gradientStyle: "linear-gradient(135deg, #fff7f0, #fff3ea)",
                  status: "pending",
                  cloudUrl: null,
                  error: null,
                });
              img.src = localUrl;
            }),
        ),
      );
      setItems((prev) => [...prev, ...newItems]);
    },
    [items.length],
  );

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  const onDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);
  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files?.length) processFiles(e.dataTransfer.files);
    },
    [processFiles],
  );

  // Paste support
  useEffect(() => {
    const onPaste = (e) => {
      const files = Array.from(e.clipboardData?.items || [])
        .filter((it) => it.type.startsWith("image/"))
        .map((it) => it.getAsFile())
        .filter(Boolean);
      if (files.length) processFiles(files);
    };
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, [processFiles]);

  const removeItem = (idx) => {
    setItems((prev) => {
      const next = [...prev];
      URL.revokeObjectURL(next[idx].localUrl);
      next.splice(idx, 1);
      return next;
    });
  };

  const handleDragStartItem = (e, index) => {
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDropItem = (e, dropIndex) => {
    e.preventDefault();
    const dragIndex = Number(e.dataTransfer.getData("text/plain"));
    if (isNaN(dragIndex) || dragIndex === dropIndex) return;
    const newItems = [...items];
    const draggedItem = newItems[dragIndex];
    newItems.splice(dragIndex, 1);
    newItems.splice(dropIndex, 0, draggedItem);
    setItems(newItems);
  };

  const handleUploadLatest = async () => {
    setUploading(true);
    const snapshot = [...items];

    // Mark all pending as uploading
    setItems((prev) =>
      prev.map((it) =>
        it.status === "pending" ? { ...it, status: "uploading" } : it,
      ),
    );

    for (let i = 0; i < snapshot.length; i++) {
      const it = snapshot[i];
      if (it.status !== "pending") continue;
      try {
        const url = await uploadFile(it.file, authCode);
        setItems((prev) =>
          prev.map((item, idx) =>
            idx === i ? { ...item, status: "done", cloudUrl: url } : item,
          ),
        );
      } catch (err) {
        setItems((prev) =>
          prev.map((item, idx) =>
            idx === i ? { ...item, status: "error", error: err.message } : item,
          ),
        );
      }
    }
    setUploading(false);
  };

  const doneItems = items.filter((it) => it.status === "done");
  const pendingCount = items.filter((it) => it.status === "pending").length;
  const allDone =
    items.length > 0 &&
    items.every((it) => it.status === "done" || it.status === "error");

  const imagesArray = doneItems.map((it) => ({
    preview: it.cloudUrl,
    gradientColors: it.gradientColors,
    gradientStyle: it.gradientStyle,
  }));

  const jsonOutput = JSON.stringify(imagesArray, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonOutput).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const getUploadBtnText = () => {
    if (uploading) return t("uploading");
    const key = pendingCount === 1 ? "uploadBtn" : "uploadBtnPlural";
    return t(key).replace("{count}", pendingCount);
  };

  const getCopyBtnText = () => {
    if (copied) return t("copied");
    const key = doneItems.length === 1 ? "copyBtn" : "copyBtnPlural";
    return t(key).replace("{count}", doneItems.length);
  };

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-[#fff7f0] via-[#fff] to-[#fff3ea] flex items-center justify-center p-4 pb-16 font-sans">
      <div className="bg-white mb-12 rounded-3xl shadow-[0_8px_48px_rgba(244,138,66,0.12),_0_2px_12px_rgba(0,0,0,0.06)] p-10 max-w-[640px] w-full">
        {/* Header */}
        <div className="mb-7 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-[#ff6b35] flex items-center justify-center mx-auto mb-3.5 shadow-[0_8px_24px_rgba(244,138,66,0.35)]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <path
                d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-[#1a1a2e] mb-1">
            {t("title")}
          </h1>
          <p className="text-[13px] text-[#888] m-0">{t("subtitle")}</p>
        </div>

        {/* No auth_code guard */}
        {noAuthCode ? (
          <div className="rounded-xl p-4 bg-gradient-to-br from-[#fef2f2] to-[#fee2e2] border border-[#fca5a5] text-sm text-[#dc2626] leading-relaxed mb-5 flex items-start gap-2.5">
            <svg
              className="w-5 h-5 flex-shrink-0 text-red-600 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span>{t("noAuth")}</span>
          </div>
        ) : (
          <>
            {/* Info note */}
            <div className="rounded-xl p-4 bg-gradient-to-br from-[#fef9f0] to-[#fff3e0] border border-[#fde68a] text-sm text-[#92400e] leading-relaxed mb-5 flex items-start gap-1">
              <svg
                className="w-5 h-5 flex-shrink-0 text-[#b45309] mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              <span>{t("info")}</span>
            </div>

            {/* Drop zone (only shown when not all done) */}
            {!allDone && (
              <div
                className={`border-2 border-dashed rounded-2xl py-9 px-6 text-center cursor-pointer transition-all duration-200 mb-5 ${
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-[#fbbf92] bg-[#FFF8ED] hover:bg-orange-50/30"
                }`}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    e.target.files?.length && processFiles(e.target.files)
                  }
                />
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#F48A42"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mx-auto"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <p className="text-[#5B5656] text-[15px] mt-2.5">
                  {isDragging ? t("dropActive") : t("drop")}
                </p>
                <p className="text-xs text-[#bbb] mt-2">
                  {t("maxNote").replace("{count}", MAX_FILES)} ·{" "}
                  {t("pasteNote")}
                </p>
              </div>
            )}

            {/* Thumbnail grid */}
            {items.length > 0 && (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-3 mb-6">
                {items.map((it, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl overflow-hidden relative aspect-[1/0.85] border border-black/5 cursor-move"
                    draggable
                    onDragStart={(e) => handleDragStartItem(e, idx)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDropItem(e, idx)}
                  >
                    {/* gradient background */}
                    <div
                      className="absolute inset-0 opacity-95"
                      style={{
                        background: it.gradientStyle,
                      }}
                    />
                    <img
                      src={it.localUrl}
                      alt={`img-${idx}`}
                      className="w-full h-full object-contain relative z-10"
                    />
                    {/* status badge */}
                    <span
                      className={`absolute bottom-2 left-2 z-20 rounded-lg p-1 text-[11px] font-semibold text-white flex items-center justify-center ${
                        it.status === "done"
                          ? "bg-green-600/85"
                          : it.status === "error"
                            ? "bg-red-600/85"
                            : "bg-primary/85"
                      }`}
                    >
                      {it.status === "uploading" ? (
                        <Spinner size={10} />
                      ) : it.status === "done" ? (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth="3"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : it.status === "error" ? (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth="3"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-white block" />
                      )}
                    </span>
                    {/* remove button — only when not uploading */}
                    {it.status !== "uploading" && (
                      <button
                        className="absolute top-2 end-2 z-20 bg-red-500/90 hover:bg-red-500 rounded-full w-5 h-5 cursor-pointer text-white flex items-center justify-center transition-colors"
                        onClick={() => removeItem(idx)}
                        aria-label={t("remove")}
                      >
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth="2.5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                {/* add more slot */}
                {allDone && items.length < MAX_FILES && (
                  <div
                    className="rounded-xl overflow-hidden relative aspect-[1/0.85] flex items-center justify-center cursor-pointer bg-[#FFF8ED] border-2 border-dashed border-[#fbbf92] text-primary hover:bg-orange-50/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <svg
                      className="w-8 h-8 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </div>
                )}
              </div>
            )}

            {/* Upload button */}
            {pendingCount > 0 && !uploading && (
              <button
                className="w-full py-3.5 px-4 rounded-2xl font-bold text-[15px] transition-all duration-200 mb-3 bg-gradient-to-br from-primary to-[#ff6b35] text-white shadow-[0_4px_16px_rgba(244,138,66,0.35)] hover:shadow-lg cursor-pointer flex items-center justify-center gap-2"
                onClick={handleUploadLatest}
              >
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
                <span>{getUploadBtnText()}</span>
              </button>
            )}

            {uploading && (
              <div className="text-center mb-4">
                <Spinner size={24} />
                <p className="text-primary text-sm mt-2">
                  {getUploadBtnText()}
                </p>
              </div>
            )}

            {/* Copy section */}
            {doneItems.length > 0 && !uploading && (
              <>
                <button
                  className={`w-full py-3.5 px-4 rounded-2xl border-2 font-bold text-[15px] cursor-pointer transition-all duration-200 mb-5 flex items-center justify-center gap-2 ${
                    copied
                      ? "bg-gradient-to-br from-[#f0fdf4] to-[#dcfce7] border-[#86efac] text-green-600"
                      : "border-primary bg-white text-primary hover:bg-orange-50/20"
                  }`}
                  onClick={handleCopy}
                >
                  {copied ? (
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  )}
                  <span>{getCopyBtnText()}</span>
                </button>
                <div className="rounded-xl bg-slate-900 p-4 text-[11px] text-sky-300 overflow-x-auto font-mono whitespace-pre mb-5 max-h-[200px] overflow-y-auto">
                  {jsonOutput}
                </div>
              </>
            )}
          </>
        )}

        <p className="text-center text-xs text-[#cbd5e1] mt-2">{t("footer")}</p>
      </div>
    </div>
  );
}

function Spinner({ size = 20 }) {
  return (
    <span
      className="inline-block rounded-full animate-spin border-primary"
      style={{
        width: size,
        height: size,
        borderWidth: Math.max(2, size / 8),
        borderTopColor: "#F48A42",
        borderLeftColor: "rgba(244,138,66,0.2)",
        borderRightColor: "rgba(244,138,66,0.2)",
        borderBottomColor: "rgba(244,138,66,0.2)",
        verticalAlign: "middle",
      }}
    />
  );
}
