import { Cow, BarnEnvironment, TelemetryPoint, SmartMooAlert } from "../types";
import { calculateTHI } from "./alertEngine";

export const INITIAL_COWS_DATA: Cow[] = [
  {
    id: "COW-101",
    name: "Daisy",
    status: "Healthy",
    battery: 88,
    temperature: 38.6,
    feedingStatus: "Optimal",
    movement: "Normal",
    sleep: "8h 15m",
    immunityScore: 92,
    isPregnant: true,
    inLabor: false,
    ruminationMinutes: 490,
    lastSeen: new Date().toISOString(),
    sensors: { temp: "ONLINE", motion: "ONLINE", gps: "ONLINE" },
    history: [
      { time: "10:30 AM", event: "Rumination Normal (490 min/day)" },
      { time: "Yesterday", event: "Routine veterinary check - All clear" },
      { time: "2 days ago", event: "Vaccination - Anthrax booster" },
    ],
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
    ruminationMinutes: 210,
    lastSeen: new Date().toISOString(),
    sensors: { temp: "ONLINE", motion: "ONLINE", gps: "DAMAGED" },
    history: [
      { time: "08:15 AM", event: "Fever Detected (40.2°C) - Alert Triggered" },
      { time: "06:00 AM", event: "Rumination dropped 45% below herd average" },
      { time: "Yesterday", event: "Low battery warning dispatched to farm supervisor" },
    ],
  },
  {
    id: "COW-103",
    name: "Luna",
    status: "Warning",
    battery: 94,
    temperature: 39.2,
    feedingStatus: "Restless",
    movement: "High",
    sleep: "4h 20m",
    immunityScore: 78,
    isPregnant: true,
    inLabor: true,
    ruminationMinutes: 340,
    lastSeen: new Date().toISOString(),
    sensors: { temp: "ONLINE", motion: "ONLINE", gps: "ONLINE" },
    history: [
      { time: "11:45 AM", event: "Active Labor Contraction Detected" },
      { time: "09:00 AM", event: "Pre-labor restlessness and tail-swishing activity" },
      { time: "3 days ago", event: "Maternity pen reservation assigned" },
    ],
  },
  {
    id: "COW-104",
    name: "Bessie",
    status: "Healthy",
    battery: 52,
    temperature: 38.5,
    feedingStatus: "Normal",
    movement: "Normal",
    sleep: "7h 55m",
    immunityScore: 88,
    isPregnant: false,
    inLabor: false,
    ruminationMinutes: 475,
    lastSeen: new Date().toISOString(),
    sensors: { temp: "ONLINE", motion: "ONLINE", gps: "ONLINE" },
    history: [
      { time: "12:10 PM", event: "Automatic grain feeder dispenser check" },
      { time: "Yesterday", event: "Pasture Rotation to Sector 4" },
    ],
  },
];

export const INITIAL_BARN_DATA: BarnEnvironment = {
  id: "BARN-01",
  name: "Main Free-Stall Barn (Sector Alpha)",
  ambientTemperature: 24.2,
  humidity: 64.0,
  thi: 71.8,
  waterTroughLevel: 68.0,
  waterFlowRate: 14.5,
  feedSiloCapacity: 72.0,
  feedBunkStatus: "Adequate",
  ventilationActive: true,
  lastUpdated: new Date().toISOString(),
  sensorsStatus: {
    tempHumidity: "ONLINE",
    waterLevel: "ONLINE",
    feedSilo: "ONLINE",
  },
};

export const INITIAL_ALERTS: SmartMooAlert[] = [
  {
    id: "ALT-102-FEVER",
    ruleId: "COW_HYPERTHERMIA_CRITICAL",
    severity: "critical",
    targetType: "cow",
    targetId: "COW-102",
    targetName: "Bella",
    metric: "Body Temperature",
    observedValue: 40.2,
    thresholdValue: ">39.8°C",
    unit: "°C",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: "active",
    recommendedAction:
      "High fever detected. Move animal to isolation stall, check for infection signs, provide cool water, and summon veterinarian.",
  },
  {
    id: "ALT-102-BATT",
    ruleId: "COLLAR_BATTERY_CRITICAL",
    severity: "critical",
    targetType: "cow",
    targetId: "COW-102",
    targetName: "Bella",
    metric: "Collar Battery",
    observedValue: 12,
    thresholdValue: "<=10%",
    unit: "%",
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    status: "acknowledged",
    recommendedAction:
      "Critical collar battery. Telemetry will terminate imminently. Swap collar battery pack immediately.",
    acknowledgedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "ALT-103-LABOR",
    ruleId: "COW_LABOR_ACTIVE",
    severity: "critical",
    targetType: "cow",
    targetId: "COW-103",
    targetName: "Luna",
    metric: "Obstetric Contraction",
    observedValue: "Active labor pattern",
    thresholdValue: "Active Stage 2",
    unit: "state",
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    status: "active",
    recommendedAction:
      "Active calving in progress. Move to clean maternity pen, observe delivery progression, prepare calf resuscitation equipment.",
  },
  {
    id: "ALT-BARN-THI",
    ruleId: "BARN_HEAT_STRESS_WARN",
    severity: "warning",
    targetType: "barn",
    targetId: "BARN-01",
    targetName: "Main Free-Stall Barn (Sector Alpha)",
    metric: "Heat Stress THI",
    observedValue: 71.8,
    thresholdValue: ">=72.0",
    unit: "THI",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    status: "active",
    recommendedAction:
      "Moderate heat stress warning approaching threshold. Ensure high-volume circulation fans remain continuous.",
  },
];

