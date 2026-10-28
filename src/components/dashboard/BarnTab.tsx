"use client";

import React, { useState } from "react";
import {
  Thermometer,
  Droplets,
  Wind,
  Wheat,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  RefreshCw,
  Power,
  ShieldAlert,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BarnEnvironment } from "@/lib/types";

interface BarnTabProps {
  barn: BarnEnvironment;
  onUpdateBarn: (updated: Partial<BarnEnvironment>) => void;
}

export const BarnTab: React.FC<BarnTabProps> = ({ barn, onUpdateBarn }) => {
  const [isRefillingWater, setIsRefillingWater] = useState(false);

  const handleSimulateWaterRefill = () => {
    setIsRefillingWater(true);
    setTimeout(() => {
      onUpdateBarn({
        waterTroughLevel: 92.0,
        waterFlowRate: 22.4,
      });
      setIsRefillingWater(false);
    }, 800);
  };

  const handleToggleVentilation = () => {
    onUpdateBarn({
      ventilationActive: !barn.ventilationActive,
      ambientTemperature: barn.ventilationActive
        ? Math.round((barn.ambientTemperature + 0.8) * 10) / 10
        : Math.round((barn.ambientTemperature - 0.8) * 10) / 10,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Barn selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{barn.name}</h2>
          <p className="text-xs text-slate-500">
            Station ID: <span className="font-mono text-slate-700">{barn.id}</span> | LoRaWAN Node Gateway Active
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleToggleVentilation}
            className={`h-8 text-xs font-medium gap-1.5 ${
              barn.ventilationActive
                ? "border-emerald-300 text-emerald-800 bg-emerald-50 hover:bg-emerald-100"
                : "border-slate-300 text-slate-600 bg-white"
            }`}
          >
            <Power size={13} />
            Ventilation Fans: {barn.ventilationActive ? "ON" : "OFF"}
          </Button>
        </div>
      </div>

      {/* Environmental Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Ambient Temperature */}
        <Card className="shadow-xs">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Ambient Temperature</span>
              <Thermometer size={18} className="text-sky-600" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-slate-900">{barn.ambientTemperature}°C</span>
              <span className="text-xs text-slate-400">Target: 18°C – 24°C</span>
            </div>
            <p className="text-xs text-slate-600">
              Barn interior temperature measured via calibrated SHT40 environmental sensor.
            </p>
          </CardContent>
        </Card>

        {/* Relative Humidity */}
        <Card className="shadow-xs">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Relative Humidity</span>
              <Droplets size={18} className="text-cyan-600" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-slate-900">{barn.humidity}%</span>
              <span className="text-xs text-slate-400">Target: 50% – 70%</span>
            </div>
            <p className="text-xs text-slate-600">
              High humidity compounds thermal burden. Current ventilation status:{" "}
              <span className="font-semibold text-emerald-600">{barn.ventilationActive ? "Active" : "Idle"}</span>.
            </p>
          </CardContent>
        </Card>

        {/* THI Heat Stress Index */}
        <Card className="shadow-xs border-l-4 border-l-amber-500">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Heat Stress (THI)</span>
              <Activity size={18} className="text-amber-600" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-amber-600">{barn.thi}</span>
              <span className="text-xs font-bold uppercase text-slate-500">THI Index</span>
            </div>
            {/* Visual THI scale bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                <span>Comfort (&lt;72)</span>
                <span>Mild (72-78)</span>
                <span>Severe (&gt;78)</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 flex overflow-hidden">
                <div className="w-[50%] bg-emerald-500" />
                <div className="w-[30%] bg-amber-500" />
                <div className="w-[20%] bg-red-500" />
              </div>
            </div>
            <p className="text-xs text-slate-600">
              {barn.thi >= 78
                ? "Severe heat stress detected! Milk yield decline expected. Run misting nozzles immediately."
                : barn.thi >= 72
                ? "Mild heat stress threshold reached. Ensure fans maintain continuous air turnover."
                : "Livestock environmental conditions within optimum dairy comfort zone."}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Water & Feed Systems Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Automated Water Trough Status */}
        <Card className="shadow-xs">
          <CardHeader className="py-3 px-4 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Droplets size={16} className="text-blue-600" />
                Water Availability & Trough Status
              </CardTitle>
              <Badge
                className={
                  barn.waterTroughLevel <= 25
                    ? "bg-red-600 text-white"
                    : barn.waterTroughLevel <= 40
                    ? "bg-amber-500 text-white"
                    : "bg-emerald-500 text-white"
                }
              >
                {barn.waterTroughLevel <= 25 ? "CRITICAL DEFICIT" : barn.waterTroughLevel <= 40 ? "LOW LEVEL" : "OPTIMAL"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-3xl font-extrabold text-slate-900">{barn.waterTroughLevel}%</span>
                <span className="text-xs text-slate-400 block">Trough Reservoir Volume</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-slate-700">{barn.waterFlowRate} L/min</span>
                <span className="text-xs text-slate-400 block">Current Inflow Rate</span>
              </div>
            </div>

            <Progress
              value={barn.waterTroughLevel}
              className={`h-3 ${
                barn.waterTroughLevel <= 25 ? "bg-red-100 text-red-600" : "bg-blue-100"
              }`}
            />

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1">
              <div className="flex justify-between">
                <span>Auto-Refill Trigger:</span>
                <span className="font-semibold text-slate-800">&lt; 35% Capacity</span>
              </div>
              <div className="flex justify-between">
                <span>Inlet Pressure:</span>
                <span className="font-semibold text-slate-800">3.2 Bar (Nominal)</span>
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              disabled={isRefillingWater}
              onClick={handleSimulateWaterRefill}
              className="w-full text-xs font-semibold text-blue-700 border-blue-200 hover:bg-blue-50"
            >
              {isRefillingWater ? "Triggering Solenoid Valve..." : "Simulate Automated Refill Cycle"}
            </Button>
          </CardContent>
        </Card>

        {/* Feed Silo & Bunk Capacity */}
        <Card className="shadow-xs">
          <CardHeader className="py-3 px-4 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Wheat size={16} className="text-amber-600" />
                Feed Silo & Bunk Dispenser
              </CardTitle>
              <Badge className="bg-emerald-500 text-white">Status: {barn.feedBunkStatus}</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-3xl font-extrabold text-slate-900">{barn.feedSiloCapacity}%</span>
                <span className="text-xs text-slate-400 block">Silo Inventory (TMR Mix)</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-slate-700">~42 Hours</span>
                <span className="text-xs text-slate-400 block">Estimated Herd Run Time</span>
              </div>
            </div>

            <Progress value={barn.feedSiloCapacity} className="h-3 bg-amber-100" />

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1">
              <div className="flex justify-between">
                <span>Dispenser Augers:</span>
                <span className="font-semibold text-emerald-600">Operational</span>
              </div>
              <div className="flex justify-between">
                <span>Last Bunk Push-Up:</span>
                <span className="font-semibold text-slate-800">45 minutes ago</span>
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => onUpdateBarn({ feedSiloCapacity: 95.0, feedBunkStatus: "Full" })}
              className="w-full text-xs font-semibold text-amber-800 border-amber-200 hover:bg-amber-50"
            >
              Simulate Silo Grain Batch Delivery
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Hardware Diagnostics Section */}
      <Card className="shadow-xs">
        <CardHeader className="py-3 px-4 border-b">
          <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Cpu size={16} className="text-slate-600" />
            Station Environmental Probes & Node Diagnostics
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Real-time telemetry packet status from barn fixed probe arrays
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                name: "Temp & Humidity Sensor Array",
                type: "Sensirion SHT40 Probe",
                status: barn.sensorsStatus.tempHumidity,
                icon: Thermometer,
              },
              {
                name: "Water Level Ultrasonic Transducer",
                type: "MaxBotix IP67 Sonar",
                status: barn.sensorsStatus.waterLevel,
                icon: Droplets,
              },
              {
                name: "Silo Load Cell Strain Gauges",
                type: "HBM 4-Point Weight Matrix",
                status: barn.sensorsStatus.feedSilo,
                icon: Wheat,
              },
            ].map((sensor, idx) => (
              <div key={idx} className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <sensor.icon size={14} className="text-slate-500" />
                    <span className="font-semibold text-xs text-slate-800">{sensor.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono block">{sensor.type}</span>
                </div>
                <Badge
                  className={
                    sensor.status === "ONLINE"
                      ? "bg-emerald-500 text-white text-[10px]"
                      : "bg-red-500 text-white text-[10px]"
                  }
                >
                  {sensor.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
