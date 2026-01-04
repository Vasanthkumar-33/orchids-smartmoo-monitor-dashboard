"use client";

import React, { useState, useMemo } from "react";
import { 
  Activity, 
  Battery, 
  ChevronRight, 
  LogOut, 
  Search, 
  Thermometer, 
  Wind, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  MapPin, 
  Settings,
  ArrowLeft,
  Bell,
  Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

// --- Types ---

type CowStatus = "Healthy" | "Critical" | "Warning";

interface SensorStatus {
  temp: "ONLINE" | "OFFLINE" | "DAMAGED";
  motion: "ONLINE" | "OFFLINE" | "DAMAGED";
  gps: "ONLINE" | "OFFLINE" | "DAMAGED";
}

interface Cow {
  id: string;
  name: string;
  status: CowStatus;
  battery: number;
  temperature: number;
  feedingStatus: string;
  movement: "High" | "Normal" | "Low";
  sleep: string;
  immunityScore: number;
  isPregnant: boolean;
  inLabor: boolean;
  sensors: SensorStatus;
  history: { time: string; event: string }[];
}

// --- Mock Data ---

const INITIAL_COWS: Cow[] = [
  {
    id: "COW-101",
    name: "Daisy",
    status: "Healthy",
    battery: 85,
    temperature: 38.5,
    feedingStatus: "Optimal",
    movement: "Normal",
    sleep: "8h 12m",
    immunityScore: 92,
    isPregnant: true,
    inLabor: false,
    sensors: { temp: "ONLINE", motion: "ONLINE", gps: "ONLINE" },
    history: [
      { time: "10:30 AM", event: "Rumination Normal" },
      { time: "2 days ago", event: "Vaccination - Anthrax" }
    ]
  },
  {
    id: "COW-102",
    name: "Bella",
    status: "Critical",
    battery: 12,
    temperature: 40.2,
    feedingStatus: "Low Intake",
    movement: "Low",
    sleep: "11h 45m",
    immunityScore: 45,
    isPregnant: false,
    inLabor: false,
    sensors: { temp: "ONLINE", motion: "ONLINE", gps: "DAMAGED" },
    history: [
      { time: "08:15 AM", event: "Fever Detected" },
      { time: "06:00 AM", event: "Movement Drop Alert" }
    ]
  },
  {
    id: "COW-103",
    name: "Luna",
    status: "Warning",
    battery: 94,
    temperature: 39.1,
    feedingStatus: "Restless",
    movement: "High",
    sleep: "4h 20m",
    immunityScore: 78,
    isPregnant: true,
    inLabor: true,
    sensors: { temp: "ONLINE", motion: "ONLINE", gps: "ONLINE" },
    history: [
      { time: "11:45 AM", event: "Active Labor Detected" },
      { time: "09:00 AM", event: "Pre-labor Movement" }
    ]
  },
  {
    id: "COW-104",
    name: "Bessie",
    status: "Healthy",
    battery: 45,
    temperature: 38.6,
    feedingStatus: "Normal",
    movement: "Normal",
    sleep: "7h 55m",
    immunityScore: 88,
    isPregnant: false,
    inLabor: false,
    sensors: { temp: "ONLINE", motion: "ONLINE", gps: "ONLINE" },
    history: [
      { time: "Yesterday", event: "Pasture Rotation" }
    ]
  }
];

// --- Components ---

const LoginPage = ({ onLogin }: { onLogin: () => void }) => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-emerald-50 p-4">
      <Card className="w-full max-w-md border-2 border-emerald-100 shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-600 text-white">
            <Activity size={48} />
          </div>
          <CardTitle className="text-3xl font-bold text-emerald-900">SmartMoo Monitor</CardTitle>
          <CardDescription className="text-emerald-700">Hackathon Edition - Stable-Ready Tech</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-emerald-900">Farmer ID</label>
            <Input className="h-12 border-emerald-200 focus:ring-emerald-500" placeholder="e.g., FARM-001" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-emerald-900">Passcode</label>
            <Input className="h-12 border-emerald-200 focus:ring-emerald-500" type="password" placeholder="••••••" />
          </div>
          <Button 
            className="h-14 w-full bg-emerald-600 text-lg font-bold hover:bg-emerald-700 active:scale-95 transition-transform"
            onClick={onLogin}
          >
            LOGIN TO DASHBOARD
          </Button>
          <p className="text-center text-sm text-emerald-600">Secure hardware-sync encrypted connection</p>
        </CardContent>
      </Card>
    </div>
  );
};

