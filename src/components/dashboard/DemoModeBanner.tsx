"use client";

import React from "react";
import { Activity, Radio, AlertCircle, RefreshCw, Play, Pause } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface DemoModeBannerProps {
  isDemoMode: boolean;
  onToggleDemoMode: () => void;
  isSimulating: boolean;
  onToggleSimulation: () => void;
  lastUpdated: string;
}

export const DemoModeBanner: React.FC<DemoModeBannerProps> = ({
  isDemoMode,
  onToggleDemoMode,
  isSimulating,
  onToggleSimulation,
  lastUpdated,
}) => {
  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-xs md:text-sm text-amber-900 flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2 flex-wrap">
        <Badge
          variant="outline"
          className="border-amber-600 bg-amber-100/80 text-amber-900 font-bold px-2 py-0.5 tracking-wide flex items-center gap-1.5"
        >
          <Radio size={12} className={isSimulating ? "animate-pulse text-amber-700" : "text-amber-500"} />
          {isDemoMode ? "DEMO MODE ACTIVE" : "HARDWARE TELEMETRY"}
        </Badge>
        <span className="text-slate-600 hidden sm:inline">
          {isDemoMode
            ? "Dynamic synthetic livestock telemetry enabled for testing & prototype evaluation."
            : "Listening for real hardware packets on LoRaWAN port 1700."}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-slate-500 text-xs hidden md:inline">
          Last tick: {new Date(lastUpdated).toLocaleTimeString()}
        </span>

        {isDemoMode && (
          <Button
            size="sm"
            variant="outline"
            onClick={onToggleSimulation}
            className="h-7 text-xs border-amber-300 bg-white hover:bg-amber-50 text-amber-900 flex items-center gap-1.5 font-medium"
          >
            {isSimulating ? (
              <>
                <Pause size={12} className="text-amber-700" /> Pause Ticker
              </>
            ) : (
              <>
                <Play size={12} className="text-emerald-700" /> Resume Ticker
              </>
            )}
          </Button>
        )}

        <Button
          size="sm"
          variant="ghost"
          onClick={onToggleDemoMode}
          className="h-7 text-xs text-slate-600 hover:text-slate-900 hover:bg-amber-100/50"
        >
          {isDemoMode ? "Switch to Live Mode" : "Switch to Demo Mode"}
        </Button>
      </div>
    </div>
  );
};
