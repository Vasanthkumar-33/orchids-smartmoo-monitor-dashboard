"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Filter,
  Check,
  CheckCheck,
  Info,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SmartMooAlert } from "@/lib/types";
import { VETERINARY_DISCLAIMER } from "@/lib/config/thresholds";

interface AlertsCenterTabProps {
  alerts: SmartMooAlert[];
  onAcknowledgeAlert: (id: string) => void;
  onResolveAlert: (id: string) => void;
}

export const AlertsCenterTab: React.FC<AlertsCenterTabProps> = ({
  alerts,
  onAcknowledgeAlert,
  onResolveAlert,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<"ALL" | "CRITICAL" | "WARNING" | "ACKNOWLEDGED" | "RESOLVED">("ALL");

  const filteredAlerts = alerts.filter((a) => {
    if (filterSeverity === "CRITICAL") return a.severity === "critical" && a.status === "active";
    if (filterSeverity === "WARNING") return a.severity === "warning" && a.status === "active";
    if (filterSeverity === "ACKNOWLEDGED") return a.status === "acknowledged";
    if (filterSeverity === "RESOLVED") return a.status === "resolved";
    return true;
  });

  const criticalActiveCount = alerts.filter((a) => a.severity === "critical" && a.status === "active").length;
  const warningActiveCount = alerts.filter((a) => a.severity === "warning" && a.status === "active").length;
  const acknowledgedCount = alerts.filter((a) => a.status === "acknowledged").length;

  return (
    <div className="space-y-6">
      {/* Veterinary Advisory Box */}
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 text-emerald-950 flex items-start gap-3 shadow-xs">
        <Info size={20} className="text-emerald-700 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <span className="font-bold uppercase tracking-wider text-emerald-900 block">
            Clinical Safety & Veterinary Advisory
          </span>
          <p className="text-emerald-800 leading-relaxed">{VETERINARY_DISCLAIMER}</p>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert size={18} className="text-red-600" />
            Alert Management & Incident Log
          </h2>
          <p className="text-xs text-slate-500">
            Deduplicated rule-triggered alerts across livestock wearable sensors and barn environmental nodes
          </p>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <Button
            size="sm"
            variant={filterSeverity === "ALL" ? "default" : "outline"}
            onClick={() => setFilterSeverity("ALL")}
            className={`h-7 px-2.5 text-xs font-semibold ${
              filterSeverity === "ALL" ? "bg-slate-900 text-white" : "text-slate-600 bg-white"
            }`}
          >
            All ({alerts.length})
          </Button>

          <Button
            size="sm"
            variant={filterSeverity === "CRITICAL" ? "default" : "outline"}
            onClick={() => setFilterSeverity("CRITICAL")}
            className={`h-7 px-2.5 text-xs font-semibold ${
              filterSeverity === "CRITICAL" ? "bg-red-600 text-white" : "border-red-200 text-red-700 bg-red-50/50"
            }`}
          >
            Critical ({criticalActiveCount})
          </Button>

          <Button
            size="sm"
            variant={filterSeverity === "WARNING" ? "default" : "outline"}
            onClick={() => setFilterSeverity("WARNING")}
            className={`h-7 px-2.5 text-xs font-semibold ${
              filterSeverity === "WARNING" ? "bg-amber-600 text-white" : "border-amber-200 text-amber-700 bg-amber-50/50"
            }`}
          >
            Warning ({warningActiveCount})
          </Button>

          <Button
            size="sm"
            variant={filterSeverity === "ACKNOWLEDGED" ? "default" : "outline"}
            onClick={() => setFilterSeverity("ACKNOWLEDGED")}
            className={`h-7 px-2.5 text-xs font-semibold ${
              filterSeverity === "ACKNOWLEDGED" ? "bg-blue-600 text-white" : "border-blue-200 text-blue-700 bg-blue-50/50"
            }`}
          >
            Acked ({acknowledgedCount})
          </Button>

          <Button
            size="sm"
            variant={filterSeverity === "RESOLVED" ? "default" : "outline"}
            onClick={() => setFilterSeverity("RESOLVED")}
            className={`h-7 px-2.5 text-xs font-semibold ${
              filterSeverity === "RESOLVED" ? "bg-emerald-600 text-white" : "border-emerald-200 text-emerald-700 bg-emerald-50/50"
            }`}
          >
            Resolved
          </Button>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-xl border border-slate-200 space-y-2">
            <CheckCircle2 size={32} className="mx-auto text-emerald-500" />
            <h3 className="text-sm font-semibold text-slate-700">No alerts found</h3>
            <p className="text-xs text-slate-400">There are no alerts matching your current filter criteria.</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <Card
              key={alert.id}
              className={`border transition-all shadow-xs overflow-hidden ${
                alert.status === "resolved"
                  ? "border-slate-200 bg-slate-50/40 opacity-75"
                  : alert.severity === "critical"
                  ? "border-red-300 bg-red-50/20"
                  : "border-amber-300 bg-amber-50/20"
              }`}
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      className={`text-[10px] font-bold uppercase tracking-wider py-0.5 px-2 ${
                        alert.status === "resolved"
                          ? "bg-slate-500 text-white"
                          : alert.severity === "critical"
                          ? "bg-red-600 text-white animate-pulse"
                          : alert.severity === "warning"
                          ? "bg-amber-500 text-white"
                          : "bg-blue-600 text-white"
                      }`}
                    >
                      {alert.status === "resolved" ? "RESOLVED" : alert.severity.toUpperCase()}
                    </Badge>

                    {alert.status === "acknowledged" && (
                      <Badge variant="outline" className="border-blue-400 text-blue-700 text-[10px] font-semibold">
                        ACKNOWLEDGED
                      </Badge>
                    )}

                    <span className="font-bold text-sm text-slate-900">{alert.targetName}</span>
                    <span className="text-xs text-slate-400 font-mono">[{alert.targetId}]</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Clock size={13} />
                    <span>{new Date(alert.timestamp).toLocaleTimeString()} ({new Date(alert.timestamp).toLocaleDateString()})</span>
                  </div>
                </div>

                {/* Metric trigger readout */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-white p-3 rounded-lg border border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">MONITORED METRIC</span>
                    <span className="font-semibold text-slate-800">{alert.metric}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">OBSERVED VALUE</span>
                    <span className={`font-bold ${alert.severity === "critical" ? "text-red-600" : "text-amber-600"}`}>
                      {alert.observedValue} {alert.unit}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">TRIGGER THRESHOLD</span>
                    <span className="font-mono text-slate-600">{alert.thresholdValue}</span>
                  </div>
                </div>

                {/* Recommended action */}
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">
                    RECOMMENDED PROTOCOL:
                  </span>
                  <p className="text-slate-800 font-medium leading-relaxed">{alert.recommendedAction}</p>
                </div>

                {/* Action buttons */}
                {alert.status !== "resolved" && (
                  <div className="flex items-center justify-end gap-2 pt-1">
                    {alert.status === "active" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onAcknowledgeAlert(alert.id)}
                        className="h-8 text-xs font-semibold border-slate-300 text-slate-700 hover:bg-slate-100"
                      >
                        <Check size={14} className="mr-1 text-slate-500" /> Acknowledge Alert
                      </Button>
                    )}

                    <Button
                      size="sm"
                      onClick={() => onResolveAlert(alert.id)}
                      className="h-8 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white"
                    >
                      <CheckCheck size={14} className="mr-1" /> Mark Resolved
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
