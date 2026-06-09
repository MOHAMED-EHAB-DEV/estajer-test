"use client";
import React from "react";
import { Group } from "@visx/group";
import { Bar, Pie } from "@visx/shape";
import { scaleBand, scaleLinear, scaleOrdinal } from "@visx/scale";
import { AxisBottom, AxisRight } from "@visx/axis";
import { useTooltip, useTooltipInPortal, defaultStyles } from "@visx/tooltip";
import { localPoint } from "@visx/event";
import { ChevronDown } from "@/components/ui/svgs/icons/ChevronDownSvg";
import { ChevronLeft } from "@/components/ui/svgs/icons/ChevronLeftSvg";
import { Currency } from "@/components/ui/svgs/icons/CurrencySvg";;
import { formatNumeric } from "@/lib/utils";

const pieData = [
    { name: "صافي الربح", value: 14700 },
    { name: "المبالغ المعلقة", value: 505 },
    { name: "المسحوبات", value: 2000 },
    { name: "النزاعات", value: 105 },
];
const PIE_COLORS = ["#4FD658", "#F48A42", "#F55757", "#9747FF"];

const data = [
    { date: "10/01", income: 115, withdrawals: 85 },
    { date: "25/01", income: 50, withdrawals: 65 },
    { date: "10/02", income: 45, withdrawals: 35 },
    { date: "25/02", income: 60, withdrawals: 50 },
    { date: "10/03", income: 30, withdrawals: 20 },
    { date: "25/03", income: 80, withdrawals: 98 },
    { date: "10/04", income: 85, withdrawals: 60 },
    { date: "25/04", income: 45, withdrawals: 30 },
    { date: "10/05", income: 55, withdrawals: 45 },
    { date: "25/05", income: 60, withdrawals: 30 },
    { date: "10/06", income: 75, withdrawals: 95 },
    { date: "25/06", income: 80, withdrawals: 50 },
];


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

const BarCharts = () => {
  const width = 1000;
  const height = 520;
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  const dateScale = scaleBand({
    domain: data.map((d) => d.date),
    padding: barPadding,
    range: [0, xMax],
  });

  const yScale = scaleLinear({
    domain: [
      0,
      Math.max(...data.map((d) => Math.max(d.income, d.withdrawals))) +
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

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col w-full">
      <div className="flex justify-between items-center md:mb-8 mb-2">
        <h2 className="text-lg md:text-xl font-bold">ملخص الدخل والمسحوبات</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              className="appearance-none bg-transparent rounded-md px-4 py-2 text-sm text-gray-700 pe-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-gray-300"
            >
              <option>يناير</option>
            </select>
            <ChevronDown className="absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
          <div className="relative">
            <select
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
            {data.map((d, i) => {
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
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-green-400 rounded-full"></div>
              <span className="text-sm text-darkNavy">دخل</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-red-400 rounded-full"></div>
              <span className="text-sm text-darkNavy">مسحوبات</span>
            </div>
          </div>
          <div className="h-[1px] w-full bg-[#B3B3B380]" />
          {/* Summary Section */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <p className="text-darkNavy text-sm font-normal">مجموع الدخل</p>
              <p className="text-2xl font-bold text-darkNavy flex items-center gap-1">
                15.2k
                <Currency className="w-5 h-5" size={20} />
              </p>
            </div>
            <div className="h-[1px] w-full bg-[#B3B3B380]" />
            <div className="flex flex-col gap-1">
              <p className="text-gray-500 text-sm">مجموع المسحوبات</p>
              <p className="text-2xl font-bold text-red-500 flex items-center gap-1">
                {505 || 0}{" "}
                <Currency className="w-5 h-5" size={20} />
              </p>
            </div>
            <div className="h-[1px] w-full bg-[#B3B3B380]" />
            <div className="flex items-center justify-between">
              <p className="text-gray-500 text-sm">صافي الربح</p>
              <p className="text-2xl font-bold text-[#4FD658] flex items-center gap-1">
                14.7k{" "}
                <Currency color="#4FD658" className="w-5 h-5" size={20} />
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
            <div className="font-bold text-white flex items-center justify-center gap-1">{tooltipData.value} <Currency className="w-4 h-4" color="#fff" /></div>
            <div className="text-xs text-gray-300">{tooltipData.type}</div>
          </div>
        </TooltipInPortal>
      )}
    </div>
  );
};

const PieChart = () => {
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
    <div className="bg-white flex flex-col gap-2 p-6 rounded-xl shadow-sm w-full max-w-full">
      <div className="flex flex-col gap-8">
        <div className="flex justify-between items-center pb-6 border-b border-b-black/10">
          <h2 className="text-lg md:text-xl font-bold">ملخص الدخل</h2>
          <button className="text-darkNavy font-NotoSansArabic text-sm font-semibold flex gap-1 items-center justify-center">
            عرض الكل
            <ChevronLeft />
          </button>
        </div>
        <svg
          className="self-center !relative"
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
            <div className="font-bold flex items-center gap-1">
              {tooltipData.value.toLocaleString()} <Currency className="w-4 h-4" color="#fff" />
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

const EarningsCharts = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[25%_1fr] gap-5 bg-gray-100">
      <PieChart />
      <BarCharts />
    </div>
  );
};

export default EarningsCharts;
