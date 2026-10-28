"use client";

import React, { useState } from "react";
import { Settings, Save, RotateCcw, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThresholdConfig } from "@/lib/types";
import { DEFAULT_THRESHOLDS, VETERINARY_DISCLAIMER } from "@/lib/config/thresholds";

interface ThresholdSettingsTabProps {
  thresholds: ThresholdConfig;
  onSaveThresholds: (updated: ThresholdConfig) => void;
  onResetDefaults: () => void;
}

export const ThresholdSettingsTab: React.FC<ThresholdSettingsTabProps> = ({
  thresholds,
  onSaveThresholds,
  onResetDefaults,
}) => {
  const [formData, setFormData] = useState<ThresholdConfig>({ ...thresholds });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleChange = (key: keyof ThresholdConfig, value: string) => {
    const num = parseFloat(value);
    setFormData((prev) => ({
      ...prev,
      [key]: isNaN(num) ? prev[key] : num,
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveThresholds(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleReset = () => {
    setFormData({ ...DEFAULT_THRESHOLDS });
    onResetDefaults();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Settings size={18} className="text-emerald-700" />
            Configurable Alert Rules & Sensor Thresholds
          </h2>
          <p className="text-xs text-slate-500">
            Tune anomaly detection sensitivities according to livestock breed, parity, and regional barn climate
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleReset}
            className="h-8 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            <RotateCcw size={13} className="mr-1" /> Reset Defaults
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            className="h-8 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white"
          >
            <Save size={13} className="mr-1" /> Save Configuration
          </Button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs font-semibold text-emerald-800 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600" />
          Threshold parameters updated successfully and applied to active monitoring engine!
        </div>
      )}

      {/* Veterinary Guidance */}
      <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/70 text-xs text-amber-950 space-y-1">
        <span className="font-bold flex items-center gap-1.5 uppercase tracking-wide">
          <Info size={15} className="text-amber-700" />
          Veterinary Notice on Custom Baselines
        </span>
        <p className="text-amber-900 leading-relaxed">{VETERINARY_DISCLAIMER}</p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Livestock Temperature Section */}
        <Card className="shadow-xs">
          <CardHeader className="py-3 px-4 border-b">
            <CardTitle className="text-sm font-bold text-slate-900">
              1. Livestock Core Temperature Limits (°C)
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Triggers warning and high-fever emergency alerts for individual cow collars
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Hypothermia Critical Floor</Label>
              <Input
                type="number"
                step="0.1"
                value={formData.cowTempCriticalLow}
                onChange={(e) => handleChange("cowTempCriticalLow", e.target.value)}
                className="h-9 text-xs"
              />
              <span className="text-[10px] text-slate-400">Default: 37.5°C</span>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Normal Range Lower Bound</Label>
              <Input
                type="number"
                step="0.1"
                value={formData.cowTempWarningLow}
                onChange={(e) => handleChange("cowTempWarningLow", e.target.value)}
                className="h-9 text-xs"
              />
              <span className="text-[10px] text-slate-400">Default: 38.0°C</span>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Elevated Temp Warning</Label>
              <Input
                type="number"
                step="0.1"
                value={formData.cowTempWarningHigh}
                onChange={(e) => handleChange("cowTempWarningHigh", e.target.value)}
                className="h-9 text-xs"
              />
              <span className="text-[10px] text-slate-400">Default: 39.3°C</span>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">High Fever Critical Ceiling</Label>
              <Input
                type="number"
                step="0.1"
                value={formData.cowTempCriticalHigh}
                onChange={(e) => handleChange("cowTempCriticalHigh", e.target.value)}
                className="h-9 text-xs border-red-200 focus:border-red-500 text-red-600 font-bold"
              />
              <span className="text-[10px] text-slate-400">Default: 39.8°C</span>
            </div>
          </CardContent>
        </Card>

        {/* Barn Environment Section */}
        <Card className="shadow-xs">
          <CardHeader className="py-3 px-4 border-b">
            <CardTitle className="text-sm font-bold text-slate-900">
              2. Barn Thermal & Heat Stress Index (THI)
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Ambient temperature and humidity index comfort triggers for misting and fans
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Barn Temp Warning (°C)</Label>
              <Input
                type="number"
                step="0.5"
                value={formData.barnTempWarning}
                onChange={(e) => handleChange("barnTempWarning", e.target.value)}
                className="h-9 text-xs"
              />
              <span className="text-[10px] text-slate-400">Default: 26.0°C</span>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Barn Temp Critical (°C)</Label>
              <Input
                type="number"
                step="0.5"
                value={formData.barnTempCritical}
                onChange={(e) => handleChange("barnTempCritical", e.target.value)}
                className="h-9 text-xs"
              />
              <span className="text-[10px] text-slate-400">Default: 30.0°C</span>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">THI Heat Stress Warning</Label>
              <Input
                type="number"
                step="0.5"
                value={formData.barnThiWarning}
                onChange={(e) => handleChange("barnThiWarning", e.target.value)}
                className="h-9 text-xs"
              />
              <span className="text-[10px] text-slate-400">Default: 72.0</span>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">THI Severe Stress Critical</Label>
              <Input
                type="number"
                step="0.5"
                value={formData.barnThiCritical}
                onChange={(e) => handleChange("barnThiCritical", e.target.value)}
                className="h-9 text-xs text-red-600 font-bold"
              />
              <span className="text-[10px] text-slate-400">Default: 78.0</span>
            </div>
          </CardContent>
        </Card>

        {/* Resources & Hardware Freshness */}
        <Card className="shadow-xs">
          <CardHeader className="py-3 px-4 border-b">
            <CardTitle className="text-sm font-bold text-slate-900">
              3. Water, Feed & Telemetry Freshness Thresholds
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Low-reserve warnings and stale telemetry disconnection detection
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Water Level Warning (%)</Label>
              <Input
                type="number"
                value={formData.waterLevelWarning}
                onChange={(e) => handleChange("waterLevelWarning", e.target.value)}
                className="h-9 text-xs"
              />
              <span className="text-[10px] text-slate-400">Default: 35%</span>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Water Level Critical (%)</Label>
              <Input
                type="number"
                value={formData.waterLevelCritical}
                onChange={(e) => handleChange("waterLevelCritical", e.target.value)}
                className="h-9 text-xs text-red-600 font-bold"
              />
              <span className="text-[10px] text-slate-400">Default: 20%</span>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Collar Low Battery Warning (%)</Label>
              <Input
                type="number"
                value={formData.batteryWarning}
                onChange={(e) => handleChange("batteryWarning", e.target.value)}
                className="h-9 text-xs"
              />
              <span className="text-[10px] text-slate-400">Default: 20%</span>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Stale Telemetry Timeout (Sec)</Label>
              <Input
                type="number"
                value={formData.staleSensorSeconds}
                onChange={(e) => handleChange("staleSensorSeconds", e.target.value)}
                className="h-9 text-xs"
              />
              <span className="text-[10px] text-slate-400">Default: 600s (10 min)</span>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};
