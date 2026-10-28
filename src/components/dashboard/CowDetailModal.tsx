"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  AlertTriangle,
  Thermometer,
  Clock,
  Activity,
  Wind,
  ShieldCheck,
  Battery,
  MapPin,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Cow } from "@/lib/types";

interface CowDetailProps {
  cow: Cow;
  onBack: () => void;
  onMarkChecked: (id: string) => void;
  onRechargeBattery?: (id: string) => void;
}

export const CowDetailModal: React.FC<CowDetailProps> = ({
  cow,
  onBack,
  onMarkChecked,
  onRechargeBattery,
}) => {
  const [recharged, setRecharged] = useState(false);

  const handleRecharge = () => {
    if (onRechargeBattery) {
      onRechargeBattery(cow.id);
      setRecharged(true);
      setTimeout(() => setRecharged(false), 2000);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Top Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4 shadow-xs">
        <Button variant="ghost" size="sm" onClick={onBack} className="text-slate-600 gap-1 font-semibold">
          <ArrowLeft size={18} /> Back to Dashboard
        </Button>
        <div className="text-center">
          <h1 className="text-lg md:text-xl font-bold text-emerald-950">{cow.name}</h1>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-mono">{cow.id}</p>
        </div>
        <div className="w-20 text-right">
          <Badge
            className={`text-xs font-semibold ${
              cow.status === "Healthy"
                ? "bg-emerald-500 text-white"
                : cow.status === "Critical"
                ? "bg-red-600 text-white"
                : "bg-amber-500 text-white"
            }`}
          >
            {cow.status}
          </Badge>
        </div>
      </header>

      <ScrollArea className="flex-1">
        <div className="p-4 md:p-6 space-y-6 max-w-3xl mx-auto w-full">
          {/* Labor Alert Banner */}
          {cow.inLabor && (
            <div className="bg-red-600 rounded-xl p-6 text-white text-center space-y-4 shadow-lg animate-in fade-in">
              <div className="flex justify-center">
                <AlertTriangle size={48} className="animate-bounce" />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight">ACTIVE LABOR CONTRACTIONS DETECTED</h2>
                <p className="opacity-95 text-sm mt-1">
                  {cow.name} is showing biometric indicators of active calving delivery. Immediate attendant supervision required.
                </p>
              </div>
              <Button
                onClick={() => onMarkChecked(cow.id)}
                className="w-full sm:w-auto px-8 bg-white text-red-600 font-bold hover:bg-slate-100 shadow-sm"
              >
                <CheckCircle2 size={16} className="mr-1.5" /> MARK AS INSPECTED & CHECKED
              </Button>
            </div>
          )}

          <Tabs defaultValue="health" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-11 bg-slate-200/70 rounded-lg p-1">
              <TabsTrigger
                value="health"
                className="data-[state=active]:bg-white data-[state=active]:text-emerald-800 font-semibold text-xs"
              >
                Health & Vitals
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="data-[state=active]:bg-white data-[state=active]:text-emerald-800 font-semibold text-xs"
              >
                Timeline History
              </TabsTrigger>
              <TabsTrigger
                value="hardware"
                className="data-[state=active]:bg-white data-[state=active]:text-emerald-800 font-semibold text-xs"
              >
                Collar Hardware
              </TabsTrigger>
            </TabsList>

            {/* Health Tab Content */}
            <TabsContent value="health" className="mt-6 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Card className="shadow-xs">
                  <CardContent className="p-4 space-y-1.5">
                    <div className="flex justify-between items-center text-slate-500">
                      <span className="text-[10px] font-bold uppercase tracking-wider">TEMP</span>
                      <Thermometer size={16} className="text-emerald-600" />
                    </div>
                    <div
                      className={`text-2xl font-black ${
                        cow.temperature >= 39.8
                          ? "text-red-600"
                          : cow.temperature >= 39.3
                          ? "text-amber-600"
                          : "text-emerald-600"
                      }`}
                    >
                      {cow.temperature}°C
                    </div>
                    {cow.temperature >= 39.8 ? (
                      <p className="text-[10px] text-red-600 font-bold uppercase tracking-wide">HIGH FEVER ALERT</p>
                    ) : (
                      <p className="text-[10px] text-slate-400">Baseline: 38.6°C</p>
                    )}
                  </CardContent>
                </Card>

                <Card className="shadow-xs">
                  <CardContent className="p-4 space-y-1.5">
                    <div className="flex justify-between items-center text-slate-500">
                      <span className="text-[10px] font-bold uppercase tracking-wider">RUMINATION</span>
                      <Clock size={16} className="text-slate-600" />
                    </div>
                    <div className="text-2xl font-black text-slate-900">{cow.ruminationMinutes ?? 450} <span className="text-xs font-normal text-slate-400">min</span></div>
                    <p className="text-[10px] text-slate-400">Target: &gt;450 m/d</p>
                  </CardContent>
                </Card>

                <Card className="shadow-xs">
                  <CardContent className="p-4 space-y-1.5">
                    <div className="flex justify-between items-center text-slate-500">
                      <span className="text-[10px] font-bold uppercase tracking-wider">ACTIVITY</span>
                      <Activity size={16} className="text-slate-600" />
                    </div>
                    <div className="text-2xl font-black text-slate-900">{cow.movement}</div>
                    <p className="text-[10px] text-slate-400">3-Axis Collar Gyro</p>
                  </CardContent>
                </Card>

                <Card className="shadow-xs">
                  <CardContent className="p-4 space-y-1.5">
                    <div className="flex justify-between items-center text-slate-500">
                      <span className="text-[10px] font-bold uppercase tracking-wider">FEEDING</span>
                      <Wind size={16} className="text-slate-600" />
                    </div>
                    <div className="text-xl font-black text-slate-900">{cow.feedingStatus}</div>
                    <p className="text-[10px] text-slate-400">Bunk visits: Normal</p>
                  </CardContent>
                </Card>
              </div>

              {/* Immunity Score Card */}
              <Card className="shadow-xs">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <ShieldCheck size={18} className="text-emerald-600" />
                    COMPOSITE IMMUNITY & WELLNESS SCORE
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-4xl font-black text-emerald-600">{cow.immunityScore}%</span>
                    <span className="text-xs font-medium text-slate-400">Target benchmark: 85%+</span>
                  </div>
                  <Progress value={cow.immunityScore} className="h-3 bg-emerald-100" />
                  <p className="text-xs text-slate-500 italic">
                    Calculated from 24h rumination periodicity, resting cycles, core body temp variance, and collar accelerometer telemetry.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* History Tab Content */}
            <TabsContent value="history" className="mt-6">
              <Card className="shadow-xs">
                <CardHeader className="py-3 px-4 border-b">
                  <CardTitle className="text-sm font-bold text-slate-900">Livestock Event & Veterinary Log</CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Chronological events recorded for {cow.name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {(cow.history || []).map((item, i) => (
                      <div key={i} className="flex gap-4 relative">
                        {i !== (cow.history || []).length - 1 && (
                          <div className="absolute left-[11px] top-7 bottom-[-20px] w-0.5 bg-slate-200" />
                        )}
                        <div className="h-6 w-6 rounded-full bg-emerald-500 flex-shrink-0 z-10 border-4 border-white shadow-xs" />
                        <div className="space-y-0.5">
                          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">{item.time}</p>
                          <p className="text-sm font-semibold text-slate-800">{item.event}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Hardware Diagnostics Tab Content */}
            <TabsContent value="hardware" className="mt-6 space-y-4">
              <Card className="shadow-xs">
                <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
                  <div className="relative h-24 w-24 shrink-0 flex items-center justify-center">
                    <svg className="h-full w-full rotate-[-90deg]">
                      <circle cx="48" cy="48" r="40" fill="transparent" stroke="#f1f5f9" strokeWidth="8" />
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        fill="transparent"
                        stroke={cow.battery < 20 ? "#ef4444" : "#10b981"}
                        strokeWidth="8"
                        strokeDasharray={251.2}
                        strokeDashoffset={251.2 - (251.2 * cow.battery) / 100}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <Battery className={cow.battery < 20 ? "text-red-500" : "text-emerald-500"} size={20} />
                      <span className="text-lg font-bold">{cow.battery}%</span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-1.5 text-center sm:text-left">
                    <h3 className="font-bold text-slate-900">Smart Collar V3.2 Lithium Battery</h3>
                    <p className="text-xs text-slate-500">
                      {cow.battery < 20
                        ? "Critical power state: Replace collar power pack immediately to maintain continuous tracking."
                        : "Battery power optimal. Estimated operation: ~45 days before next scheduled service."}
                    </p>
                    {cow.battery <= 20 && onRechargeBattery && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleRecharge}
                        className="h-8 text-xs font-semibold text-emerald-700 border-emerald-300 hover:bg-emerald-50 mt-2"
                      >
                        <RefreshCw size={13} className="mr-1.5" />
                        {recharged ? "Collar Battery Swapped!" : "Simulate Battery Replacement (100%)"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Collar Subsystem Telemetry
                </h3>
                {[
                  { name: "Contact Thermistor Array", status: cow.sensors?.temp || "ONLINE", icon: Thermometer },
                  { name: "3-Axis Movement Accelerometer", status: cow.sensors?.motion || "ONLINE", icon: Activity },
                  { name: "GNSS / GPS Geofencing Module", status: cow.sensors?.gps || "ONLINE", icon: MapPin },
                ].map((sensor, idx) => (
                  <Card key={idx} className="shadow-xs">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <sensor.icon className="text-slate-400" size={18} />
                        <span className="font-semibold text-xs text-slate-800">{sensor.name}</span>
                      </div>
                      <Badge
                        className={`text-[10px] font-bold ${
                          sensor.status === "ONLINE" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                        }`}
                      >
                        {sensor.status}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  );
};
