"use client";
import React, { useState, useEffect } from "react";
import { Group } from "@visx/group";
import { Bar, Pie } from "@visx/shape";
import { scaleBand, scaleLinear, scaleOrdinal } from "@visx/scale";
import { AxisBottom, AxisRight } from "@visx/axis";
import { useTooltip, useTooltipInPortal, defaultStyles } from "@visx/tooltip";
import { localPoint } from "@visx/event";
import { ChevronDown } from "@/components/ui/svgs/icons/ChevronDownSvg";
import { ChevronLeft } from "@/components/ui/svgs/icons/ChevronLeftSvg";
import { Currency } from "@/components/ui/svgs/icons/CurrencySvg";
import { formatNumeric } from "@/lib/utils";

const PIE_COLORS = ["#4ade80", "#f97316", "#ef4444"];

const tooltipStyles = {
  ...defaultStyles,
  background: "#1e293b",
  color: "white",
  borderRadius: 6,
  fontSize: 12,
  padding: "6px 8px",
  border: "none",
  zIndex: 1000,
  boxShadow:
    "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
};

const incomeColor = "#4ade80";
const withdrawalColor = "#f87171";

const margin = { top: 30, right: 20, bottom: 40, left: 40 };
const barPadding = 0.2;

const BarCharts = ({ data, totals }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [incomeData, setIncomeData] = useState(data);
  const [incomeTotals, setIncomeTotals] = useState(totals);
  const [loading, setLoading] = useState(false);
  const [firstRender, setFirstRender] = useState(false);

  const fetchAnalyticsData = async (month, year) => {
    try {
      setLoading(true);
      const url = new URL("/api/admin/analytics", window.location.origin);
      url.searchParams.set("month", month.toString());
      url.searchParams.set("year", year.toString());
      url.searchParams.set("client", "true");

      const response = await fetch(url.toString(), {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setIncomeData(result.data.chartData || []);
      setIncomeTotals(
        result.data.totals || { income: 0, withdrawals: 0, netProfit: 0 },
      );
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      setIncomeData([]);
      setIncomeTotals({ income: 0, withdrawals: 0, netProfit: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleMonthYearChange = (month, year) => {
    fetchAnalyticsData(month, year);
    setSelectedMonth(month);
    setSelectedYear(year);
  };

  useEffect(() => {
    if (!firstRender) return setFirstRender(true);
    fetchAnalyticsData(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear]);

  const width = 1000;
  const height = 520;
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  const dateScale = scaleBand({
    domain: incomeData.map((d) => d.date),
    padding: barPadding,
    range: [0, xMax],
  });

  const yScale = scaleLinear({
    domain: [
      0,
      Math.max(...incomeData.map((d) => Math.max(d.income, d.withdrawals))) +
        20,
    ],
    nice: true,
    range: [yMax, 0],
  });

  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
    hideTooltip,
  } = useTooltip();

  const { ChartRef, TooltipInPortal } = useTooltipInPortal({
    detectBounds: true,
    scroll: true,
  });

  const handleMouseOver = (event, d, key) => {
    const coords = localPoint(event);
    showTooltip({
      tooltipData: {
        date: d.date,
        value: d[key],
        type: key === "income" ? "دخل" : "مسحوبات",
      },
      tooltipLeft: (coords?.x || 0) > 200 ? coords.x - 200 : coords.x,
      tooltipTop: (coords?.y || 0) < 250 ? coords.y + 150 : coords.y,
    });
  };

  if (loading) {
    return (
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm flex flex-col w-full">
        <div className="flex flex-wrap justify-between items-center md:mb-8 mb-2">
          <h2 className="text-sm md:text-xl font-bold font-IBMPlex">
            ملخص الدخل والمسحوبات
          </h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) =>
                  handleMonthYearChange(parseInt(e.target.value), selectedYear)
                }
                className="appearance-none bg-transparent rounded-md px-4 py-2 text-sm text-gray-700 pe-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-gray-300"
              >
                <option value={1}>يناير</option>
                <option value={2}>فبراير</option>
                <option value={3}>مارس</option>
                <option value={4}>أبريل</option>
                <option value={5}>مايو</option>
                <option value={6}>يونيو</option>
                <option value={7}>يوليو</option>
                <option value={8}>أغسطس</option>
                <option value={9}>سبتمبر</option>
                <option value={10}>أكتوبر</option>
                <option value={11}>نوفمبر</option>
                <option value={12}>ديسمبر</option>
              </select>
              <ChevronDown className="absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) =>
                  handleMonthYearChange(selectedMonth, parseInt(e.target.value))
                }
                className="appearance-none bg-transparent rounded-md px-4 py-2 text-sm text-gray-700 pe-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-gray-300"
              >
                {Array.from({ length: 10 }, (_, i) => {
                  const year = new Date().getFullYear() - i;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
              <ChevronDown className="absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">جاري تحميل البيانات...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm flex flex-col w-full">
      <div className="flex gap-2 flex-wrap justify-between items-center md:mb-8 mb-2">
        <h2 className="text-sm md:text-xl font-bold font-IBMPlex">
          ملخص الدخل والمسحوبات
        </h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={selectedMonth}
              onChange={(e) =>
                handleMonthYearChange(parseInt(e.target.value), selectedYear)
              }
              className="appearance-none bg-transparent rounded-md md:px-4 px-2 md:py-2 py-1 text-sm text-gray-700 pe-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-gray-300"
            >
              <option value={1}>يناير</option>
              <option value={2}>فبراير</option>
              <option value={3}>مارس</option>
              <option value={4}>أبريل</option>
              <option value={5}>مايو</option>
              <option value={6}>يونيو</option>
              <option value={7}>يوليو</option>
              <option value={8}>أغسطس</option>
              <option value={9}>سبتمبر</option>
              <option value={10}>أكتوبر</option>
              <option value={11}>نوفمبر</option>
              <option value={12}>ديسمبر</option>
            </select>
            <ChevronDown className="absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) =>
                handleMonthYearChange(selectedMonth, parseInt(e.target.value))
              }
              className="appearance-none bg-transparent rounded-md md:px-4 px-2 md:py-2 py-1 text-sm text-gray-700 pe-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-gray-300"
            >
              {Array.from({ length: 10 }, (_, i) => {
                const year = new Date().getFullYear() - i;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
            <ChevronDown className="absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
        </div>
      </div>
      <div className="flex flex-col md:justify-between md:flex-row">
        <svg
          ref={ChartRef}
          width="100%"
          viewBox={`0 0 ${width} ${height}`}
          height="100%"
        >
          <Group top={margin.top} left={margin.left}>
            {/* Grid Lines - Horizontal (like notebook lines) */}
            {yScale.ticks(10).map((tick) => (
              <line
                key={`grid-h-${tick}`}
                x1={0}
                x2={xMax}
                y1={yScale(tick)}
                y2={yScale(tick)}
                stroke="#e2e8f0"
                strokeWidth={1}
              />
            ))}

            {/* Bars */}
            {incomeData.map((d, i) => {
              const x = dateScale(d.date) ?? 0;
              const barWidth = (dateScale.bandwidth() - 8) / 2;
              const incomeBarHeight = yMax - yScale(d.income);
              const withdrawalBarHeight = yMax - yScale(d.withdrawals);

              return (
                <Group key={`bar-${i}`}>
                  {/* دخل Bar */}
                  <Bar
                    x={x}
                    y={yScale(d.income)}
                    width={barWidth}
                    height={incomeBarHeight}
                    fill={incomeColor}
                    rx={4}
                    onMouseMove={(e) => handleMouseOver(e, d, "income")}
                    onMouseLeave={hideTooltip}
                  />
                  {/* مسحوبات Bar */}
                  <Bar
                    x={x + barWidth + 4}
                    y={yScale(d.withdrawals)}
                    width={barWidth}
                    height={withdrawalBarHeight}
                    fill={withdrawalColor}
                    rx={4}
                    onMouseMove={(e) => handleMouseOver(e, d, "withdrawals")}
                    onMouseLeave={hideTooltip}
                  />
                </Group>
              );
            })}

            {/* Axes */}
            <AxisBottom
              scale={dateScale}
              top={yMax}
              stroke="#cbd5e1"
              tickStroke="#cbd5e1"
              tickLabelProps={{
                fontSize: 12,
                fill: "#64748b",
                textAnchor: "middle",
                direction: "rtl",
              }}
            />
            <AxisRight
              scale={yScale}
              left={xMax - 5}
              stroke="#cbd5e1"
              tickStroke="#cbd5e1"
              numTicks={6}
              tickLabelProps={{
                fontSize: 12,
                fill: "#64748b",
                dx: "-0.25em",
                textAnchor: "end",
              }}
            />
          </Group>
        </svg>
        <div className="flex flex-col md:gap-8 gap-2">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-green-400 rounded-full"></div>
              <span className="md:text-sm text-[13px]  text-darkNavy">دخل</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-red-400 rounded-full"></div>
              <span className="md:text-sm text-[13px]  text-darkNavy">
                مسحوبات
              </span>
            </div>
          </div>
          <div className="h-[1px] w-full bg-[#B3B3B380]" />
          {/* Summary Section */}
          <div className="flex flex-col md:gap-4 gap-2">
            <div className="flex flex-col gap-1">
              <p className="text-darkNavy text-[13px] md:text-sm font-normal">
                مجموع الدخل
              </p>
              <p className="md:text-2xl text-lg font-bold text-darkNavy flex items-center gap-1">
                {incomeTotals?.income || 0}{" "}
                <Currency className="w-5 h-5" size={20} />
              </p>
            </div>
            <div className="h-[1px] w-full bg-[#B3B3B380]" />
            <div className="flex flex-col gap-1">
              <p className="text-gray-500 text-[13px] md:text-sm">
                مجموع المسحوبات
              </p>
              <p className="md:text-2xl text-lg font-bold text-red-500 flex items-center gap-1">
                {incomeTotals?.withdrawals || 0}{" "}
                <Currency className="w-5 h-5" size={20} />
              </p>
            </div>
            <div className="h-[1px] w-full bg-[#B3B3B380]" />
            <div className="flex items-center justify-between">
              <p className="text-gray-500 text-[13px] md:text-sm">صافي الربح</p>
              <p className="md:text-2xl text-base font-bold text-[#4FD658] flex items-center gap-1">
                {incomeTotals?.netProfit || 0}{" "}
                <Currency
                  color="#4FD658"
                  className="md:w-5 md:h-5 w-4 h-4"
                  size={20}
                />
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltipOpen && tooltipData && (
        <TooltipInPortal
          top={tooltipTop}
          left={tooltipLeft}
          style={tooltipStyles}
        >
          <div className="text-center">
            <div className="text-sm text-white">{tooltipData.date}</div>
            <div className="font-bold text-white">{tooltipData.value} ₪</div>
            <div className="text-xs text-gray-300">{tooltipData.type}</div>
          </div>
        </TooltipInPortal>
      )}
    </div>
  );
};

const PieChart = ({ pieData }) => {
  const width = 500;
  const height = 500;
  const radius = Math.min(width, height) / 2;

  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    detectBounds: true,
    scroll: true,
  });
  const {
    tooltipOpen,
    tooltipTop,
    tooltipLeft,
    tooltipData,
    showTooltip,
    hideTooltip,
  } = useTooltip();

  const pieColorScale = scaleOrdinal({
    domain: pieData.map((d) => d.name),
    range: PIE_COLORS,
  });

  const handlePieChartMouseMove = (event, data) => {
    const coords = localPoint(event);
    showTooltip({
      tooltipData: data,
      tooltipLeft: (coords?.x || 0) > 200 ? coords.x - 280 : coords.x,
      tooltipTop: (coords?.y || 0) > 200 ? coords.y - 200 : coords.y - 20,
    });
  };

  return (
    <div className="bg-white flex flex-col gap-2 p-4 md:p-6 rounded-xl shadow-sm w-full max-w-full">
      <div className="flex flex-col gap-4 md:gap-8">
        <div className="flex justify-between items-center pb-4 md:pb-6 border-b border-b-black/10">
          <h2 className="text-sm md:text-xl font-bold font-IBMPlex">
            ملخص المستخدمين
          </h2>
          <button className="text-darkNavy font-NotoSansArabic text-[13px] md:font-semibold flex gap-1 items-center justify-center">
            عرض الكل
            <ChevronLeft />
          </button>
        </div>
        <svg
          className="self-center !relative h-[200px] md:h-auto"
          width="100%"
          viewBox={`0 0 ${width} ${height}`}
          height="100%"
          ref={containerRef}
        >
          <Group top={height / 2} left={width / 2}>
            <Pie
              data={pieData}
              pieValue={(d) => d.value}
              outerRadius={radius}
              innerRadius={radius - 90}
              padAngle={0.01}
            >
              {(pie) =>
                pie.arcs.map((arc, i) => {
                  const { name, value } = arc.data;
                  const [centroidX, centroidY] = pie.path.centroid(arc);
                  return (
                    <g key={`arc-${name}`}>
                      <path
                        d={pie.path(arc) ?? ""}
                        fill={pieColorScale(name)}
                        onMouseMove={(e) =>
                          handlePieChartMouseMove(e, { name, value })
                        }
                        onMouseLeave={hideTooltip}
                      />
                    </g>
                  );
                })
              }
            </Pie>
          </Group>
        </svg>
      </div>
      {tooltipOpen && tooltipData && (
        <TooltipInPortal
          top={tooltipTop}
          left={tooltipLeft}
          style={tooltipStyles}
        >
          <div className="text-center">
            <div className="text-sm">{tooltipData.name}</div>
            <div className="font-bold text-sm md:text-base">
              {tooltipData.value.toLocaleString()} مستخدم
            </div>
          </div>
        </TooltipInPortal>
      )}

      {/* Legend */}
      <div className="mt-6 space-y-4">
        {pieData.map((item, i) => (
          <div key={item.name} className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
              ></div>
              <span className="text-gray-800 text-xs md:text-sm">
                {item.name}
              </span>
            </div>
            <span className="font-bold text-sm md:text-medium">
              {formatNumeric(item.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const AnalyticsDashboard = ({ chartData, pieData, totals }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[25%_1fr] md:gap-5 gap-3 bg-gray-100">
      <PieChart pieData={pieData} />
      <BarCharts data={chartData} totals={totals} />
    </div>
  );
};

export default AnalyticsDashboard;
