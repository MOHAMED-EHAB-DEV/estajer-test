"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import VisitsChart from "./VisitsChart";
import { Autocomplete, AutocompleteItem, Input } from "@heroui/react";
import { useDebounce } from "use-debounce";
import DateRangePicker from "../DateRangePicker";
import { User } from "@/components/ui/svgs/icons/UserSvg";
import Cards from "../Cards";
const TrendIcon = ({ className }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const ExternalLinkIcon = ({ size = 16, className }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const CopyIcon = ({ size = 16, className }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const CheckIcon = ({ size = 16, className }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

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
      <span className="text-xs font-IBMPlex text-gray-500 w-8 inline-block text-right">
        {pct}%
      </span>
    </div>
  );
}

// Helper to format date for API
const formatDateForApi = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// ─── Main Component ────────────────────────────────────────────────────────────
export default function VisitsAnalyticsContainer({ lang, translate }) {
  const trans = useTranslations(translate);
  const t = (key) => trans(`admin.visits.${key}`);
  const [copied, setCopied] = useState("");

  const handleCopy = (txt) => {
    navigator.clipboard.writeText(txt);
    setCopied(txt);
    setTimeout(() => setCopied(""), 2000);
  };

  // Global State
  const [range, setRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });
  const [isPrintLoading, setIsPrintLoading] = useState(false);

  // Overall Stats
  const [overallStats, setOverallStats] = useState({
    today: 0,
    total: 0,
    chartData: [],
  });

  // Table Tabs & Data
  const [tab, setTab] = useState("pages"); // "pages" | "products" | "owners"
  const [data, setData] = useState({ results: [], summary: {} });
  const [loading, setLoading] = useState(true);

  // Search Filters for Table
  const [pageSearch, setPageSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [usersAutocomplete, setUsersAutocomplete] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [autocompleteOpen, setAutocompleteOpen] = useState(false);

  const [debouncedPage] = useDebounce(pageSearch, 500);
  const [debouncedProduct] = useDebounce(productSearch, 500);
  const [debouncedUserSearch] = useDebounce(userSearchTerm, 600);

  // 1. Fetch Overall Stats (Chart + Top Cards)
  const fetchOverallStats = useCallback(async () => {
    try {
      let url = "/api/visitors";
      if (range?.from) {
        url += `?startDate=${formatDateForApi(range.from)}`;
        url += `&endDate=${formatDateForApi(range.to || range.from)}`;
      }
      const response = await fetch(url);
      const res = await response.json();
      if (res.success) {
        setOverallStats(res.data);
      }
    } catch (error) {
      console.error(error);
    }
  }, [range]);

  // 2. Fetch Detailed Page Visits
  const fetchPageVisits = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ tab, limit: "30" });
      if (range?.from) params.set("startDate", formatDateForApi(range.from));
      if (range?.to) params.set("endDate", formatDateForApi(range.to));
      if (debouncedPage && tab === "pages") params.set("page", debouncedPage);
      if (debouncedProduct && tab === "products")
        params.set("page", debouncedProduct); // Reusing page search on API for product names/ids conceptually
      if (selectedUser) params.set("ownerId", selectedUser);

      const res = await fetch(`/api/visitors/pages?${params.toString()}`);
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (e) {
      console.error("Error fetching page visits:", e);
    } finally {
      setLoading(false);
    }
  }, [tab, range, debouncedPage, debouncedProduct, selectedUser]);

  useEffect(() => {
    fetchOverallStats();
  }, [fetchOverallStats]);

  useEffect(() => {
    fetchPageVisits();
  }, [fetchPageVisits]);

  // Handle Autocomplete for Users
  useEffect(() => {
    if (!autocompleteOpen || !debouncedUserSearch) {
      return setUsersAutocomplete([]);
    }
    const searchUsersFunc = async () => {
      setLoadingUsers(true);
      try {
        const res = await fetch(
          `/api/users?search=${encodeURIComponent(
            debouncedUserSearch,
          )}&limit=10&client=true`,
        );
        const d = await res.json();
        if (d.success) setUsersAutocomplete(d.data);
      } catch (_) {
      } finally {
        setLoadingUsers(false);
      }
    };
    searchUsersFunc();
  }, [debouncedUserSearch, autocompleteOpen]);

  const handleUserSelect = (userId) => {
    if (userId) {
      const u = usersAutocomplete.find((u) => u._id === userId);
      if (u) {
        setSelectedUser(userId);
        setUserSearchTerm(u.fullName);
      }
    } else {
      setSelectedUser("");
      setUserSearchTerm("");
      setUsersAutocomplete([]);
    }
  };

  // Overall Stats Calculations
  const totalVisitors = overallStats.chartData.reduce(
    (acc, curr) => acc + curr.value,
    0,
  );
  const avgVisitors = Math.round(
    totalVisitors / (overallStats.chartData.length || 1),
  );
  const peakVisits = Math.max(...overallStats.chartData.map((d) => d.value), 0);

  const statsCards = [
    {
      title: t("totalVisitors"),
      Icon: User,
      iconColor: "#F48A42",
      value: totalVisitors,
      valueColor: "#F48A42",
      review: t("inPeriod"),
      reviewColor: "#4FD658",
    },
    {
      title: t("todayVisits"),
      Icon: User,
      iconColor: "#F48A42",
      value: overallStats.today,
      valueColor: "#F48A42",
      review: t("todayActivity"),
      reviewColor: "#4FD658",
    },
    {
      title: t("averageVisitors"),
      Icon: User,
      iconColor: "#9747FF",
      value: avgVisitors,
      valueColor: "#9747FF",
      review: t("inPeriod"),
      reviewColor: "#4FD658",
    },
    {
      title: t("peakDaily"),
      Icon: User,
      iconColor: "#4FD658",
      value: peakVisits,
      valueColor: "#4FD658",
      review: t("peakMax"),
      reviewColor: "#4FD658",
    },
  ];

  // Results
  const { results = [] } = data;
  const maxHitCount = results.length > 0 ? results[0].totalVisits : 1;
  const colorsArray = ["#F48A42", "#9747FF", "#4FD658", "#3B82F6", "#EC4899"];

  return (
    <div className="min-h-screen pb-16">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div className="text-start">
          <h1 className="text-2xl md:text-3xl font-bold font-IBMPlex text-gray-900 flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#F48A42] to-[#f48a42aa] text-white shrink-0 shadow-sm">
              <TrendIcon className="w-6 h-6" />
            </span>
            {t("title")}
          </h1>
          <p className="text-gray-500 mt-1 text-sm">{t("subtitle")}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="md:w-[320px]">
            <DateRangePicker
              lang={lang}
              translate={trans}
              onSelect={setRange}
              selectedRange={range}
            />
          </div>
        </div>
      </div>
      <div className="mb-4">
        <Suspense fallback={<p>Loading...</p>}>
          <Cards
            translate={trans}
            cards={statsCards}
            placeholder={loading}
            dateRange={{ startDate: range?.from, endDate: range?.to }}
            noMargin
          />
        </Suspense>
      </div>
      <div className="mb-4">
        <VisitsChart data={overallStats.chartData} translations={t} />
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 text-start">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-gray-800">
              {t("detailsTitle")}
            </h2>

            {/* Tabs */}
            <div className="flex rounded-xl overflow-hidden border border-gray-200 text-sm font-IBMPlex font-medium p-1 bg-gray-50">
              {[
                { id: "pages", label: t("tabs.pages") },
                { id: "products", label: t("tabs.products") },
                { id: "owners", label: t("tabs.owners") },
              ].map((tItem) => (
                <button
                  key={tItem.id}
                  onClick={() => setTab(tItem.id)}
                  className={`px-4 py-1.5 rounded-lg transition-all ${
                    tab === tItem.id
                      ? "bg-white text-primary font-semibold shadow-sm border border-gray-200"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tItem.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap gap-3 mt-4">
            {tab === "pages" && (
              <Input
                labelPlacement="outside"
                label={t("filters.pageSearch")}
                placeholder={t("filters.pagePlaceholder")}
                value={pageSearch}
                onChange={(e) => setPageSearch(e.target.value)}
                variant="flat"
                dir="ltr"
                className="w-full md:w-64"
                radius="lg"
                size="md"
              />
            )}
            {tab === "products" && (
              <Input
                labelPlacement="outside"
                label={t("filters.productSearch")}
                placeholder={t("filters.productPlaceholder")}
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                variant="flat"
                className="w-full md:w-64"
                radius="lg"
                size="md"
              />
            )}
            <div className="w-full md:w-72 relative">
              <Autocomplete
                labelPlacement="outside"
                label={t("filters.ownerSearch")}
                placeholder={t("filters.userPlaceholder")}
                inputValue={userSearchTerm}
                onInputChange={setUserSearchTerm}
                selectedKey={selectedUser}
                onSelectionChange={handleUserSelect}
                onOpenChange={setAutocompleteOpen}
                isLoading={loadingUsers}
                allowsCustomValue={false}
                menuTrigger="input"
                items={usersAutocomplete}
                variant="flat"
                radius="lg"
                size="md"
                clearButtonProps={{
                  onPress: () => handleUserSelect(null),
                }}
              >
                {(user) => (
                  <AutocompleteItem
                    labelPlacement="outside"
                    textValue={user.fullName}
                    key={user._id}
                    value={user._id}
                    size="md"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{user.fullName}</span>
                      <span className="text-xs text-gray-500 font-sans">
                        {user.email}
                      </span>
                    </div>
                  </AutocompleteItem>
                )}
              </Autocomplete>
            </div>
          </div>
        </div>

        {/* Info Table */}
        <div className="overflow-x-auto min-h-[300px]">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : results.length === 0 ? (
            <div className="py-20 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center border border-dashed border-gray-200">
                  <svg
                    className="w-8 h-8 text-gray-300"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                  </svg>
                </div>
              </div>
              <p className="text-gray-600 font-medium font-IBMPlex">
                {t("table.noData")}
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 text-[11px] font-bold uppercase tracking-widest font-IBMPlex">
                  <th className="px-4 py-3 w-16 text-center">
                    {t("table.rank")}
                  </th>
                  <th className="px-4 py-3 text-start">
                    {tab === "pages"
                      ? t("table.pageAndPath")
                      : tab === "products"
                        ? t("table.productAndOwner")
                        : t("table.ownerInfo")}
                  </th>
                  <th className="px-4 py-3 w-56 text-start">
                    {t("table.searchDensity")}
                  </th>
                  <th className="px-4 py-3 font-semibold text-center w-32">
                    {t("table.visitsCount")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {results.map((item, idx) => {
                  const barColor = colorsArray[idx % colorsArray.length];

                  let NameTitle = "";
                  let SubInfo = "";
                  let ExtraInfo = "";
                  let RedirectUrl = "";
                  let CopyValue = "";

                  if (tab === "pages") {
                    NameTitle = item._id;
                    SubInfo = item.product
                      ? lang === "ar"
                        ? item.product.nameAr
                        : item.product.nameEn
                      : t("table.generalPage");
                    ExtraInfo = item.owner ? item.owner.fullName : null;
                    RedirectUrl = item._id;
                    CopyValue = item._id;
                  } else if (tab === "products") {
                    NameTitle =
                      (lang === "ar"
                        ? item.product?.nameAr
                        : item.product?.nameEn) ||
                      (lang === "ar"
                        ? item.product?.nameEn
                        : item.product?.nameAr) ||
                      t("table.unknownProduct");
                    SubInfo = item.page;
                    ExtraInfo = item.owner ? item.owner.fullName : null;
                    RedirectUrl = item.page;
                    CopyValue = item.page;
                  } else if (tab === "owners") {
                    NameTitle = item.owner?.fullName || t("table.unknownUser");
                    SubInfo = item.owner?.email || "";
                    ExtraInfo = t("table.ownsProducts").replace(
                      "{count}",
                      item.productCount,
                    );
                    RedirectUrl = `/${lang === "en" ? "en" : "ar"}/search/products?ownerId=${item._id}`;
                    CopyValue = item.owner?.email || item._id;
                  }

                  const isRank1 = idx === 0;
                  const isRank2 = idx === 1;
                  const isRank3 = idx === 2;

                  return (
                    <tr
                      key={idx}
                      className="group hover:bg-gray-50/80 transition-all duration-200"
                    >
                      <td className="p-4 text-center">
                        <div
                          className={`
                          inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold font-IBMPlex
                          ${
                            isRank1
                              ? "bg-amber-100 text-amber-600 shadow-sm"
                              : isRank2
                                ? "bg-slate-100 text-slate-500"
                                : isRank3
                                  ? "bg-orange-50 text-orange-400"
                                  : "text-gray-300"
                          }
                        `}
                        >
                          {idx + 1}
                        </div>
                      </td>
                      <td className="p-4 text-start">
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col gap-1 min-w-0 flex-1">
                            <div className="flex items-center gap-2 group/title">
                              <a
                                href={RedirectUrl}
                                target="_blank"
                                className="font-bold text-gray-900 truncate hover:text-[#F48A42] transition-colors flex items-center gap-1.5"
                                dir={tab === "pages" ? "ltr" : "rtl"}
                              >
                                {NameTitle}
                                <ExternalLinkIcon
                                  className="opacity-0 group-hover/title:opacity-100 transition-opacity text-[#F48A42] shrink-0"
                                  size={13}
                                />
                              </a>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span
                                className="truncate max-w-[200px]"
                                dir={tab === "pages" ? "rtl" : "ltr"}
                              >
                                {SubInfo}
                              </span>
                              {ExtraInfo && (
                                <>
                                  <span className="w-1 h-1 rounded-full bg-gray-300 shrink-0" />
                                  <span className="text-gray-400 flex items-center gap-1 shrink-0">
                                    <User size={12} className="opacity-60" />
                                    {ExtraInfo}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          <button
                            onClick={() => handleCopy(CopyValue)}
                            className="p-1.5 rounded-md hover:bg-gray-200 text-gray-400 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                            title="Copy Path"
                          >
                            {copied === CopyValue ? (
                              <CheckIcon className="text-green-500" />
                            ) : (
                              <CopyIcon />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="p-4 text-start">
                        <div className="min-w-[140px]">
                          <MiniBar
                            count={item.totalVisits}
                            max={maxHitCount}
                            color={barColor}
                          />
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center justify-center font-bold text-gray-900 font-IBMPlex bg-white border border-gray-100 shadow-sm rounded-lg px-3 py-1.5 text-xs min-w-[50px]">
                          {lang === "ar"
                            ? item.totalVisits.toLocaleString("ar")
                            : item.totalVisits.toLocaleString("en")}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
