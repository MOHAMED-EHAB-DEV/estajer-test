"use client";
import React from "react";
import { Group } from "@visx/group";
import { Pie } from "@visx/shape";
import { scaleOrdinal } from "@visx/scale";
import { useTooltip, useTooltipInPortal, defaultStyles } from "@visx/tooltip";
import { localPoint } from "@visx/event";
import { formatNumeric } from "@/lib/utils";
import { ChevronDown } from "@/components/ui/svgs/icons/ChevronDownSvg";;

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

const pieData1 = [
  { name: "تذاكر دعم مغلقة (تم حلها)", value: 319, color: "#4FD658" },
  { name: "تذاكر دعم مفتوحة", value: 105, color: "#F48A42" },
  { name: "تذاكر دعم ملغية", value: 49, color: "#F55757" },
];

const pieData2 = [
  { name: "مستخدمين", value: 319000, color: "#F48A42" },
  { name: "شركات", value: 70000, color: "#F55757" },
];

const PieChart = ({ pieData, title }) => {
  const width = 400;
  const height = 400;
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
          <h2 className="text-lg md:text-xl font-bold font-IBMPlex">{title}</h2>
          <div className="relative">
            <select className="appearance-none bg-transparent rounded-md px-4 py-2 text-sm text-gray-700 pe-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-gray-300">
              <option value="today">اليوم</option>
            </select>
            <ChevronDown className="absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
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
            <div className="font-bold">
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

const SupportCharts = ({ stats }) => {
  const chartData1 = [
    { name: "تذاكر دعم مغلقة (تم حلها)", value: stats?.solved || 0, color: "#4FD658" },
    { name: "تذاكر دعم مفتوحة", value: (stats?.new || 0) + (stats?.inprogress || 0), color: "#F48A42" },
    { name: "تذاكر دعم ملغية", value: stats?.cancelled || 0, color: "#F55757" },
  ];

  const chartData2 = [
    { name: "مستخدمين", value: stats?.userCount || 0, color: "#F48A42" },
    { name: "زوار", value: stats?.guestCount || 0, color: "#4FD658" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-gray-100">
      <PieChart pieData={chartData1} title="ملخص التذاكر" />
      <PieChart pieData={chartData2} title="ملخص اصحاب التذاكر" />
    </div>
  );
};

export default SupportCharts;
