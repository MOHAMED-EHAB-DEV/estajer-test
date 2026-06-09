"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { toast } from "@/utils/toast";
import ToastMessage from "../../ui/ToastMessage";
import { Print } from "@/components/ui/svgs/icons/PrintSvg";
import Button from "@/components/ui/Button";

// ─── Pill / Badge ──────────────────────────────────────────────────────────────
function Badge({ children, color = "gray" }) {
  const colors = {
    gray: "bg-gray-100 text-gray-600",
    orange: "bg-orange-100 text-orange-700",
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
    blue: "bg-blue-100 text-blue-700",
    purple: "bg-purple-100 text-purple-700",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[color]}`}
    >
      {children}
    </span>
  );
}

// ─── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, color = "orange", sub }) {
  const colors = {
    orange: "from-orange-500 to-amber-400",
    blue: "from-blue-500 to-cyan-400",
    green: "from-emerald-500 to-teal-400",
    red: "from-red-500 to-rose-400",
    purple: "from-purple-500 to-violet-400",
  };
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start gap-4">
      <div
        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center text-white text-xl shrink-0`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Mini bar chart ───────────────────────────────────────────────────────────
function MiniBar({ count, max, color = "#f48a42" }) {
  const pct = max === 0 ? 0 : Math.round((count / max) * 100);
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs text-gray-500 w-8 text-end">{pct}%</span>
    </div>
  );
}

// ─── Trend Sparkline (SVG) ────────────────────────────────────────────────────
function Sparkline({ data }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data.map((d) => d.count), 1);
  const W = 300,
    H = 60,
    pad = 4;
  const points = data.map((d, i) => {
    const x = pad + ((W - pad * 2) / (data.length - 1)) * i;
    const y = H - pad - (d.count / max) * (H - pad * 2);
    return `${x},${y}`;
  });
  const polyline = points.join(" ");
  const area = `${points[0]} ${points.join(" ")} ${W - pad},${H - pad} ${pad},${H - pad}`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-16"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="spark-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f48a42" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#f48a42" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#spark-grad)" />
      <polyline
        points={polyline}
        fill="none"
        stroke="#f48a42"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Source icon helper ────────────────────────────────────────────────────────
function sourceLabel(source, t) {
  return t(`sources.${source}`) || source;
}

