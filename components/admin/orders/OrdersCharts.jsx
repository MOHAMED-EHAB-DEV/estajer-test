"use client";
import React from "react";
import { Group } from "@visx/group";
import { Pie, Bar } from "@visx/shape";
import { scaleBand, scaleLinear } from "@visx/scale";
import { AxisBottom, AxisRight } from "@visx/axis";
import { useTooltip, useTooltipInPortal, defaultStyles } from "@visx/tooltip";
import { localPoint } from "@visx/event";
import { formatNumeric } from "@/lib/utils";

const pieData = [
  { name: "طلبات مقبولة", value: 319000, color: "#4ade80" },
  { name: "طلبات قيد الانتظار", value: 105000, color: "#f97316" },
  { name: "طلبات مدفوعة قيد الانتظار", value: 1245, color: "#a855f7" },
  { name: "طلبات ملغية", value: 1245, color: "#fde68a" },
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

function PieChart() {
  const width = 300;
  const height = 300;
  const radius = Math.min(width, height) / 2;

  const { containerRef, TooltipInPortal } = useTooltipInPortal();
  const {
    tooltipOpen,
    tooltipTop,
    tooltipLeft,
    tooltipData,
    showTooltip,
    hideTooltip,
  } = useTooltip();

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col w-full gap-4 min-h-[300px]">
      <h2 className="text-lg text-darkNavy font-semibold font-IBMPlex border-b border-b-black/10 pb-4">
        ملخص الطلبات
      </h2>
      <svg
        ref={containerRef}
        viewBox={`0 0 ${width} ${height}`}
        className="self-center w-full max-w-[250px] h-auto"
      >
        <Group top={height / 2} left={width / 2}>
          <Pie
            data={pieData}
            pieValue={(d) => d.value}
            outerRadius={radius}
            padAngle={0.005}
          >
            {(pie) =>
              pie.arcs.map((arc) => {
                const [centroidX, centroidY] = pie.path.centroid(arc);
                return (
                  <g key={arc.data.name}>
                    <path
                      d={pie.path(arc)}
                      fill={arc.data.color}
                      onMouseMove={(e) => {
                        const coords = localPoint(e);
                        showTooltip({
                          tooltipData: arc.data,
                          tooltipLeft: coords.x,
                          tooltipTop: coords.y,
                        });
                      }}
                      onMouseLeave={hideTooltip}
                    />
                  </g>
                );
              })
            }
          </Pie>
        </Group>
      </svg>

      {tooltipOpen && tooltipData && (
        <TooltipInPortal
          top={tooltipTop}
          left={tooltipLeft}
          style={tooltipStyles}
        >
          <div className="text-center">
            <div className="text-sm">{tooltipData.name}</div>
            <div className="font-bold">
              {tooltipData.value.toLocaleString()}
            </div>
          </div>
        </TooltipInPortal>
      )}

      {/* Legend */}
      <div className="flex flex-col gap-1">
        {pieData.map((item) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-sm text-darkNavy">
                {item.name}
              </span>
            </div>
            <span className="font-semibold text-medium text-darkNavy">
              {formatNumeric(item.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

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
  const minCategory = barData.reduce((a, b) => (a.value < b.value ? a : b));

  return (
    <div className="bg-white rounded-xl w-full min-h-[300px] shadow-sm p-4 flex flex-col">
      <div className="flex items-center justify-between pb-4 border-b border-b-black/10">
        <h2 className="text-lg text-darkNavy font-IBMPlex font-semibold">
          ملخص التصنيفات بالنسبة لعدد الطلبات
        </h2>
        <select className="bg-transparent rounded-md px-3 py-1 text-sm">
          <option>آخر 6 شهور</option>
        </select>
      </div>

      <div className="grid grid-rows-2 grid-cols-none md:grid-cols-[77%_1fr] md:grid-rows-none gap-6 mt-4">
        <svg
          ref={containerRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto"
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
                  أكثر تصنيف طلبا
                </p>
                <p className="text-success font-bold text-sm">أثاث</p>
              </div>
              <p className="text-xl font-bold text-darkNavy flex items-center gap-2">
                <span className="text-3xl">505</span>
                طلب
              </p>
            </div>
            <div className="h-[1px] w-full bg-[#B3B3B380]" />
            <div className="flex flex-col gap-1">
              <div className="flex flex-col gap-1">
                <p className="text-gray-500 text-sm font-normal">
                  أقل تصنيف طلبا
                </p>
                <p className="text-[#F44242] font-bold text-sm">ألعاب</p>
              </div>
              <p className="text-xl font-bold text-darkNavy flex items-center gap-1">
                <span className="text-3xl">10</span>
                طلب
              </p>
            </div>
          </div>
        </div>
      </div>

      {tooltipOpen && tooltipData && (
        <TooltipInPortal
          top={tooltipTop}
          left={tooltipLeft}
          style={tooltipStyles}
        >
          <div className="text-center">
            <div>{tooltipData.category}</div>
            <div className="font-bold">{tooltipData.value} طلب</div>
          </div>
        </TooltipInPortal>
      )}
    </div>
  );
}

export default function OrdersCharts() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[40%_1fr] gap-4 w-full">
      <PieChart />
      <BarChart />
    </div>
  );
}