/**
 * Generates realistic synthetic historical telemetry for a given time window.
 * DISCLOSURE: These data points are simulated with biological circadian rhythms
 * for demonstration and testing purposes.
 */
export function generateSyntheticHistory(period: "1h" | "24h" | "7d"): TelemetryPoint[] {
  const points: TelemetryPoint[] = [];
  const now = Date.now();

  let count = 24;
  let intervalMs = 3600 * 1000; // 1 hour step for 24h

  if (period === "1h") {
    count = 12; // every 5 minutes
    intervalMs = 5 * 60 * 1000;
  } else if (period === "7d") {
    count = 28; // every 6 hours
    intervalMs = 6 * 3600 * 1000;
  }

  const startTime = now - count * intervalMs;

  for (let i = 0; i <= count; i++) {
    const timestampMs = startTime + i * intervalMs;
    const date = new Date(timestampMs);
    const hour = date.getHours() + date.getMinutes() / 60;

    // Circadian temperature curve (peak at 14:00, trough at 05:00)
    const diurnalAngle = ((hour - 5) / 24) * 2 * Math.PI;
    const ambientBase = 22 + 5 * Math.sin(diurnalAngle);
    const ambientNoise = (Math.sin(i * 1.7) * 0.4);
    const ambientTemp = Math.round((ambientBase + ambientNoise) * 10) / 10;

    // Humidity is roughly inverse of temperature
    const humidityBase = 70 - 15 * Math.sin(diurnalAngle);
    const humidity = Math.round((humidityBase + Math.cos(i * 1.3) * 2) * 10) / 10;

    const thi = calculateTHI(ambientTemp, humidity);

    // Cattle body temperature (normal circadian baseline around 38.6°C)
    const cowTempBase = 38.5 + 0.3 * Math.sin(diurnalAngle);
    const cowTemp = Math.round((cowTempBase + (Math.sin(i * 0.9) * 0.1)) * 10) / 10;

    // Water level decreases gradually with refills
    const waterBase = 75 - ((i % 8) * 4) + (Math.sin(i * 2) * 1.5);
    const waterLevel = Math.round(Math.max(25, Math.min(95, waterBase)));

    // Feed level drops gradually during day
    const feedBase = 80 - ((i % 12) * 3);
    const feedLevel = Math.round(Math.max(20, Math.min(98, feedBase)));

    // Rumination minutes in interval
    const ruminationMin = Math.round(20 + 10 * Math.cos(diurnalAngle) + Math.random() * 4);
    const activityScore = Math.round(50 + 25 * Math.sin(diurnalAngle) + Math.random() * 8);

    points.push({
      timestamp: date.toISOString(),
      cowTemp,
      ambientTemp,
      humidity,
      thi,
      waterLevel,
      feedLevel,
      ruminationMin,
      activityScore,
    });
  }

  return points;
}

/**
 * Simulates a small dynamic telemetry tick for live DEMO MODE.
 * Keeps values within biologically sensible ranges with realistic slight variations.
 */
export function simulateLiveTick(currentCow: Cow, currentBarn: BarnEnvironment): { cow: Cow; barn: BarnEnvironment } {
  const deltaTemp = (Math.random() - 0.5) * 0.08;
  const newCowTemp = Math.round((currentCow.temperature + deltaTemp) * 100) / 100;

  const deltaAmbient = (Math.random() - 0.5) * 0.12;
  const newAmbient = Math.round((currentBarn.ambientTemperature + deltaAmbient) * 10) / 10;

  const deltaHumidity = (Math.random() - 0.5) * 0.3;
  const newHumidity = Math.round((currentBarn.humidity + deltaHumidity) * 10) / 10;

  const newThi = calculateTHI(newAmbient, newHumidity);

  // Slight water consumption (or random refill if <35%)
  let newWater = currentBarn.waterTroughLevel - (Math.random() > 0.7 ? 0.3 : 0);
  if (newWater < 30) newWater = 85.0; // Simulated auto-refill valve kicks in
  newWater = Math.round(newWater * 10) / 10;

  const updatedCow: Cow = {
    ...currentCow,
    temperature: newCowTemp,
    lastSeen: new Date().toISOString(),
  };

  const updatedBarn: BarnEnvironment = {
    ...currentBarn,
    ambientTemperature: newAmbient,
    humidity: newHumidity,
    thi: newThi,
    waterTroughLevel: newWater,
    lastUpdated: new Date().toISOString(),
  };

  return { cow: updatedCow, barn: updatedBarn };
}