function sourceColor(source) {
  return (
    { header: "blue", hero: "orange", filters: "purple", unknown: "gray" }[
      source
    ] || "gray"
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function SearchAnalyticsContainer({ lang, translate }) {
  const trans = useTranslations(translate);
  const t = (key) => trans(`admin.searchAnalytics.${key}`);

  const [data, setData] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Filters
  const [period, setPeriod] = useState("all");
  const [source, setSource] = useState("");
  const [language, setLanguage] = useState("");
  const [hasResults, setHasResults] = useState("");
  const [sortBy, setSortBy] = useState("count");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [isPrintLoading, setIsPrintLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: 50,
        sortBy,
        order: "desc",
        ...(search && { search }),
        ...(source && { source }),
        ...(language && { language }),
        ...(hasResults !== "" && { hasResults }),
        period,
      });

      const res = await fetch(`/api/admin/search-analytics?${params}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        setStats(json.stats);
        setPagination(json.pagination);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, search, source, language, hasResults, period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleExportExcel = async () => {
    try {
      setIsPrintLoading(true);
      const params = new URLSearchParams({
        sortBy,
        order: "desc",
        ...(search && { search }),
        ...(source && { source }),
        ...(language && { language }),
        ...(hasResults !== "" && { hasResults }),
        period,
      });

      const response = await fetch(
        `/api/admin/search-analytics/export?${params.toString()}`,
      );
      if (!response.ok)
        throw new Error(
          lang === "ar" ? "فشل في تصدير البيانات" : "Failed to export data",
        );

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `search-analytics-${new Date().toLocaleDateString("en").replaceAll("/", "-")}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(
        ToastMessage(
          lang === "ar"
            ? "تم تصدير البيانات بنجاح"
            : "Data exported successfully",
        ),
      );
    } catch (error) {
      console.error("Export error:", error);
      toast.error(
        ToastMessage(
          lang === "ar"
            ? "حدث خطأ أثناء تصدير البيانات"
            : "An error occurred during export",
        ),
      );
    } finally {
      setIsPrintLoading(false);
    }
  };

  const handleDelete = async (term, language) => {
    const key = `${term}__${language}`;
    setDeleting(key);
    try {
      await fetch(
        `/api/admin/search-analytics?term=${encodeURIComponent(term)}&language=${encodeURIComponent(language)}`,
        { method: "DELETE" },
      );
      setData((prev) =>
        prev.filter((d) => !(d.term === term && d.language === language)),
      );
      setDeleteConfirm(null);
    } catch (e) {
      console.error(e);
    } finally {
      setDeleting(null);
    }
  };

  // When a source filter is active, derive per-row display values from that source only
  const getDisplayValues = (item) => {
    if (!source) {
      return { displayCount: item.count, displaySources: item.sources || [] };
    }
    const filtered = (item.sources || []).find((s) => s.source === source);
    return {
      displayCount: filtered?.count || 0,
      displaySources: filtered ? [filtered] : [],
    };
  };

  const maxCount =
    data.length > 0
      ? Math.max(...data.map((d) => getDisplayValues(d).displayCount))
      : 1;

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className={`min-h-screen pb-16 `}>
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-400 text-white shrink-0">
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </span>
            {t("title")}
          </h1>
          <p className="text-gray-500 mt-1 text-sm">{t("subtitle")}</p>
        </div>

        <div className="flex items-center">
          <Button
            className="bg-darkNavy rounded-xl h-12 px-6 shadow-[#F48A4233] shadow-lg flex items-center justify-center gap-2"
            onPress={handleExportExcel}
            isDisabled={isPrintLoading}
          >
            {isPrintLoading ? (
              <svg
                className="animate-spin h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            ) : (
              <Print className="w-5 h-5" />
            )}
            <span className="font-semibold text-sm font-IBMPlex text-white">
              {isPrintLoading
                ? trans("admin.filterOptions.exporting")
                : trans("admin.filterOptions.print")}
            </span>
          </Button>
        </div>
      </div>

      {/* ── Stat Cards ──────────────────────────────────────────────── */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label={t("totalSearches")}
            value={stats.totalSearches}
            icon={
              <svg
                className="w-6 h-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            }
            color="orange"
          />
          <StatCard
            label={t("uniqueTerms")}
            value={stats.uniqueTerms}
            icon={
              <svg
                className="w-6 h-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
                <path d="M11 8v3l2 2" />
              </svg>
            }
            color="blue"
          />
          <StatCard
            label={t("noResults")}
            value={stats.noResultsCount}
            icon={
              <svg
                className="w-6 h-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            }
            color="red"
            sub={
              stats.totalSearches > 0
                ? `${Math.round((stats.noResultsCount / stats.uniqueTerms) * 100)}% ${t("units.ofTerms")}`
                : null
            }
          />
          {stats.topSearches[0] && (
            <StatCard
              label={t("topSearch")}
              value={`"${stats.topSearches[0].originalTerm}"`}
              icon={
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                  <path d="M4 22h16" />
                  <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                  <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                  <path d="M18 2H6v7a6 6 0 0 0 12 0V2z" />
                </svg>
              }
              color="purple"
              sub={`${stats.topSearches[0].totalCount?.toLocaleString()} ${t("units.searches")}`}
            />
          )}
        </div>
      )}

      {/* ── Top Row: Trend + Top Searches + Source Breakdown ─────────── */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Trend sparkline */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="text-base font-semibold text-gray-800 mb-3">
              {t("trendChart")}
            </h2>
            {stats.trendData && stats.trendData.length > 1 ? (
              <>
                <Sparkline data={stats.trendData} />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>{formatDate(stats.trendData[0]?._id)}</span>
                  <span>
                    {formatDate(
                      stats.trendData[stats.trendData.length - 1]?._id,
                    )}
                  </span>
                </div>
              </>
            ) : (
              <div className="h-16 flex items-center justify-center text-gray-400 text-sm">
                {t("notEnoughData")}
              </div>
            )}
          </div>

          {/* Source & Language breakdown */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-5">
            {/* Sources */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                {t("breakdown.source")}
              </h3>
              <div className="flex flex-col gap-2">
                {stats.sourceBreakdown.length === 0 && (
                  <p className="text-xs text-gray-400">{t("noBreakdown")}</p>
                )}
                {stats.sourceBreakdown.map((s) => (
                  <div key={s._id} className="flex items-center gap-2 text-sm">
                    <Badge color={sourceColor(s._id)}>
                      {sourceLabel(s._id, t)}
                    </Badge>
                    <span className="text-gray-600 ms-auto font-medium">
                      {s.count?.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            {/* Languages */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                {t("breakdown.language")}
              </h3>
              <div className="flex gap-3">
                {stats.languageBreakdown.map((l) => (
                  <div
                    key={l._id}
                    className="flex-1 bg-gray-50 rounded-xl p-3 text-center"
                  >
                    <p className="text-lg font-bold text-gray-800">
                      {l.count?.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {l._id === "ar" ? t("languages.ar") : t("languages.en")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Top 10 bar chart ─────────────────────────────────────────── */}
      {stats?.topSearches?.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-8">
          <h2 className="text-base font-semibold text-gray-800 mb-4">
            {t("topSearches")}
          </h2>
          <div className="flex flex-col gap-3">
            {stats.topSearches.map((item, i) => {
              const topMax = stats.topSearches[0].totalCount || 1;
              return (
                <div key={item._id} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400 w-5">
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium text-gray-800 w-36 truncate">
                    {item.originalTerm}
                  </span>
                  <div className="flex-1">
                    <MiniBar
                      count={item.totalCount}
                      max={topMax}
                      color={i === 0 ? "#f48a42" : "#94a3b8"}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-700 w-12 text-end">
                    {item.totalCount?.toLocaleString()}
                  </span>
                  {!item.hasResults && (
                    <span title={t("status.noResults")}>
                      <Badge color="red">
                        <svg
                          className="w-3 h-3 inline-block"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                          <line x1="12" y1="9" x2="12" y2="13" />
                          <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                      </Badge>
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── All Search Terms Table ───────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Table header / filters */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-base font-semibold text-gray-800 flex-1">
              {t("allSearches")}
            </h2>

            {/* Period picker */}
            <div className="flex rounded-xl overflow-hidden border border-gray-200 text-sm">
              {["all", "today", "week", "month"].map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setPeriod(p);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 font-medium transition-colors ${
                    period === p
                      ? "bg-[#f48a42] text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {t(`period.${p}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Filters row */}
          <div className="flex flex-wrap gap-3 mt-3">
            {/* Search filter */}
            <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={t("searchPlaceholder")}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm flex-1 min-w-40 focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
              <button
                type="submit"
                className="bg-[#f48a42] text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
              >
                {t("actions.searchButton")}
              </button>
            </form>

            {/* Source filter */}
            <select
              value={source}
              onChange={(e) => {
                setSource(e.target.value);
                setPage(1);
              }}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-300"
            >
              <option value="">
                {t("filter.source")}: {t("filter.all")}
              </option>
              <option value="header">{sourceLabel("header", t)}</option>
              <option value="hero">{sourceLabel("hero", t)}</option>
              <option value="filters">{sourceLabel("filters", t)}</option>
            </select>

            {/* Language filter */}
            <select
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value);
                setPage(1);
              }}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-300"
            >
              <option value="">
                {t("filter.language")}: {t("filter.all")}
              </option>
              <option value="ar">{t("languages.ar")}</option>
              <option value="en">{t("languages.en")}</option>
            </select>

            {/* Has results filter */}
            <select
              value={hasResults}
              onChange={(e) => {
                setHasResults(e.target.value);
                setPage(1);
              }}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-300"
            >
              <option value="">
                {t("filter.results")}: {t("filter.all")}
              </option>
              <option value="true">{t("filter.withResults")}</option>
              <option value="false">{t("filter.noResults")}</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-300"
            >
              <option value="count">{t("sort.count")}</option>
              <option value="recent">{t("sort.recent")}</option>
              <option value="term">{t("sort.term")}</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-[#f48a42] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : data.length === 0 ? (
            <div className="py-20 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                </div>
              </div>
              <p className="text-gray-600 font-medium">{t("noData.title")}</p>
              <p className="text-gray-400 text-sm mt-1">
                {t("noData.subtitle")}
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wide">
                  <th className="px-5 py-3 text-start font-semibold w-8">#</th>
                  <th className="px-5 py-3 text-start font-semibold">
                    {t("table.term")}
                  </th>
                  <th className="px-5 py-3 text-start font-semibold">
                    {t("table.count")}
                  </th>
                  <th className="px-5 py-3 text-start font-semibold hidden md:table-cell">
                    {t("sources.label")}
                  </th>
                  <th className="px-5 py-3 text-start font-semibold hidden md:table-cell">
                    {t("filter.language")}
                  </th>
                  <th className="px-5 py-3 text-start font-semibold hidden lg:table-cell">
                    {t("table.lastSearched")}
                  </th>
                  <th className="px-5 py-3 text-start font-semibold">
                    {t("table.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.map((item, idx) => {
                  const { displayCount, displaySources } =
                    getDisplayValues(item);
                  return (
                    <tr
                      key={`${item.term}__${item.language}`}
                      className="hover:bg-orange-50/30 transition-colors group"
                    >
                      <td className="px-5 py-3.5 text-gray-400 font-medium">
                        {(page - 1) * 50 + idx + 1}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex flex-col gap-1.5">
                          <span className="font-semibold text-gray-800">
                            {item.originalTerm}
                          </span>
                          <MiniBar
                            count={displayCount}
                            max={maxCount}
                            color={item.hasResults ? "#f48a42" : "#ef4444"}
                          />
                          {/* Spelling variants — shown only when users typed differently */}
                          {item.variants && item.variants.length > 1 && (
                            <div className="flex flex-wrap gap-1 mt-0.5">
                              {[...item.variants]
                                .sort((a, b) => b.count - a.count)
                                .map((v) => (
                                  <span
                                    key={v.spelling}
                                    dir="auto"
                                    title={`${v.count} ${t("searchesWithThisSpelling")}`}
                                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs border ${
                                      v.spelling === item.originalTerm
                                        ? "border-orange-300 bg-orange-50 text-orange-700 font-semibold"
                                        : "border-gray-200 bg-gray-50 text-gray-500"
                                    }`}
                                  >
                                    {v.spelling}
                                    <span className="opacity-60">
                                      ×{v.count}
                                    </span>
                                  </span>
                                ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-bold text-gray-900">
                          {displayCount.toLocaleString()}
                        </span>
                        {!source && item.count !== displayCount && (
                          <span className="ms-1 text-xs text-gray-400">
                            / {item.count.toLocaleString()} {t("table.total")}
                          </span>
                        )}
                        {!item.hasResults && (
                          <span
                            className="ms-2 inline-flex items-center gap-1 text-red-500 text-xs"
                            title={t("status.noResultsDetail")}
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                              <line x1="12" y1="9" x2="12" y2="13" />
                              <line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                            {t("status.noResults")}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <div className="flex flex-wrap gap-1.5">
                          {displaySources.map((s) => (
                            <span
                              key={s.source}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                s.source === "hero"
                                  ? "bg-orange-100 text-orange-700"
                                  : s.source === "header"
                                    ? "bg-blue-100 text-blue-700"
                                    : s.source === "filters"
                                      ? "bg-purple-100 text-purple-700"
                                      : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {sourceLabel(s.source, t)}
                              <span className="font-bold">{s.count}</span>
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <Badge
                          color={item.language === "ar" ? "orange" : "blue"}
                        >
                          {item.language === "ar"
                            ? t("languages.ar")
                            : t("languages.en")}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 hidden lg:table-cell">
                        {formatDate(item.lastSearchedAt)}
                      </td>
                      <td className="px-5 py-3.5">
                        {deleteConfirm === `${item.term}__${item.language}` ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                handleDelete(item.term, item.language)
                              }
                              disabled={
                                deleting === `${item.term}__${item.language}`
                              }
                              className="bg-red-500 text-white text-xs px-2.5 py-1 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                            >
                              {deleting === `${item.term}__${item.language}`
                                ? "..."
                                : t("actions.yes")}
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                              {t("actions.cancel")}
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() =>
                              setDeleteConfirm(`${item.term}__${item.language}`)
                            }
                            className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all text-xs px-2 py-1 rounded hover:bg-red-50"
                          >
                            {t("actions.delete")}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-600">
            <span>
              {t("pagination.page")
                .replace("{page}", page)
                .replace("{pages}", pagination.pages)}{" "}
              · {pagination.total?.toLocaleString()} {t("units.terms")}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                {t("pagination.prev")}
              </button>
              <button
                onClick={() =>
                  setPage((p) => Math.min(pagination.pages, p + 1))
                }
                disabled={page === pagination.pages}
                className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                {t("pagination.next")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
