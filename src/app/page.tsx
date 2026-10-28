"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Activity,
  BarChart3,
  Home as HomeIcon,
  Bell,
  Settings,
  Users,
  Layers,
  Thermometer,
  ShieldAlert,
  Radio,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

// Types & Services
import { Cow, BarnEnvironment, SmartMooAlert, ThresholdConfig, TelemetryPoint } from "@/lib/types";
import { DEFAULT_THRESHOLDS } from "@/lib/config/thresholds";
import {
  INITIAL_COWS_DATA,
  INITIAL_BARN_DATA,
  INITIAL_ALERTS,
  generateSyntheticHistory,
  simulateLiveTick,
} from "@/lib/services/telemetryService";
import { AlertEngine } from "@/lib/services/alertEngine";
import { AnalyticsService } from "@/lib/services/analyticsService";
import { StorageService } from "@/lib/services/storageService";

// Dashboard Components
import { Header } from "@/components/dashboard/Header";
import { DemoModeBanner } from "@/components/dashboard/DemoModeBanner";
import { OverviewTab } from "@/components/dashboard/OverviewTab";
import { BarnTab } from "@/components/dashboard/BarnTab";
import { LivestockTab } from "@/components/dashboard/LivestockTab";
import { HistoricalChartsTab } from "@/components/dashboard/HistoricalChartsTab";
import { AlertsCenterTab } from "@/components/dashboard/AlertsCenterTab";
import { ThresholdSettingsTab } from "@/components/dashboard/ThresholdSettingsTab";
import { CowDetailModal } from "@/components/dashboard/CowDetailModal";

// --- Login Page (Preserving original UX with modern enhancements) ---

