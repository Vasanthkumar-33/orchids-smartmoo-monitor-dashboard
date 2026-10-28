"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TelemetryPoint, AnalyticsSummary } from "@/lib/types";
import { Thermometer, Droplets, Activity, Clock, Info } from "lucide-react";

interface HistoricalChartsTabProps {
  telemetryPoints: TelemetryPoint[];
  period: "1h" | "24h" | "7d";
  onChangePeriod: (period: "1h" | "24h" | "7d") => void;
  analytics: AnalyticsSummary;
}

interface SeriesConfig {
  key: keyof TelemetryPoint;
  label: string;
  color: string;
  gradientId?: string;
  unit?: string;
  isArea?: boolean;
}

interface ReferenceLineConfig {
  value: number;
  label: string;
  color: string;
}

interface SvgChartProps {
  data: Array<TelemetryPoint & { formattedTime: string }>;
  series: SeriesConfig[];
  yDomain: [number, number];
  referenceLines?: ReferenceLineConfig[];
}

const SvgTimeSeriesChart: React.FC<SvgChartProps> = ({
  data,
  series,
  yDomain,
  referenceLines = [],
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const width = 800;
  const height = 220;
  const padding = { top: 22, right: 25, bottom: 32, left: 50 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const [yMin, yMax] = yDomain;

  const getY = (val: number) => {
    const clamped = Math.max(yMin, Math.min(yMax, val));
    return padding.top + (1 - (clamped - yMin) / (yMax - yMin)) * plotHeight;
  };

  const getX = (index: number) => {
    if (data.length <= 1) return padding.left;
    return padding.left + (index / (data.length - 1)) * plotWidth;
  };

  // Y-axis ticks (4 ticks)
  const yTicks = [
    yMin,
    Math.round((yMin + (yMax - yMin) * 0.33) * 10) / 10,
    Math.round((yMin + (yMax - yMin) * 0.67) * 10) / 10,
    yMax,
  ];

  // X-axis ticks (5 distributed labels)
  const xTickIndices = useMemo(() => {
    if (data.length <= 5) return data.map((_, i) => i);
    const step = (data.length - 1) / 4;
    return [0, Math.round(step), Math.round(step * 2), Math.round(step * 3), data.length - 1];
  }, [data]);

  const activePoint = hoverIndex !== null && data[hoverIndex] ? data[hoverIndex] : null;

  return (
    <div className="relative w-full select-none">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible block"
        style={{ maxHeight: "260px" }}
      >
        <defs>
          {series.map((s) => {
            if (!s.isArea) return null;
            const gradId = s.gradientId || `grad-${String(s.key)}`;
            return (
              <linearGradient key={gradId} id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.color} stopOpacity={0.35} />
                <stop offset="100%" stopColor={s.color} stopOpacity={0.02} />
              </linearGradient>
            );
          })}
        </defs>

        {/* Horizontal gridlines */}
        {yTicks.map((tickVal, idx) => {
          const y = getY(tickVal);
          return (
            <g key={idx}>
              <line
                x1={padding.left}
                x2={padding.left + plotWidth}
                y1={y}
                y2={y}
                stroke="#e2e8f0"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
              <text
                x={padding.left - 8}
                y={y + 4}
                textAnchor="end"
                fill="#64748b"
                fontSize="11"
                fontFamily="inherit"
              >
                {tickVal}
              </text>
            </g>
          );
        })}

        {/* Reference lines */}
        {referenceLines.map((ref, idx) => {
          if (ref.value < yMin || ref.value > yMax) return null;
          const y = getY(ref.value);
          return (
            <g key={idx}>
              <line
                x1={padding.left}
                x2={padding.left + plotWidth}
                y1={y}
                y2={y}
                stroke={ref.color}
                strokeDasharray="4 4"
                strokeWidth="1.5"
              />
              <text
                x={padding.left + plotWidth - 4}
                y={y - 5}
                textAnchor="end"
                fill={ref.color}
                fontSize="10"
                fontWeight="700"
                fontFamily="inherit"
              >
                {ref.label}
              </text>
            </g>
          );
        })}

        {/* Series areas and lines */}
        {data.length > 1 &&
          series.map((s) => {
            const points = data.map((d, i) => ({
              x: getX(i),
              y: getY(Number(d[s.key]) || 0),
            }));

            const linePath = `M ${points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" L ")}`;
            const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)},${(padding.top + plotHeight).toFixed(1)} L ${points[0].x.toFixed(1)},${(padding.top + plotHeight).toFixed(1)} Z`;
            const gradId = s.gradientId || `grad-${String(s.key)}`;

            return (
              <g key={String(s.key)}>
                {s.isArea && <path d={areaPath} fill={`url(#${gradId})`} />}
                <path
                  d={linePath}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            );
          })}

        {/* X-axis labels */}
        {xTickIndices.map((idx) => {
          if (!data[idx]) return null;
          const x = getX(idx);
          return (
            <text
              key={idx}
              x={x}
              y={padding.top + plotHeight + 20}
              textAnchor="middle"
              fill="#64748b"
              fontSize="11"
              fontFamily="inherit"
            >
              {data[idx].formattedTime}
            </text>
          );
        })}

        {/* Hover hairline & indicator dots */}
        {hoverIndex !== null && activePoint && (
          <g>
            <line
              x1={getX(hoverIndex)}
              x2={getX(hoverIndex)}
              y1={padding.top}
              y2={padding.top + plotHeight}
              stroke="#64748b"
              strokeDasharray="2 2"
              strokeWidth="1.5"
            />
            {series.map((s) => {
              const val = Number(activePoint[s.key]) || 0;
              return (
                <circle
                  key={String(s.key)}
                  cx={getX(hoverIndex)}
                  cy={getY(val)}
                  r="5"
                  fill={s.color}
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              );
            })}
          </g>
        )}

        {/* Invisible mouse capture rect */}
        <rect
          x={padding.left}
          y={padding.top}
          width={plotWidth}
          height={plotHeight}
          fill="transparent"
          className="cursor-crosshair"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const ratio = Math.max(0, Math.min(1, mouseX / rect.width));
            const idx = Math.round(ratio * (data.length - 1));
            setHoverIndex(idx);
          }}
          onMouseLeave={() => setHoverIndex(null)}
        />
      </svg>

      {/* Floating Hover Tooltip */}
      {hoverIndex !== null && activePoint && (
        <div
          className="absolute top-2 z-10 pointer-events-none bg-slate-900/90 text-white px-3 py-2 rounded-lg text-xs shadow-lg backdrop-blur-xs border border-slate-700/80 space-y-1"
          style={{
            left: `${Math.min(75, Math.max(15, (getX(hoverIndex) / width) * 100))}%`,
            transform: "translateX(-50%)",
          }}
        >
          <div className="font-semibold text-slate-300 border-b border-slate-700 pb-1 flex items-center justify-between gap-4">
            <span>{activePoint.formattedTime}</span>
            <span className="text-[10px] text-slate-400 font-mono">
              {new Date(activePoint.timestamp).toLocaleDateString()}
            </span>
          </div>
          <div className="space-y-0.5 pt-0.5">
            {series.map((s) => (
              <div key={String(s.key)} className="flex items-center justify-between gap-3 text-[11px]">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="h-2 w-2 rounded-full inline-block" style={{ backgroundColor: s.color }} />
                  {s.label}:
                </span>
                <span className="font-bold text-white">
                  {Number(activePoint[s.key])} {s.unit || ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const HistoricalChartsTab: React.FC<HistoricalChartsTabProps> = ({
  telemetryPoints,
  period,
  onChangePeriod,
  analytics,
}) => {
  // Format timestamps for chart axis based on period
  const formattedData = useMemo(() => {
    return telemetryPoints.map((pt) => {
      const d = new Date(pt.timestamp);
      let label = "";
      if (period === "1h") {
        label = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      } else if (period === "24h") {
        label = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      } else {
        label = `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:00`;
      }

      return {
        ...pt,
        formattedTime: label,
      };
    });
  }, [telemetryPoints, period]);

  return (
    <div className="space-y-6">
      {/* Time Range Selector Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Clock size={16} className="text-emerald-600" />
            Historical Telemetry & Environmental Time-Series
          </h2>
          <p className="text-xs text-slate-500">
            Interactive multi-sensor telemetry recorded over selected operational window
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
          {(["1h", "24h", "7d"] as const).map((p) => (
            <Button
              key={p}
              size="sm"
              variant={period === p ? "default" : "ghost"}
              onClick={() => onChangePeriod(p)}
              className={`h-7 px-3 text-xs font-semibold ${
                period === p ? "bg-emerald-700 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {p === "1h" ? "Last 1 Hour" : p === "24h" ? "Last 24 Hours" : "Last 7 Days"}
            </Button>
          ))}
        </div>
      </div>

      {/* Summary Analytics Cards for Selected Window */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">COW BODY TEMP</span>
          <div className="text-xl font-extrabold text-slate-900">{analytics.avgCowTemp}°C</div>
          <div className="text-[10px] text-slate-500">
            Min: <span className="font-semibold text-emerald-600">{analytics.minCowTemp}°C</span> | Max:{" "}
            <span className="font-semibold text-red-600">{analytics.maxCowTemp}°C</span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">BARN AMBIENT TEMP</span>
          <div className="text-xl font-extrabold text-slate-900">{analytics.avgAmbientTemp}°C</div>
          <div className="text-[10px] text-slate-500">Average inside Sector Alpha</div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">HUMIDITY & THI</span>
          <div className="text-xl font-extrabold text-amber-600">
            {analytics.avgThi} <span className="text-xs text-slate-400 font-normal">THI</span>
          </div>
          <div className="text-[10px] text-slate-500">
            Avg RH: <span className="font-semibold">{analytics.avgHumidity}%</span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">WATER LEVEL</span>
          <div className="text-xl font-extrabold text-blue-600">{analytics.avgWaterLevel}%</div>
          <div className="text-[10px] text-slate-500">Trough float nominal</div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs space-y-1 col-span-2 md:col-span-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">SENSOR FRESHNESS</span>
          <div className="text-xl font-extrabold text-emerald-600">{analytics.sensorUptimePercent}%</div>
          <div className="text-[10px] text-slate-500">Gateway packet delivery</div>
        </div>
      </div>

      {/* Chart 1: Ambient Barn Temp & Heat Stress THI */}
      <Card className="shadow-xs">
        <CardHeader className="py-3 px-4 border-b flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Thermometer size={16} className="text-sky-600" />
              Barn Environmental Ambient Temperature & Heat Index (THI)
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Correlated with livestock comfort ceiling (Reference line at THI 72.0)
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs text-slate-600">
              Unit: °C / THI
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <SvgTimeSeriesChart
            data={formattedData}
            yDomain={[15, 85]}
            series={[
              {
                key: "ambientTemp",
                label: "Barn Temp",
                color: "#0284c7",
                unit: "°C",
                isArea: true,
                gradientId: "colorAmbient",
              },
              {
                key: "thi",
                label: "Heat Index (THI)",
                color: "#d97706",
                unit: "THI",
                isArea: true,
                gradientId: "colorThi",
              },
            ]}
            referenceLines={[
              {
                value: 72,
                label: "Heat Stress THI 72",
                color: "#ef4444",
              },
            ]}
          />
          {/* Chart Legend */}
          <div className="flex items-center justify-center gap-6 mt-3 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-sky-600 inline-block" />
              <span>Barn Temp (°C)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-amber-600 inline-block" />
              <span>Heat Index (THI)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-0.5 w-4 border-t-2 border-dashed border-red-500 inline-block" />
              <span className="text-red-600 font-medium">Heat Stress Threshold (72)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chart 2: Cattle Core Body Temperature vs Safe Threshold */}
      <Card className="shadow-xs">
        <CardHeader className="py-3 px-4 border-b flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Activity size={16} className="text-emerald-600" />
              Livestock Core Body Temperature Telemetry
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Safe physiological range: 38.0°C – 39.3°C. High fever threshold at 39.8°C.
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs text-slate-600">
            Unit: °C
          </Badge>
        </CardHeader>
        <CardContent className="p-4">
          <SvgTimeSeriesChart
            data={formattedData}
            yDomain={[37.0, 41.0]}
            series={[
              {
                key: "cowTemp",
                label: "Herd Sample Core Temp",
                color: "#059669",
                unit: "°C",
                isArea: false,
              },
            ]}
            referenceLines={[
              {
                value: 39.3,
                label: "Warning Threshold (39.3°C)",
                color: "#f59e0b",
              },
              {
                value: 39.8,
                label: "Critical Fever (39.8°C)",
                color: "#ef4444",
              },
            ]}
          />
          {/* Chart Legend */}
          <div className="flex items-center justify-center gap-6 mt-3 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-emerald-600 inline-block" />
              <span>Herd Sample Core Temp (°C)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-0.5 w-4 border-t-2 border-dashed border-amber-500 inline-block" />
              <span className="text-amber-600 font-medium">Warning Threshold (39.3°C)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-0.5 w-4 border-t-2 border-dashed border-red-500 inline-block" />
              <span className="text-red-600 font-medium">Critical Fever (39.8°C)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chart 3: Water Trough & Feed Silo Reserves */}
      <Card className="shadow-xs">
        <CardHeader className="py-3 px-4 border-b flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Droplets size={16} className="text-blue-600" />
              Automated Hydration Trough & Feed Silo Reserves
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Reservoir volume monitoring to prevent drinking water exhaustion
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs text-slate-600">
            Unit: % Capacity
          </Badge>
        </CardHeader>
        <CardContent className="p-4">
          <SvgTimeSeriesChart
            data={formattedData}
            yDomain={[0, 100]}
            series={[
              {
                key: "waterLevel",
                label: "Water Trough Level",
                color: "#2563eb",
                unit: "%",
                isArea: true,
                gradientId: "colorWater",
              },
              {
                key: "feedLevel",
                label: "Feed Silo Capacity",
                color: "#d97706",
                unit: "%",
                isArea: true,
                gradientId: "colorFeed",
              },
            ]}
            referenceLines={[
              {
                value: 25,
                label: "Critical Refill Margin (25%)",
                color: "#ef4444",
              },
            ]}
          />
          {/* Chart Legend */}
          <div className="flex items-center justify-center gap-6 mt-3 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-blue-600 inline-block" />
              <span>Water Trough Level (%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-amber-600 inline-block" />
              <span>Feed Silo Capacity (%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-0.5 w-4 border-t-2 border-dashed border-red-500 inline-block" />
              <span className="text-red-600 font-medium">Critical Refill Margin (25%)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Synthetic History Disclosure */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2 text-xs text-slate-500">
        <Info size={15} className="shrink-0 text-slate-400" />
        <span>
          <strong>Data Origin Disclosure:</strong> Historical curves display dynamic simulated data generated from biological circadian models for demonstration and testing. Real hardware sensors will write directly to the database in Phase 3.
        </span>
      </div>
    </div>
  );
};
