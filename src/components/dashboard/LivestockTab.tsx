"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Battery,
  Thermometer,
  Clock,
  Activity,
  Heart,
  Filter,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Cow } from "@/lib/types";

interface LivestockTabProps {
  cows: Cow[];
  onSelectCow: (id: string) => void;
}

export const LivestockTab: React.FC<LivestockTabProps> = ({ cows, onSelectCow }) => {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "HEALTHY" | "ATTENTION" | "LABOR" | "BATTERY">("ALL");

  const filteredCows = useMemo(() => {
    return cows.filter((c) => {
      // 1. Text Search
      const matchSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.id.toLowerCase().includes(search.toLowerCase());
      if (!matchSearch) return false;

      // 2. Filter Category
      if (filterType === "HEALTHY") return c.status === "Healthy";
      if (filterType === "ATTENTION") return c.status !== "Healthy";
      if (filterType === "LABOR") return c.inLabor;
      if (filterType === "BATTERY") return c.battery <= 20;

      return true;
    });
  }, [cows, search, filterType]);

  const healthyCount = cows.filter((c) => c.status === "Healthy").length;
  const attentionCount = cows.filter((c) => c.status !== "Healthy").length;
  const laborCount = cows.filter((c) => c.inLabor).length;
  const batteryCount = cows.filter((c) => c.battery <= 20).length;

  return (
    <div className="space-y-4">
      {/* Search and Filters toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input
            className="h-10 pl-9 bg-white border-slate-200 text-sm focus:ring-emerald-500"
            placeholder="Search cow by name or RFID tag (e.g., Daisy, COW-101)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <Button
            size="sm"
            variant={filterType === "ALL" ? "default" : "outline"}
            onClick={() => setFilterType("ALL")}
            className={`h-8 text-xs font-medium ${
              filterType === "ALL" ? "bg-emerald-700 text-white hover:bg-emerald-800" : "bg-white text-slate-600"
            }`}
          >
            All ({cows.length})
          </Button>

          <Button
            size="sm"
            variant={filterType === "HEALTHY" ? "default" : "outline"}
            onClick={() => setFilterType("HEALTHY")}
            className={`h-8 text-xs font-medium ${
              filterType === "HEALTHY" ? "bg-emerald-600 text-white" : "bg-white text-slate-600"
            }`}
          >
            Healthy ({healthyCount})
          </Button>

          <Button
            size="sm"
            variant={filterType === "ATTENTION" ? "default" : "outline"}
            onClick={() => setFilterType("ATTENTION")}
            className={`h-8 text-xs font-medium ${
              filterType === "ATTENTION" ? "bg-red-600 text-white" : "bg-white text-slate-600"
            }`}
          >
            Attention ({attentionCount})
          </Button>

          {laborCount > 0 && (
            <Button
              size="sm"
              variant={filterType === "LABOR" ? "default" : "outline"}
              onClick={() => setFilterType("LABOR")}
              className={`h-8 text-xs font-medium ${
                filterType === "LABOR" ? "bg-purple-600 text-white" : "border-purple-200 text-purple-700 bg-purple-50"
              }`}
            >
              In Labor ({laborCount})
            </Button>
          )}

          {batteryCount > 0 && (
            <Button
              size="sm"
              variant={filterType === "BATTERY" ? "default" : "outline"}
              onClick={() => setFilterType("BATTERY")}
              className={`h-8 text-xs font-medium ${
                filterType === "BATTERY" ? "bg-amber-600 text-white" : "border-amber-200 text-amber-700 bg-amber-50"
              }`}
            >
              Low Batt ({batteryCount})
            </Button>
          )}
        </div>
      </div>

      {/* Roster Cards List */}
      <div className="space-y-3">
        {filteredCows.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-xl border border-slate-200 space-y-2">
            <Filter size={28} className="mx-auto text-slate-300" />
            <h3 className="text-sm font-semibold text-slate-700">No cattle matched your filter</h3>
            <p className="text-xs text-slate-400">Try adjusting your search query or reset filter category.</p>
            <Button size="sm" variant="outline" onClick={() => { setSearch(""); setFilterType("ALL"); }}>
              Reset Filters
            </Button>
          </div>
        ) : (
          filteredCows.map((cow) => (
            <Card
              key={cow.id}
              onClick={() => onSelectCow(cow.id)}
              className="overflow-hidden cursor-pointer hover:border-emerald-300 hover:shadow-xs transition-all border border-slate-200/80 bg-white"
            >
              <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Left identity & status */}
                <div className="flex items-center gap-3.5">
                  <div
                    className={`p-2.5 rounded-full shrink-0 ${
                      cow.status === "Healthy"
                        ? "bg-emerald-100 text-emerald-700"
                        : cow.status === "Critical"
                        ? "bg-red-100 text-red-700 animate-pulse"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {cow.status === "Healthy" ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-slate-900">{cow.name}</h3>
                      <span className="text-xs text-slate-500 font-mono">({cow.id})</span>
                      {cow.isPregnant && (
                        <Badge variant="outline" className="border-pink-300 text-pink-700 text-[10px] py-0 px-1.5">
                          Pregnant
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <Badge
                        className={`text-[10px] font-semibold py-0.5 ${
                          cow.status === "Healthy"
                            ? "bg-emerald-500 text-white"
                            : cow.status === "Critical"
                            ? "bg-red-600 text-white"
                            : "bg-amber-500 text-white"
                        }`}
                      >
                        {cow.status.toUpperCase()}
                      </Badge>

                      {cow.inLabor && (
                        <Badge variant="destructive" className="bg-red-600 animate-pulse text-[10px]">
                          ACTIVE DELIVERY
                        </Badge>
                      )}

                      {cow.battery < 20 && (
                        <Badge variant="outline" className="border-red-500 text-red-600 text-[10px] flex items-center gap-1">
                          <Battery size={11} /> LOW BATTERY ({cow.battery}%)
                        </Badge>
                      )}

                      <span className="text-xs text-slate-500 hidden sm:inline">
                        Immunity: <strong className="text-slate-800">{cow.immunityScore}%</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right vitals telemetry snapshot */}
                <div className="flex items-center justify-between md:justify-end gap-4 md:gap-8 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">BODY TEMP</span>
                    <span
                      className={`text-base font-extrabold ${
                        cow.temperature >= 39.8
                          ? "text-red-600"
                          : cow.temperature >= 39.3
                          ? "text-amber-600"
                          : "text-emerald-700"
                      }`}
                    >
                      {cow.temperature}°C
                    </span>
                  </div>

                  <div className="text-left md:text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">RUMINATION</span>
                    <span className="text-base font-extrabold text-slate-800">
                      {cow.ruminationMinutes} <span className="text-[10px] text-slate-400 font-normal">m/d</span>
                    </span>
                  </div>

                  <div className="text-left md:text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ACTIVITY</span>
                    <span className="text-base font-extrabold text-slate-800">{cow.movement}</span>
                  </div>

                  <ChevronRight size={18} className="text-slate-300 shrink-0 hidden sm:block" />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