const LoginPage = ({ onLogin }: { onLogin: () => void }) => {
  const [farmerId, setFarmerId] = useState("FARM-001");
  const [passcode, setPasscode] = useState("••••••");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
            <Activity size={36} />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-emerald-950">SmartMoo Monitor</h1>
          <p className="text-xs text-slate-500 font-medium">
            IoT Livestock & Barn Environmental Intelligence Platform
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Farmer ID</label>
            <Input
              className="h-11 border-slate-200 focus:ring-emerald-500"
              placeholder="e.g., FARM-001"
              value={farmerId}
              onChange={(e) => setFarmerId(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Access Key / Passcode</label>
            <Input
              className="h-11 border-slate-200 focus:ring-emerald-500"
              type="password"
              placeholder="••••••"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
            />
          </div>

          <Button
            className="h-12 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold tracking-wide shadow-md active:scale-[0.99] transition-transform"
            onClick={onLogin}
          >
            LOGIN TO DASHBOARD
          </Button>

          <div className="pt-2 text-center text-xs text-slate-400 space-y-1">
            <p className="flex items-center justify-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              Secure hardware-sync encrypted connection
            </p>
            <p className="text-[11px] text-slate-400">Preloaded demonstration profile: FARM-001</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main Application Component ---

export default function Home() {
  const [view, setView] = useState<"login" | "dashboard" | "detail">("login");
  const [activeTab, setActiveTab] = useState<"overview" | "barn" | "livestock" | "historical" | "alerts" | "thresholds">("overview");

  // Domain State
  const [cows, setCows] = useState<Cow[]>(INITIAL_COWS_DATA);
  const [barn, setBarn] = useState<BarnEnvironment>(INITIAL_BARN_DATA);
  const [alerts, setAlerts] = useState<SmartMooAlert[]>(INITIAL_ALERTS);
  const [thresholds, setThresholds] = useState<ThresholdConfig>(DEFAULT_THRESHOLDS);
  const [selectedCowId, setSelectedCowId] = useState<string | null>(null);

  // Demo & Simulation State
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [isSimulating, setIsSimulating] = useState(true);
  const [lastTickTime, setLastTickTime] = useState<string>(new Date().toISOString());

  // Historical Telemetry Window
  const [historyPeriod, setHistoryPeriod] = useState<"1h" | "24h" | "7d">("24h");
  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryPoint[]>([]);

  // Initialize from storage on mount
  useEffect(() => {
    const loadedCows = StorageService.loadCows();
    const loadedBarn = StorageService.loadBarn();
    const loadedAlerts = StorageService.loadAlerts();
    const loadedThresholds = StorageService.loadThresholds();
    const loadedDemo = StorageService.loadDemoMode();

    setCows(loadedCows);
    setBarn(loadedBarn);
    setAlerts(loadedAlerts);
    setThresholds(loadedThresholds);
    setIsDemoMode(loadedDemo);

    // Initial synthetic history
    setTelemetryHistory(generateSyntheticHistory(historyPeriod));
  }, []);

  // Refresh history when period changes
  useEffect(() => {
    setTelemetryHistory(generateSyntheticHistory(historyPeriod));
  }, [historyPeriod]);

  // Refs to avoid circular dependency loops in useEffect
  const alertsRef = React.useRef<SmartMooAlert[]>(alerts);
  const barnRef = React.useRef<BarnEnvironment>(barn);

  useEffect(() => {
    alertsRef.current = alerts;
  }, [alerts]);

  useEffect(() => {
    barnRef.current = barn;
  }, [barn]);

  // Safe evaluation function that only sets alerts state if changes actually occur
  const evaluateAlerts = useCallback((currentCows: Cow[], currentBarn: BarnEnvironment) => {
    const nowIso = new Date().toISOString();
    const engine = new AlertEngine(thresholds, alertsRef.current);
    engine.evaluateCows(currentCows, nowIso);
    engine.evaluateBarn(currentBarn, nowIso);
    const updatedAlerts = engine.getAlerts();

    // Check if alerts changed to avoid render loop
    const isDifferent =
      updatedAlerts.length !== alertsRef.current.length ||
      updatedAlerts.some((a, idx) => {
        const prev = alertsRef.current[idx];
        return !prev || prev.status !== a.status || prev.observedValue !== a.observedValue || prev.severity !== a.severity;
      });

    if (isDifferent) {
      setAlerts(updatedAlerts);
      StorageService.saveAlerts(updatedAlerts);
    }
  }, [thresholds]);

  // Live Simulation Interval (every 4 seconds when active)
  useEffect(() => {
    if (!isDemoMode || !isSimulating) return;

    const interval = setInterval(() => {
      // Pick random cow to receive slight telemetry fluctuation
      setCows((prevCows) => {
        if (prevCows.length === 0) return prevCows;
        const targetIndex = Math.floor(Math.random() * prevCows.length);
        const targetCow = prevCows[targetIndex];
        const currentBarn = barnRef.current;
        const { cow: updatedCow, barn: updatedBarn } = simulateLiveTick(targetCow, currentBarn);

        const newCows = [...prevCows];
        newCows[targetIndex] = updatedCow;

        StorageService.saveCows(newCows);
        StorageService.saveBarn(updatedBarn);
        setBarn(updatedBarn);
        setLastTickTime(new Date().toISOString());

        evaluateAlerts(newCows, updatedBarn);

        return newCows;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isDemoMode, isSimulating, evaluateAlerts]);

  // Re-evaluate alerts when thresholds change
  useEffect(() => {
    evaluateAlerts(cows, barn);
  }, [thresholds, evaluateAlerts]);

  // Analytics Computation
  const analytics = useMemo(() => {
    return AnalyticsService.computeSummary(telemetryHistory, alerts, historyPeriod);
  }, [telemetryHistory, alerts, historyPeriod]);

  // Selected Cow Lookup
  const selectedCow = useMemo(() => {
    return cows.find((c) => c.id === selectedCowId) || null;
  }, [cows, selectedCowId]);

  // Handlers
  const handleLogin = () => setView("dashboard");
  const handleLogout = () => {
    setView("login");
    setSelectedCowId(null);
  };

  const handleSelectCow = (id: string) => {
    setSelectedCowId(id);
    setView("detail");
  };

  const handleBackToDashboard = () => {
    setView("dashboard");
    setSelectedCowId(null);
  };

  const handleMarkChecked = (id: string) => {
    setCows((prev) => {
      const updated = prev.map((c) =>
        c.id === id ? { ...c, inLabor: false, status: "Healthy" as const } : c
      );
      StorageService.saveCows(updated);
      return updated;
    });

    // Also resolve associated labor alert if any
    const laborAlert = alertsRef.current.find((a) => a.targetId === id && a.ruleId === "COW_LABOR_ACTIVE");
    if (laborAlert) {
      const engine = new AlertEngine(thresholds, alertsRef.current);
      engine.resolveAlert(laborAlert.id);
      const updated = engine.getAlerts();
      setAlerts(updated);
      StorageService.saveAlerts(updated);
    }
  };

  const handleRechargeBattery = (id: string) => {
    setCows((prev) => {
      const updated = prev.map((c) =>
        c.id === id ? { ...c, battery: 100, status: c.temperature >= 39.8 ? ("Critical" as const) : ("Healthy" as const) } : c
      );
      StorageService.saveCows(updated);
      return updated;
    });

    const battAlert = alertsRef.current.find((a) => a.targetId === id && a.ruleId.startsWith("COLLAR_BATTERY"));
    if (battAlert) {
      const engine = new AlertEngine(thresholds, alertsRef.current);
      engine.resolveAlert(battAlert.id);
      const updated = engine.getAlerts();
      setAlerts(updated);
      StorageService.saveAlerts(updated);
    }
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    const engine = new AlertEngine(thresholds, alertsRef.current);
    engine.acknowledgeAlert(alertId);
    const updated = engine.getAlerts();
    setAlerts(updated);
    StorageService.saveAlerts(updated);
  };

  const handleResolveAlert = (alertId: string) => {
    const engine = new AlertEngine(thresholds, alertsRef.current);
    engine.resolveAlert(alertId);
    const updated = engine.getAlerts();
    setAlerts(updated);
    StorageService.saveAlerts(updated);
  };

  const handleSaveThresholds = (newThresholds: ThresholdConfig) => {
    setThresholds(newThresholds);
    StorageService.saveThresholds(newThresholds);
    evaluateAlerts(cows, barn);
  };

  const handleResetDefaults = () => {
    setThresholds(DEFAULT_THRESHOLDS);
    StorageService.saveThresholds(DEFAULT_THRESHOLDS);
    evaluateAlerts(cows, barn);
  };

  const handleUpdateBarn = (updated: Partial<BarnEnvironment>) => {
    setBarn((prev) => {
      const merged = { ...prev, ...updated };
      StorageService.saveBarn(merged);
      return merged;
    });
  };

  // Alert Counts
  const activeAlertCount = alerts.filter((a) => a.status === "active").length;
  const criticalAlertCount = alerts.filter((a) => a.severity === "critical" && a.status === "active").length;

  return (
    <div className="min-h-screen bg-slate-50/80 text-slate-900 antialiased font-sans">
      {/* 1. Login View */}
      {view === "login" && <LoginPage onLogin={handleLogin} />}

      {/* 2. Detail View */}
      {view === "detail" && selectedCow && (
        <CowDetailModal
          cow={selectedCow}
          onBack={handleBackToDashboard}
          onMarkChecked={handleMarkChecked}
          onRechargeBattery={handleRechargeBattery}
        />
      )}

      {/* 3. Main Dashboard View */}
      {view === "dashboard" && (
        <div className="flex min-h-screen flex-col">
          {/* Header */}
          <Header
            onLogout={handleLogout}
            activeAlertCount={activeAlertCount}
            criticalAlertCount={criticalAlertCount}
            onOpenAlerts={() => setActiveTab("alerts")}
            isConnected={true}
          />

          {/* Demo Mode / Hardware Status Strip */}
          <DemoModeBanner
            isDemoMode={isDemoMode}
            onToggleDemoMode={() => {
              const toggled = !isDemoMode;
              setIsDemoMode(toggled);
              StorageService.saveDemoMode(toggled);
            }}
            isSimulating={isSimulating}
            onToggleSimulation={() => setIsSimulating(!isSimulating)}
            lastUpdated={lastTickTime}
          />

          {/* Navigation Bar */}
          <nav className="border-b bg-white px-4 md:px-8 py-2 overflow-x-auto shadow-2xs">
            <div className="flex items-center gap-1 min-w-max max-w-7xl mx-auto">
              {[
                { id: "overview", label: "Live Overview", icon: HomeIcon },
                { id: "barn", label: "Barn Environment", icon: Layers },
                { id: "livestock", label: `Livestock Roster (${cows.length})`, icon: Users },
                { id: "historical", label: "Historical & Analytics", icon: BarChart3 },
                {
                  id: "alerts",
                  label: `Alerts Center ${activeAlertCount > 0 ? `(${activeAlertCount})` : ""}`,
                  icon: Bell,
                  badge: criticalAlertCount > 0 ? "critical" : activeAlertCount > 0 ? "warning" : null,
                },
                { id: "thresholds", label: "Threshold Settings", icon: Settings },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs md:text-sm font-semibold transition-colors ${
                      isActive
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <Icon size={16} />
                    <span>{tab.label}</span>
                    {tab.badge === "critical" && (
                      <span className="h-2 w-2 rounded-full bg-red-500 animate-ping ml-0.5"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Main Content Body */}
          <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
            {activeTab === "overview" && (
              <OverviewTab
                cows={cows}
                barn={barn}
                alerts={alerts}
                analytics={analytics}
                onSelectCow={handleSelectCow}
                onNavigateTab={(tab) => setActiveTab(tab as any)}
              />
            )}

            {activeTab === "barn" && (
              <BarnTab barn={barn} onUpdateBarn={handleUpdateBarn} />
            )}

            {activeTab === "livestock" && (
              <LivestockTab cows={cows} onSelectCow={handleSelectCow} />
            )}

            {activeTab === "historical" && (
              <HistoricalChartsTab
                telemetryPoints={telemetryHistory}
                period={historyPeriod}
                onChangePeriod={(p) => setHistoryPeriod(p)}
                analytics={analytics}
              />
            )}

            {activeTab === "alerts" && (
              <AlertsCenterTab
                alerts={alerts}
                onAcknowledgeAlert={handleAcknowledgeAlert}
                onResolveAlert={handleResolveAlert}
              />
            )}

            {activeTab === "thresholds" && (
              <ThresholdSettingsTab
                thresholds={thresholds}
                onSaveThresholds={handleSaveThresholds}
                onResetDefaults={handleResetDefaults}
              />
            )}
          </main>

          {/* Footer with veterinary disclaimer and build info */}
          <footer className="border-t bg-white px-4 md:px-8 py-4 text-xs text-slate-500">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
              <p>
                SmartMoo IoT Monitor Dashboard — Phase 2 Prototype. Notice: Designed for early-detection awareness; does not replace veterinary diagnosis.
              </p>
              <div className="flex items-center gap-3 text-slate-400">
                <span>Next.js 15 App Router</span>
                <span>•</span>
                <span>Zod Telemetry Validated</span>
                <span>•</span>
                <span>Deterministic Alert Engine</span>
              </div>
            </div>
          </footer>
        </div>
      )}
    </div>
  );
}
