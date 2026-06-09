"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import VisitsChart from "@/components/admin/visits/VisitsChart";
import DateRangePicker from "@/components/admin/DateRangePicker";
import Cards from "@/components/admin/Cards";
import { User } from "@/components/ui/svgs/icons/UserSvg";

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

const formatDateForApi = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function DashboardVisitsContainer({
  lang,
  translate,
  initialData,
}) {
  const trans = useTranslations(translate);
  const t = (text) => trans(`dashboard.visits.${text}`);

  const [range, setRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });

  const [data, setData] = useState(
    initialData || {
      today: 0,
      total: 0,
      chartData: [],
      topPages: [],
    },
  );
  const [loading, setLoading] = useState(false);
  const [isFirstRender, setIsFirstRender] = useState(true);

  const fetchVisits = useCallback(async () => {
    if (isFirstRender && initialData) {
      setIsFirstRender(false);
      return;
    }

    setLoading(true);
    try {
      let url = "/api/dashboard/visits?client=true";
      if (range?.from) {
        url += `&startDate=${formatDateForApi(range.from)}`;
        url += `&endDate=${formatDateForApi(range.to || range.from)}`;
      }
      const response = await fetch(url);
      const res = await response.json();
      if (res.success) {
        setData(res.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [range, isFirstRender, initialData]);

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  const { chartData = [], topPages = [] } = data;
  const avgVisitors = Math.round(data.total / (chartData.length || 1));
  const peakVisits = Math.max(...chartData.map((d) => d.value), 0);
  const maxHitCount = topPages.length > 0 ? topPages[0].totalVisits : 1;
  const colorsArray = ["#F48A42", "#9747FF", "#4FD658", "#3B82F6", "#EC4899"];

  const statsCards = [
    {
      title: t("totalVisits"),
      Icon: User,
      iconColor: "#F48A42",
      value: data.total,
      valueColor: "#F48A42",
      review: t("totalVisitsDesc"),
      reviewColor: "#4FD658",
    },
    {
      title: t("todayVisits"),
      Icon: User,
      iconColor: "#F48A42",
      value: data.today,
      valueColor: "#F48A42",
      review: t("todayVisitsDesc"),
      reviewColor: "#4FD658",
    },
    {
      title: t("averageDaily"),
      Icon: User,
      iconColor: "#9747FF",
      value: avgVisitors,
      valueColor: "#9747FF",
      review: t("averageDailyDesc"),
      reviewColor: "#4FD658",
    },
    {
      title: t("peakDaily"),
      Icon: User,
      iconColor: "#4FD658",
      value: peakVisits,
      valueColor: "#4FD658",
      review: t("peakDailyDesc"),
      reviewColor: "#4FD658",
    },
  ];

  return (
    <div className="min-h-screen pb-16">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div className="text-start">
          <h1 className="text-2xl md:text-3xl font-bold font-IBMPlex text-gray-900 flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#F48A42] to-[#f48a42aa] text-white shrink-0 shadow-sm">
              <TrendIcon className="w-6 h-6" />
            </span>
            {t("analytics")}
          </h1>
          <p className="text-gray-500 mt-1 text-sm">{t("overview")}</p>
        </div>

        <div className="w-full md:w-[320px]">
          <DateRangePicker
            lang={lang}
            translate={trans}
            onSelect={setRange}
            selectedRange={range}
          />
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

      <div className="mb-8">
        <VisitsChart data={chartData} translations={t} />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 text-start">
          <h2 className="text-lg font-bold text-gray-800 font-IBMPlex">
            {t("mostVisited")}
          </h2>
          <p className="text-sm text-gray-500 mt-1">{t("mostVisitedDesc")}</p>
        </div>

        <div className="overflow-x-auto min-h-[300px]">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-[#F48A42] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : topPages.length === 0 ? (
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
                {t("noVisits")}
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 text-[11px] font-bold uppercase tracking-widest font-IBMPlex">
                  <th className="px-4 py-3 w-16 text-center">{t("rank")}</th>
                  <th className="px-4 py-3 text-start">{t("pageName")}</th>
                  <th className="px-4 py-3 w-56 text-start">{t("interest")}</th>
                  <th className="px-4 py-3 font-semibold text-center w-32">
                    {t("visitsCount")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {topPages.map((item, idx) => {
                  const barColor = colorsArray[idx % colorsArray.length];
                  let isProfile = item._id.includes("/profile/");
                  let NameTitle = isProfile
                    ? t("profile")
                    : (lang === "ar"
                        ? item.product?.nameAr
                        : item.product?.nameEn) || t("unknownProduct");
                  let SubInfo = item._id;
                  let RedirectUrl = item._id;

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
                        <div className="flex flex-col gap-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2 group/title">
                            <a
                              href={RedirectUrl}
                              target="_blank"
                              className="font-bold text-gray-900 truncate hover:text-[#F48A42] transition-colors flex items-center gap-1.5"
                            >
                              {NameTitle}
                              <ExternalLinkIcon
                                className="opacity-0 group-hover/title:opacity-100 transition-opacity text-[#F48A42] shrink-0"
                                size={13}
                              />
                            </a>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="truncate max-w-[200px]">
                              {SubInfo}
                            </span>
                          </div>
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
