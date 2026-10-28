"use client";

import React from "react";
import {
  Thermometer,
  Droplets,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Wheat,
  Battery,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Clock,
  ShieldAlert,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Cow, BarnEnvironment, SmartMooAlert, AnalyticsSummary } from "@/lib/types";

interface OverviewTabProps {
  cows: Cow[];
  barn: BarnEnvironment;
  alerts: SmartMooAlert[];
  analytics: AnalyticsSummary;
  onSelectCow: (id: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  cows,
  barn,
  alerts,
  analytics,
  onSelectCow,
  onNavigateTab,
}) => {
  const activeAlerts = alerts.filter((a) => a.status === "active");
  const criticalCount = activeAlerts.filter((a) => a.severity === "critical").length;
  const warningCount = activeAlerts.filter((a) => a.severity === "warning").length;
  const healthyCowsCount = cows.filter((c) => c.status === "Healthy").length;

  return (
    <div className="space-y-6">
      {/* 1. Overall System Status Banner */}
      {criticalCount > 0 ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-600 text-white">
              <ShieldAlert size={22} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-red-900 text-base">SYSTEM ALERT: ATTENTION REQUIRED</span>
                <Badge variant="destructive" className="bg-red-600 uppercase text-[10px]">
                  {criticalCount} Critical Event{criticalCount > 1 ? "s" : ""}
                </Badge>
              </div>
              <p className="text-xs text-red-700 mt-0.5">
                Elevated livestock vitals or equipment deficits detected. Veterinary and management intervention recommended.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => onNavigateTab("alerts")}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs h-9 shrink-0"
          >
            Review Critical Alerts ({criticalCount})
          </Button>
        </div>
      ) : warningCount > 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white">
              <AlertTriangle size={20} />
            </div>
            <div>
              <span className="font-bold text-amber-900 text-base">SYSTEM STATUS: ELEVATED THRESHOLDS</span>
              <p className="text-xs text-amber-700 mt-0.5">
                {warningCount} non-critical warning event{warningCount > 1 ? "s" : ""} active. Monitor barn heat index or battery telemetry.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onNavigateTab("alerts")}
            className="border-amber-300 text-amber-900 hover:bg-amber-100 text-xs h-9 shrink-0"
          >
            View Active Warnings ({warningCount})
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 text-emerald-900 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <span className="font-bold text-emerald-950 text-base">ALL SYSTEMS NORMAL</span>
              <p className="text-xs text-emerald-700 mt-0.5">
                All herd vitals, ambient barn indices, and trough water levels within target parameters.
              </p>
            </div>
          </div>
          <Badge className="bg-emerald-600 text-white font-medium text-xs">Operational</Badge>
        </div>
      )}

      {/* 2. Primary KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        {/* Livestock Vitals */}
        <Card className="border-l-4 border-l-emerald-500 hover:shadow-md transition-shadow">
          <CardContent className="p-3.5 space-y-1.5">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>HERD VITALS</span>
              <Activity size={15} className="text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-slate-900">{analytics.avgCowTemp}°C</span>
              <span className="text-[10px] text-slate-400">avg</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
              <span className="font-semibold text-emerald-600">{healthyCowsCount}</span> Healthy
              <span className="text-slate-300">|</span>
              <span className="font-semibold text-red-600">{cows.length - healthyCowsCount}</span> Attention
            </div>
          </CardContent>
        </Card>

        {/* Barn Ambient Temp */}
        <Card className="border-l-4 border-l-sky-500 hover:shadow-md transition-shadow">
          <CardContent className="p-3.5 space-y-1.5">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>BARN TEMP</span>
              <Thermometer size={15} className="text-sky-600" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-slate-900">{barn.ambientTemperature}°C</span>
            </div>
            <div className="text-[11px] text-slate-500">
              Target: 18°C – 24°C
            </div>
          </CardContent>
        </Card>

        {/* Relative Humidity */}
        <Card className="border-l-4 border-l-cyan-500 hover:shadow-md transition-shadow">
          <CardContent className="p-3.5 space-y-1.5">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>HUMIDITY</span>
              <Droplets size={15} className="text-cyan-600" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-slate-900">{barn.humidity}%</span>
            </div>
            <div className="text-[11px] text-slate-500">
              Ventilation: <span className="font-medium text-emerald-600">Active</span>
            </div>
          </CardContent>
        </Card>

        {/* THI Heat Stress */}
        <Card className={`border-l-4 ${barn.thi >= 78 ? "border-l-red-500" : barn.thi >= 72 ? "border-l-amber-500" : "border-l-emerald-500"} hover:shadow-md transition-shadow`}>
          <CardContent className="p-3.5 space-y-1.5">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>HEAT INDEX</span>
              <Activity size={15} className={barn.thi >= 72 ? "text-amber-600" : "text-emerald-600"} />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-2xl font-bold ${barn.thi >= 78 ? "text-red-600" : barn.thi >= 72 ? "text-amber-600" : "text-slate-900"}`}>
                {barn.thi}
              </span>
              <span className="text-[10px] font-semibold uppercase text-slate-400">THI</span>
            </div>
            <div className="text-[11px] font-medium text-slate-600">
              {barn.thi >= 78 ? "Severe Heat Stress" : barn.thi >= 72 ? "Mild Heat Stress" : "Comfort Zone"}
            </div>
          </CardContent>
        </Card>

        {/* Water Availability */}
        <Card className={`border-l-4 ${barn.waterTroughLevel <= 25 ? "border-l-red-500" : barn.waterTroughLevel <= 40 ? "border-l-amber-500" : "border-l-blue-500"} hover:shadow-md transition-shadow`}>
          <CardContent className="p-3.5 space-y-1.5">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>WATER TROUGH</span>
              <Droplets size={15} className="text-blue-600" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-bold ${barn.waterTroughLevel <= 25 ? "text-red-600" : "text-slate-900"}`}>
                {barn.waterTroughLevel}%
              </span>
            </div>
            <Progress value={barn.waterTroughLevel} className="h-1.5 bg-slate-100" />
          </CardContent>
        </Card>

        {/* Feed Silo Level */}
        <Card className={`border-l-4 ${barn.feedSiloCapacity <= 20 ? "border-l-red-500" : "border-l-emerald-500"} hover:shadow-md transition-shadow`}>
          <CardContent className="p-3.5 space-y-1.5">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>FEED SILO</span>
              <Wheat size={15} className="text-amber-600" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-slate-900">{barn.feedSiloCapacity}%</span>
            </div>
            <Progress value={barn.feedSiloCapacity} className="h-1.5 bg-slate-100" />
          </CardContent>
        </Card>
      </div>

      {/* 3. Actionable Insights from Engine */}
      {analytics.recommendations.length > 0 && (
        <Card className="border-emerald-100 shadow-xs">
          <CardHeader className="py-3 px-4 border-b bg-slate-50/70">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <TrendingUp size={16} className="text-emerald-600" />
                  Actionable Operational Insights
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Traceable rules triggered by real-time sensor measurements
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-[10px] text-slate-500 font-normal">
                Deterministic Rule Engine
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-2.5">
            {analytics.recommendations.map((rec) => (
              <div
                key={rec.id}
                className={`p-3 rounded-lg border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 ${
                  rec.priority === "high"
                    ? "border-red-200 bg-red-50/60 text-red-950"
                    : "border-amber-200 bg-amber-50/60 text-amber-950"
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs uppercase tracking-wide">{rec.title}</span>
                    <Badge
                      className={`text-[9px] px-1.5 py-0 ${
                        rec.priority === "high" ? "bg-red-600 text-white" : "bg-amber-500 text-white"
                      }`}
                    >
                      {rec.priority.toUpperCase()} PRIORITY
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-700">{rec.description}</p>
                </div>
                <div className="text-[11px] font-mono text-slate-500 shrink-0 bg-white/70 px-2 py-1 rounded border border-slate-200">
                  Trigger: {rec.metricTrigger}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 4. Cattle Herd Spotlight Preview */}
      <Card className="shadow-xs">
        <CardHeader className="py-3 px-4 border-b flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-slate-900">Livestock Monitored Fleet</CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Active smart collar telemetry status
            </CardDescription>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onNavigateTab("livestock")}
            className="text-xs text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 gap-1 font-semibold"
          >
            View All ({cows.length}) <ChevronRight size={14} />
          </Button>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {cows.map((cow) => (
              <div
                key={cow.id}
                onClick={() => onSelectCow(cow.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer hover:border-emerald-400 hover:shadow-xs space-y-2.5 ${
                  cow.status === "Critical"
                    ? "border-red-200 bg-red-50/30"
                    : cow.status === "Warning"
                    ? "border-amber-200 bg-amber-50/30"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{cow.name}</span>
                    <span className="text-[11px] text-slate-500 font-mono">{cow.id}</span>
                  </div>
                  <Badge
                    className={`text-[10px] font-semibold ${
                      cow.status === "Healthy"
                        ? "bg-emerald-500 text-white"
                        : cow.status === "Critical"
                        ? "bg-red-600 text-white animate-pulse"
                        : "bg-amber-500 text-white"
                    }`}
                  >
                    {cow.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block">TEMP</span>
                    <span
                      className={`font-bold ${
                        cow.temperature >= 39.8 ? "text-red-600" : cow.temperature >= 39.3 ? "text-amber-600" : "text-emerald-600"
                      }`}
                    >
                      {cow.temperature}°C
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block">COLLAR BATT</span>
                    <span
                      className={`font-semibold flex items-center gap-1 ${
                        cow.battery <= 15 ? "text-red-600" : "text-slate-700"
                      }`}
                    >
                      <Battery size={13} /> {cow.battery}%
                    </span>
                  </div>
                </div>

                {cow.inLabor && (
                  <Badge variant="destructive" className="w-full justify-center bg-red-600 animate-pulse text-[10px] font-bold">
                    ACTIVE LABOR DETECTED
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
