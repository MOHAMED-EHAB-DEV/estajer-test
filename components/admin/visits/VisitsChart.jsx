"use client";
import React, { useState, useEffect } from "react";
import { Group } from "@visx/group";
import { AreaClosed, Line, Bar, LinePath } from "@visx/shape";
import { curveMonotoneX } from "@visx/curve";
import { GridRows } from "@visx/grid";
import { scaleTime, scaleLinear } from "@visx/scale";
import { AxisBottom, AxisRight } from "@visx/axis";
import { LinearGradient } from "@visx/gradient";
import { useTooltip, useTooltipInPortal, defaultStyles } from "@visx/tooltip";
import { localPoint } from "@visx/event";
import { bisector } from "d3-array";
import { formatNumeric } from "@/lib/utils";

const tooltipStyles = {
  ...defaultStyles,
  background: "rgba(15, 15, 26, 0.95)",
  color: "white",
  borderRadius: 8,
  fontSize: 13,
  padding: "8px 12px",
  border: "none",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
};

const margin = { top: 20, right: 50, bottom: 40, left: 20 };

// Accessors
const getDate = (d) => new Date(d.date);
const getValue = (d) => d.value;
const bisectDate = bisector(getDate).left;

const VisitsChart = ({ data = [], translations }) => {
  const t = (key) => (translations ? translations(key) : key);
  const [dimensions, setDimensions] = useState({ width: 1000, height: 300 });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth < 768 ? window.innerWidth - 60 : 1000,
        height: window.innerWidth < 768 ? 350 : 300,
      });
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { width, height } = dimensions;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Tooltip
  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
    hideTooltip,
  } = useTooltip();

  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    detectBounds: true,
    scroll: true,
  });

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 w-full flex items-center justify-center h-[300px]">
        <p className="text-gray-500">{t("noData")}</p>
      </div>
    );
  }

  // Scales
  const dateScale = scaleTime({
    domain: [Math.min(...data.map(getDate)), Math.max(...data.map(getDate))],
    range: [0, innerWidth],
  });

  const valueScale = scaleLinear({
    domain: [0, Math.max(...data.map(getValue)) * 1.1],
    range: [innerHeight, 0],
    nice: true,
  });

  const handleTooltip = (event) => {
    const { x } = localPoint(event) || { x: 0 };
    const x0 = dateScale.invert(x - margin.left);
    const index = bisectDate(data, x0, 1);
    const d0 = data[index - 1];
    const d1 = data[index];
    let d = d0;

    if (d1 && getDate(d1)) {
      d =
        x0.valueOf() - getDate(d0).valueOf() >
        getDate(d1).valueOf() - x0.valueOf()
          ? d1
          : d0;
    }

    if (d) {
      showTooltip({
        tooltipData: d,
        tooltipLeft: x,
        tooltipTop: valueScale(getValue(d)),
      });
    }
  };

  // Calculate stats
  const maxValue = Math.max(...data.map(getValue));
  const minValue = Math.min(...data.map(getValue));
  const maxDate = data.find((d) => d.value === maxValue);
  const minDate = data.find((d) => d.value === minValue);

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 w-full">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-b-black/10 pb-4">
        <h2 className="text-medium md:text-lg font-semibold text-darkNavy font-IBMPlex text-start">
          {t("chartSummary")}
        </h2>
      </div>

      {/* Chart */}
      <div className="grid grid-rows-2 md:grid-rows-1 md:grid-cols-[83%_1fr] gap-4 py-6">
        <div className="relative">
          <svg
            ref={containerRef}
            width="100%"
            viewBox={`0 0 ${width} ${height}`}
            className="overflow-visible"
          >
            <LinearGradient
              id="visits-gradient"
              from="#F48A42"
              to="#F48A4280"
              fromOpacity={0.3}
              toOpacity={0.05}
            />

            <Group left={margin.left} top={margin.top}>
              {/* Grid */}
              <GridRows
                scale={valueScale}
                width={innerWidth}
                strokeDasharray="0,0"
                stroke="#DBDBDB"
                strokeOpacity={1}
                strokeWidth={1}
                numTicks={5}
              />

              {/* Area */}
              <AreaClosed
                data={data}
                x={(d) => dateScale(getDate(d))}
                y={(d) => valueScale(getValue(d))}
                yScale={valueScale}
                fill="url(#visits-gradient)"
                curve={curveMonotoneX}
              />

              {/* LinePath */}
              <LinePath
                data={data}
                x={(d) => dateScale(getDate(d))}
                y={(d) => valueScale(getValue(d))}
                stroke="#F48A42"
                strokeWidth={4}
                curve={curveMonotoneX}
              />

              {/* Tooltip overlay */}
              <Bar
                x={0}
                y={0}
                width={innerWidth}
                height={innerHeight}
                fill="transparent"
                onMouseMove={handleTooltip}
                onMouseLeave={hideTooltip}
              />

              {/* Tooltip indicator line */}
              {tooltipOpen && tooltipData && (
                <g>
                  <Line
                    from={{ x: tooltipLeft - margin.left, y: 0 }}
                    to={{ x: tooltipLeft - margin.left, y: innerHeight }}
                    stroke="#F48A42"
                    strokeWidth={1}
                    strokeDasharray="4,4"
                    pointerEvents="none"
                  />
                  <circle
                    cx={tooltipLeft - margin.left}
                    cy={tooltipTop}
                    r={5}
                    fill="#F48A42"
                    stroke="white"
                    strokeWidth={2}
                    pointerEvents="none"
                  />
                </g>
              )}

              {/* Axes */}
              <AxisBottom
                top={innerHeight}
                scale={dateScale}
                numTicks={10}
                stroke="transparent"
                tickStroke="transparent"
                tickLabelProps={{
                  fontSize: "14px",
                  fill: "#0D092B",
                  textAnchor: "middle",
                  fontWeight: 500,
                }}
                tickFormat={(date) =>
                  `${date.getDate()}/${date.getMonth() + 1}`
                }
              />

              <AxisRight
                left={innerWidth + 20}
                scale={valueScale}
                numTicks={5}
                stroke="transparent"
                tickStroke="transparent"
                tickLabelProps={{
                  fontSize: 14,
                  fill: "#0D092B",
                  dx: 10,
                  textAnchor: "start",
                  fontWeight: 500,
                }}
                tickFormat={(value) => formatNumeric(value)}
              />
            </Group>
          </svg>

          {/* Tooltip */}
          {tooltipOpen && tooltipData && (
            <TooltipInPortal
              top={tooltipTop + margin.top}
              left={tooltipLeft}
              style={tooltipStyles}
            >
              <div className="flex flex-col gap-1">
                <div className="text-xs text-gray-300">
                  {formatDate(tooltipData.date)}
                </div>
                <div className="font-bold text-base flex items-center gap-1">
                  <span>{tooltipData.value.toLocaleString()}</span>
                  <span className="text-xs font-normal">
                    {t("visitorUnit")}
                  </span>
                </div>
              </div>
            </TooltipInPortal>
          )}
        </div>

        {/* Stats Summary */}
        <div className="flex flex-col gap-6 text-start">
          {/* Highest */}
          <div className="flex flex-col gap-1">
            <p className="text-sm text-darkNavy">{t("highestCount")}</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-success">
                {formatNumeric(maxValue)}
              </span>
            </div>
            <p className="text-lg font-semibold text-darkNavy">
              {maxDate && formatDate(maxDate.date)}
            </p>
          </div>

          <div className="h-[1px] w-full bg-[#B3B3B380]" />

          {/* Lowest */}
          <div className="flex flex-col gap-1">
            <p className="text-sm text-darkNavy">{t("lowestCount")}</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary">
                {formatNumeric(minValue)}
              </span>
            </div>
            <p className="text-lg font-semibold text-darkNavy">
              {minDate && formatDate(minDate.date)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisitsChart;
