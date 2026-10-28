"use client";

import React from "react";
import { Activity, Bell, LogOut, Wifi, WifiOff, ShieldCheck, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  onLogout: () => void;
  activeAlertCount: number;
  criticalAlertCount: number;
  onOpenAlerts: () => void;
  isConnected: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onLogout,
  activeAlertCount,
  criticalAlertCount,
  onOpenAlerts,
  isConnected,
}) => {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b bg-white/95 backdrop-blur px-4 md:px-8 py-3.5 shadow-xs">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
          <Activity size={22} className="stroke-[2.5]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg md:text-xl font-bold tracking-tight text-emerald-950">SmartMoo</h1>
            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
              v2.0 (Phase 2)
            </Badge>
          </div>
          <p className="text-[11px] text-slate-500 hidden sm:block">IoT Livestock & Barn Environmental Monitor</p>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Gateway connection pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
          {isConnected ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <Wifi size={13} className="text-emerald-600" />
              <span>LoRa Gateway: Online</span>
            </>
          ) : (
            <>
              <span className="h-2 w-2 rounded-full bg-red-500"></span>
              <WifiOff size={13} className="text-red-500" />
              <span>Gateway: Offline</span>
            </>
          )}
        </div>

        {/* Alerts quick button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenAlerts}
          className={`relative h-9 px-3 gap-1.5 border ${
            criticalAlertCount > 0
              ? "border-red-300 bg-red-50 text-red-700 hover:bg-red-100"
              : activeAlertCount > 0
              ? "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100"
              : "border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          <Bell size={16} className={criticalAlertCount > 0 ? "text-red-600 animate-bounce" : ""} />
          <span className="font-semibold text-xs hidden md:inline">Alerts</span>
          {activeAlertCount > 0 && (
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold text-white ${
                criticalAlertCount > 0 ? "bg-red-600" : "bg-amber-500"
              }`}
            >
              {activeAlertCount}
            </span>
          )}
        </Button>

        {/* Logout */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onLogout}
          className="text-slate-500 hover:text-red-600 hover:bg-red-50 h-9 w-9"
          title="Sign Out"
        >
          <LogOut size={18} />
        </Button>
      </div>
    </header>
  );
};