const Dashboard = ({ 
  cows, 
  onSelectCow, 
  onLogout 
}: { 
  cows: Cow[], 
  onSelectCow: (id: string) => void,
  onLogout: () => void
}) => {
  const [search, setSearch] = useState("");

  const filteredCows = cows.filter(c => 
    c.id.toLowerCase().includes(search.toLowerCase()) || 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const healthyCount = cows.filter(c => c.status === "Healthy").length;
  const actionCount = cows.filter(c => c.status !== "Healthy").length;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <Activity size={20} />
          </div>
          <h1 className="text-xl font-bold text-emerald-900">SmartMoo</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={onLogout} className="text-emerald-600">
          <LogOut size={24} />
        </Button>
      </header>

      <main className="flex-1 p-4 md:p-6 space-y-6 max-w-2xl mx-auto w-full">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-l-4 border-l-emerald-500">
            <CardContent className="p-4 flex flex-col items-center">
              <span className="text-sm font-medium text-slate-500">Healthy</span>
              <span className="text-3xl font-bold text-emerald-600">{healthyCount}</span>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-4 flex flex-col items-center">
              <span className="text-sm font-medium text-slate-500">Action Needed</span>
              <span className="text-3xl font-bold text-red-600">{actionCount}</span>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <Input 
            className="h-12 pl-10 border-slate-200" 
            placeholder="Search Cow ID or Name..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Cow List */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-800">Cow Inventory</h2>
          {filteredCows.map(cow => (
            <Card 
              key={cow.id} 
              className="overflow-hidden cursor-pointer hover:border-emerald-300 transition-colors"
              onClick={() => onSelectCow(cow.id)}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${
                    cow.status === "Healthy" ? "bg-emerald-100 text-emerald-600" : 
                    cow.status === "Critical" ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"
                  }`}>
                    {cow.status === "Healthy" ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900">{cow.name}</h3>
                      <span className="text-xs text-slate-500">{cow.id}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {cow.inLabor && (
                        <Badge variant="destructive" className="animate-pulse bg-red-600">IN LABOR</Badge>
                      )}
                      {cow.battery < 20 && (
                        <Badge variant="outline" className="border-red-500 text-red-600">LOW BATT</Badge>
                      )}
                      {!cow.inLabor && cow.battery >= 20 && (
                        <span className="text-xs text-slate-500">{cow.status}</span>
                      )}
                    </div>
                  </div>
                </div>
                <ChevronRight className="text-slate-300" />
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

const CowDetail = ({ 
  cow, 
  onBack, 
  onMarkChecked 
}: { 
  cow: Cow, 
  onBack: () => void, 
  onMarkChecked: (id: string) => void 
}) => {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Top Header */}
      <header className="flex items-center justify-between border-b px-6 py-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft size={24} />
        </Button>
        <div className="text-center">
          <h1 className="text-xl font-bold text-emerald-900">{cow.name}</h1>
          <p className="text-xs text-slate-500 uppercase tracking-widest">{cow.id}</p>
        </div>
        <div className="w-10"></div> {/* Spacer */}
      </header>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6 max-w-2xl mx-auto w-full">
          {/* Labor Alert */}
          {cow.inLabor && (
            <div className="bg-red-600 rounded-xl p-6 text-white text-center space-y-4 animate-[pulse_2s_infinite]">
              <div className="flex justify-center">
                <AlertTriangle size={48} className="animate-bounce" />
              </div>
              <div>
                <h2 className="text-2xl font-black">LABOR PAIN DETECTED</h2>
                <p className="opacity-90">Luna is showing signs of active delivery. Immediate attention required.</p>
              </div>
              <Button 
                onClick={() => onMarkChecked(cow.id)}
                className="w-full bg-white text-red-600 font-bold hover:bg-slate-100"
              >
                MARK AS CHECKED
              </Button>
            </div>
          )}

          <Tabs defaultValue="health" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-12 bg-slate-100 rounded-lg p-1">
              <TabsTrigger value="health" className="data-[state=active]:bg-white data-[state=active]:text-emerald-700">Health</TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-white data-[state=active]:text-emerald-700">History</TabsTrigger>
              <TabsTrigger value="hardware" className="data-[state=active]:bg-white data-[state=active]:text-emerald-700">Hardware</TabsTrigger>
            </TabsList>

            <TabsContent value="health" className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex justify-between items-center text-slate-500">
                      <span className="text-xs font-semibold">TEMP</span>
                      <Thermometer size={16} />
                    </div>
                    <div className={`text-2xl font-bold ${cow.temperature > 39.5 ? "text-red-600" : "text-emerald-600"}`}>
                      {cow.temperature}°C
                    </div>
                    {cow.temperature > 39.5 && <p className="text-[10px] text-red-500 font-bold uppercase">FEVER ALERT</p>}
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex justify-between items-center text-slate-500">
                      <span className="text-xs font-semibold">SLEEP</span>
                      <Clock size={16} />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">
                      {cow.sleep}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex justify-between items-center text-slate-500">
                      <span className="text-xs font-semibold">ACTIVITY</span>
                      <Activity size={16} />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">
                      {cow.movement}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex justify-between items-center text-slate-500">
                      <span className="text-xs font-semibold">FEEDING</span>
                      <Wind size={16} />
                    </div>
                    <div className="text-xl font-bold text-slate-900">
                      {cow.feedingStatus}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-slate-500 flex items-center gap-2">
                    <ShieldCheck size={18} className="text-emerald-600" />
                    IMMUNITY SCORE
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-4xl font-black text-emerald-600">{cow.immunityScore}%</span>
                    <span className="text-sm font-medium text-slate-400">Target: 85%+</span>
                  </div>
                  <Progress value={cow.immunityScore} className="h-3 bg-emerald-100" />
                  <p className="text-xs text-slate-500 italic">
                    Based on rumination frequency, sleep cycles, and internal collar sensors.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-8">
                    {cow.history.map((item, i) => (
                      <div key={i} className="flex gap-4 relative">
                        {i !== cow.history.length - 1 && (
                          <div className="absolute left-[11px] top-7 bottom-[-20px] w-0.5 bg-slate-100" />
                        )}
                        <div className="h-6 w-6 rounded-full bg-emerald-500 flex-shrink-0 z-10 border-4 border-white shadow-sm" />
                        <div className="space-y-1">
                          <p className="text-xs text-slate-400 font-bold uppercase">{item.time}</p>
                          <p className="text-sm font-semibold text-slate-800">{item.event}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="hardware" className="mt-6 space-y-4">
              <Card>
                <CardContent className="p-6 flex items-center gap-6">
                  <div className="relative h-24 w-24 flex items-center justify-center">
                    <svg className="h-full w-full rotate-[-90deg]">
                      <circle 
                        cx="48" cy="48" r="40" 
                        fill="transparent" 
                        stroke="#f1f5f9" 
                        strokeWidth="8" 
                      />
                      <circle 
                        cx="48" cy="48" r="40" 
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
                  <div className="flex-1 space-y-1">
                    <h3 className="font-bold text-slate-900">Collar V3.2 Battery</h3>
                    <p className="text-sm text-slate-500">
                      {cow.battery < 20 ? "Critical: Replace collar immediately" : "Power status: Optimal"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Sensor Diagnostics</h3>
                {[
                  { name: "Body Temp Sensor", status: cow.sensors.temp, icon: Thermometer },
                  { name: "Axi-Gyroscope", status: cow.sensors.motion, icon: Activity },
                  { name: "GPS Tracking Module", status: cow.sensors.gps, icon: MapPin },
                ].map((sensor, idx) => (
                  <Card key={idx}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <sensor.icon className="text-slate-400" size={20} />
                        <span className="font-medium text-slate-700">{sensor.name}</span>
                      </div>
                      <Badge 
                        className={sensor.status === "ONLINE" ? "bg-emerald-500" : "bg-red-500"}
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

// --- Main Page Component ---

export default function Home() {
  const [view, setView] = useState<"login" | "dashboard" | "detail">("login");
  const [cows, setCows] = useState<Cow[]>(INITIAL_COWS);
  const [selectedCowId, setSelectedCowId] = useState<string | null>(null);

  const selectedCow = useMemo(() => 
    cows.find(c => c.id === selectedCowId) || null,
  [cows, selectedCowId]);

  const handleLogin = () => setView("dashboard");
  const handleLogout = () => setView("login");

  const handleSelectCow = (id: string) => {
    setSelectedCowId(id);
    setView("detail");
  };

  const handleBackToDashboard = () => {
    setView("dashboard");
    setSelectedCowId(null);
  };

  const handleMarkChecked = (id: string) => {
    setCows(prev => prev.map(c => 
      c.id === id 
        ? { ...c, inLabor: false, status: "Healthy" as const } 
        : c
    ));
    // We stay in detail view, but the UI updates
  };

  return (
    <div className="antialiased text-slate-900">
      {view === "login" && <LoginPage onLogin={handleLogin} />}
      {view === "dashboard" && (
        <Dashboard 
          cows={cows} 
          onSelectCow={handleSelectCow} 
          onLogout={handleLogout} 
        />
      )}
      {view === "detail" && selectedCow && (
        <CowDetail 
          cow={selectedCow} 
          onBack={handleBackToDashboard} 
          onMarkChecked={handleMarkChecked} 
        />
      )}
    </div>
  );
}
