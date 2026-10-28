export type HealthStatus = "Healthy" | "Warning" | "Critical";
export type AlertSeverity = "info" | "warning" | "critical";
export type AlertStatus = "active" | "acknowledged" | "resolved";

export type SensorHardwareStatus = "ONLINE" | "STALE" | "OFFLINE" | "DAMAGED";

export interface SensorStatusMap {
  temp: SensorHardwareStatus;
  motion: SensorHardwareStatus;
  gps: SensorHardwareStatus;
}

export interface Cow {
  id: string;
  name: string;
  status: HealthStatus;
  battery: number;
  temperature: number; // in °C
  feedingStatus: string;
  movement: "High" | "Normal" | "Low";
  sleep: string;
  immunityScore: number;
  isPregnant: boolean;
  inLabor: boolean;
  ruminationMinutes: number; // daily minutes
  lastSeen: string; // ISO string
  sensors: SensorStatusMap;
  history: { time: string; event: string }[];
}

export interface BarnEnvironment {
  id: string;
  name: string;
  ambientTemperature: number; // °C
  humidity: number; // %
  thi: number; // Temperature-Humidity Index
  waterTroughLevel: number; // %
  waterFlowRate: number; // L/min
  feedSiloCapacity: number; // %
  feedBunkStatus: "Full" | "Adequate" | "Low" | "Empty";
  ventilationActive: boolean;
  lastUpdated: string;
  sensorsStatus: {
    tempHumidity: SensorHardwareStatus;
    waterLevel: SensorHardwareStatus;
    feedSilo: SensorHardwareStatus;
  };
}

export interface TelemetryPoint {
  timestamp: string;
  cowTemp: number;
  ambientTemp: number;
  humidity: number;
  thi: number;
  waterLevel: number;
  feedLevel: number;
  ruminationMin: number;
  activityScore: number;
}

export interface SmartMooAlert {
  id: string;
  ruleId: string;
  severity: AlertSeverity;
  targetType: "cow" | "barn" | "sensor";
  targetId: string;
  targetName: string;
  metric: string;
  observedValue: number | string;
  thresholdValue: number | string;
  unit: string;
  timestamp: string;
  status: AlertStatus;
  recommendedAction: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
}

export interface ThresholdConfig {
  cowTempWarningLow: number;
  cowTempWarningHigh: number;
  cowTempCriticalLow: number;
  cowTempCriticalHigh: number;
  barnTempWarning: number;
  barnTempCritical: number;
  barnThiWarning: number;
  barnThiCritical: number;
  waterLevelWarning: number;
  waterLevelCritical: number;
  feedLevelWarning: number;
  feedLevelCritical: number;
  batteryWarning: number;
  batteryCritical: number;
  staleSensorSeconds: number;
}

export interface AnalyticsSummary {
  period: "1h" | "24h" | "7d";
  avgCowTemp: number;
  minCowTemp: number;
  maxCowTemp: number;
  avgAmbientTemp: number;
  avgHumidity: number;
  avgThi: number;
  avgWaterLevel: number;
  avgFeedLevel: number;
  totalAlerts: number;
  activeCritical: number;
  activeWarning: number;
  acknowledgedCount: number;
  sensorUptimePercent: number;
  recommendations: Array<{
    id: string;
    priority: "high" | "medium" | "low";
    title: string;
    description: string;
    metricTrigger: string;
    source: string;
  }>;
}
