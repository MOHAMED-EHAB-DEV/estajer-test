"use client";

import { useState } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import AiAssistModal from "./AiAssistModal";

export default function McpBanner({
  lang,
  translate,
  categories,
  subCategories,
  onAiApply,
  mode,
  setMode,
}) {
  const trans = useTranslations(translate);
  const tm = (key) => trans(`addProductPage.mcpBanner.${key}`);

  const [copied, setCopied] = useState(false);

  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://estajer.com";
  const sseUrl = `${baseUrl}/api/mcp/sse`;

  const configSnippet = {
    mcpServers: {
      "estajer-mcp": {
        command: "npx",
        args: ["-y", "@modelcontextprotocol/server-http-sse", sseUrl],
      },
    },
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(configSnippet, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const closeAll = () => setMode(null);

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setMode("choice")}
        type="button"
        className="fixed md:bottom-7 bottom-24 start-6 z-50 flex items-center justify-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-2xl transition-all hover:scale-105 active:scale-95 border border-white/20 select-none group font-IBMPlex p-4 sm:px-5 sm:py-3.5"
      >
        <svg
          className="w-5 h-5 group-hover:scale-110 transition-transform"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M10 2c0 4.418-3.582 8-8 8 4.418 0 8 3.582 8 8 0-4.418 3.582-8 8-8-4.418 0-8-3.582-8-8z" />
          <path d="M19 8c0 2.209-1.791 4-4 4 2.209 0 4 1.791 4 4 0-2.209 1.791-4 4-4-2.209 0-4-1.791-4-4z" />
        </svg>

        <span className="hidden sm:inline font-bold text-sm leading-none tracking-wide">
          {tm("fabText")}
        </span>
      </button>

      {/* ─── Choice Modal ─── */}
      {mode === "choice" && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[99] flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={closeAll}
        >
          <div
            className="bg-white w-full sm:rounded-3xl sm:max-w-md shadow-2xl border border-slate-100 text-start overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-darkNavy font-IBMPlex">
                  {tm("choiceTitle")}
                </h2>
                <p className="text-slate-500 text-sm mt-0.5">
                  {tm("choiceSubtitle")}
                </p>
              </div>
              <button
                type="button"
                onClick={closeAll}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-4 space-y-3">
              {/* Estajer AI Option */}
              <button
                type="button"
                onClick={() => setMode("ai")}
                className="w-full group flex items-center gap-4 p-4 rounded-2xl border-2 border-amber-200 hover:border-amber-400 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 transition-all text-start"
              >
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-md">
                  <svg
                    className="w-6 h-6 group-hover:scale-110 transition-transform"
                    viewBox="0 0 24 24"
                    fill="#fff"
                  >
                    <path d="M10 2c0 4.418-3.582 8-8 8 4.418 0 8 3.582 8 8 0-4.418 3.582-8 8-8-4.418 0-8-3.582-8-8z" />
                    <path d="M19 8c0 2.209-1.791 4-4 4 2.209 0 4 1.791 4 4 0-2.209 1.791-4 4-4-2.209 0-4-1.791-4-4z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-darkNavy font-IBMPlex text-sm">
                    {tm("aiOption")}
                  </p>
                  <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">
                    {tm("aiOptionDesc")}
                  </p>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white flex-shrink-0">
                  NEW
                </span>
              </button>

              {/* MCP Option */}
              <button
                type="button"
                onClick={() => setMode("mcp")}
                className="w-full group flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 transition-all text-start"
              >
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center flex-shrink-0 shadow-md">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 12h14M12 5l7 7-7 7"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-darkNavy font-IBMPlex text-sm">
                    {tm("mcpOption")}
                  </p>
                  <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">
                    {tm("mcpOptionDesc")}
                  </p>
                </div>
              </button>
            </div>
            <div className="h-4" />
          </div>
        </div>
      )}

      {/* ─── MCP Instructions Modal ─── */}
      {mode === "mcp" && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[99] flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={closeAll}
        >
          <div
            className="bg-white w-full sm:rounded-3xl sm:max-w-xl p-6 md:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto text-start"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => setMode("choice")}
                className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 font-IBMPlex"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                {tm("backToChoice") || "Back"}
              </button>
              <button
                type="button"
                onClick={closeAll}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="flex items-center gap-2.5 mb-2 mt-2">
              <h2 className="text-xl md:text-2xl font-bold font-IBMPlex text-darkNavy">
                {tm("title")}
              </h2>
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-semibold px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-IBMPlex">
                MCP
              </span>
            </div>

            <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-6">
              {tm("description")}
            </p>

            <div className="flex flex-col gap-3 mb-6">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-start gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {n}
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    {tm(`step${n}`)}
                  </p>
                </div>
              ))}
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
                <h3 className="text-sm font-bold text-slate-800 font-IBMPlex">
                  {tm("configHeading")}
                </h3>
                <button
                  onClick={handleCopy}
                  type="button"
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold font-IBMPlex transition-all border ${
                    copied
                      ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                      : "bg-white hover:bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-800 shadow-sm"
                  }`}
                >
                  {copied ? (
                    <>
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {tm("copied")}
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                        />
                      </svg>
                      {tm("copyConfig")}
                    </>
                  )}
                </button>
              </div>
              <pre
                dir="ltr"
                className="bg-slate-100 p-4 rounded-xl text-slate-700 font-mono text-[11px] md:text-xs overflow-x-auto select-all leading-normal border border-slate-200/50"
              >
                {JSON.stringify(configSnippet, null, 2)}
              </pre>
              <div className="mt-4 pt-3 border-t border-slate-200/50 flex flex-col gap-1 text-xs">
                <div>
                  <span className="text-slate-500 font-semibold uppercase font-IBMPlex tracking-wider me-2">
                    {tm("sseEndpoint")}:
                  </span>
                  <code className="text-indigo-600 bg-slate-100 px-2 py-0.5 rounded font-mono select-all break-all">
                    {sseUrl}
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── AI Assist Modal ─── */}
      <AiAssistModal
        isOpen={mode === "ai"}
        onClose={closeAll}
        lang={lang}
        translate={translate}
        categories={categories}
        subCategories={subCategories}
        onApply={({ suggestion, images }) => {
          onAiApply(suggestion, images);
        }}
      />
    </>
  );
}
