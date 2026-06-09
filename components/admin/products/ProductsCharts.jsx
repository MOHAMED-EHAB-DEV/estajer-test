"use client";
import React from "react";
import { Group } from "@visx/group";
import { Pie, Bar } from "@visx/shape";
import { scaleBand, scaleLinear, scaleOrdinal } from "@visx/scale";
import { AxisBottom, AxisRight } from "@visx/axis";
import { useTooltip, useTooltipInPortal, defaultStyles } from "@visx/tooltip";
import { localPoint } from "@visx/event";
import { formatNumeric } from "@/lib/utils";
import { ChevronLeft } from "@/components/ui/svgs/icons/ChevronLeftSvg";;

const PIE_COLORS = ["#4ade80", "#f97316", "#ef4444"];

const pieData = [
  { name: "منتجات تم استئجارها", value: 319000, color: "#4ade80" },
  { name: "منتجات لم تستأجر بعد", value: 105000, color: "#f97316" },
  { name: "منتجات مرفوضة", value: 124500, color: "#ef4444" },
];

const barData = [
  { category: "خيام", value: 55 },
  { category: "ألعاب", value: 10 },
  { category: "كاميرات", value: 45 },
  { category: "مطابخ", value: 25 },
  { category: "أثاث", value: 125 },
  { category: "ملابس", value: 20 },
  { category: "إلكترونيات", value: 65 },
];

const tooltipStyles = {
  ...defaultStyles,
  background: "#0f0f1a",
  color: "white",
  borderRadius: 6,
  fontSize: 14,
  padding: "6px 10px",
};

const margin = { top: 20, right: 20, bottom: 40, left: 40 };

const PieChart = () => {
  const width = 450;
  const height = 450;
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
          <h2 className="text-lg md:text-xl font-bold">ملخص المستخدمين</h2>
          <button className="text-darkNavy font-NotoSansArabic text-sm font-semibold flex gap-1 items-center justify-center">
            عرض الكل
            <ChevronLeft />
          </button>
        </div>
        <svg
          className="self-center !relative max-w-[213px]"
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
            <div className="font-bold">
              {tooltipData.value.toLocaleString()} منتج
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
              <span className="text-darkNavy text-sm md:text-sm">
                {item.name}
              </span>
            </div>
            <span className="font-bold text-sm md:text-medium text-darkNavy">
              {formatNumeric(item.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

function BarChart() {
  const width = 600;
  const height = 450;
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  const xScale = scaleBand({
    domain: barData.map((d) => d.category),
    padding: 0.4,
    range: [0, xMax],
  });

  const yScale = scaleLinear({
    domain: [0, Math.max(...barData.map((d) => d.value)) + 20],
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
  const { containerRef, TooltipInPortal } = useTooltipInPortal();

  const maxCategory = barData.reduce((a, b) => (a.value > b.value ? a : b));
  // const minCategory = barData.reduce((a, b) => (a.value < b.value ? a : b));

  return (
    <div className="bg-white rounded-xl w-full min-h-[300px] shadow-sm p-4 flex flex-col">
      <div className="flex items-center justify-between pb-4 border-b border-b-black/10">
        <h2 className="text-lg text-darkNavy font-IBMPlex font-semibold">
          ملخص التصنيفات بالنسبة لعدد الطلبات
        </h2>
        <select className="bg-transparent rounded-md px-3 py-1 text-sm">
          <option>اليوم</option>
        </select>
      </div>

      <div className="grid grid-rows-2 grid-cols-none md:grid-cols-[77%_1fr] md:grid-rows-none gap-6 mt-4">
        <svg
          ref={containerRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto relative"
        >
          <Group top={margin.top} left={margin.left}>
            {yScale.ticks(10).map((tick) => (
              <line
                key={`grid-h-${tick}`}
                x1={0}
                x2={xMax}
                y1={yScale(tick)}
                y2={yScale(tick)}
                stroke="#e5e7eb"
                strokeWidth={1}
              />
            ))}

            {barData.map((d) => {
              const barHeight = yMax - yScale(d.value);
              return (
                <Bar
                  key={d.category}
                  x={xScale(d.category)}
                  y={yScale(d.value)}
                  width={xScale.bandwidth()}
                  height={barHeight}
                  fill={
                    d.category === maxCategory.category ? "#f97316" : "#fde7d4"
                  }
                  rx={4}
                  onMouseMove={(e) => {
                    const coords = localPoint(e);
                    showTooltip({
                      tooltipData: d,
                      tooltipLeft: coords.x,
                      tooltipTop: coords.y,
                    });
                  }}
                  onMouseLeave={hideTooltip}
                />
              );
            })}

            <AxisBottom
              top={yMax}
              scale={xScale}
              stroke="transparent"
              tickStroke="transparent"
              tickLabelProps={{
                fontSize: "14px",
                fill: "#000",
                textAnchor: "middle",
                fontFamily: "var(--noto-sans-arabic)",
                fontWeight: "medium",
              }}
            />

            <AxisRight
              scale={yScale}
              left={xMax - 5}
              stroke="transparent"
              tickStroke="transparent"
              numTicks={6}
              tickLabelProps={{
                fontSize: 12,
                fill: "#000",
                dx: "-0.25em",
                textAnchor: "end",
              }}
            />
          </Group>
        </svg>
        <div className="flex flex-col gap-8">
          <div className="h-[1px] w-full bg-[#B3B3B380]" />
          {/* Summary Section */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex flex-col gap-1">
                <p className="text-darkNavy text-sm font-normal">
                  أكثر تصنيف زيارة
                </p>
                <p className="text-success font-bold text-sm">أثاث</p>
              </div>
              <p className="text-xl font-bold text-darkNavy flex items-center gap-2">
                <span className="text-3xl">145</span>
                زيارة
              </p>
            </div>
            <div className="h-[1px] w-full bg-[#B3B3B380]" />
            <div className="flex flex-col gap-1">
              <div className="flex flex-col gap-1">
                <p className="text-gray-500 text-sm font-normal">
                  أقل تصنيف زيارة
                </p>
                <p className="text-[#F44242] font-bold text-sm">ألعاب</p>
              </div>
              <p className="text-xl font-bold text-darkNavy flex items-center gap-1">
                <span className="text-3xl">52</span>
                زيارة
              </p>
            </div>
          </div>
        </div>
      </div>

      {tooltipOpen && tooltipData && (
        <TooltipInPortal
          top={tooltipTop}
          left={tooltipLeft - 100}
          style={tooltipStyles}
        >
          <div className="text-center">
            <div>{tooltipData.category}</div>
            <div className="font-bold">{tooltipData.value} منتج</div>
          </div>
        </TooltipInPortal>
      )}
    </div>
  );
}

export default function ProductsCharts() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[40%_1fr] gap-4 w-full">
      <PieChart />
      <BarChart />
    </div>
  );
}
