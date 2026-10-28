import type { Cow, BarnEnvironment, SmartMooAlert, ThresholdConfig, SensorHardwareStatus } from "../types.ts";

/**
 * Calculates Temperature-Humidity Index (THI) for dairy cattle:
 * THI = 0.8 * T + (RH / 100) * (T - 14.4) + 46.4
 * where T = Dry bulb temperature (°C), RH = Relative humidity (%)
 */
export function calculateTHI(tempC: number, humidityPercent: number): number {
  const thi = 0.8 * tempC + (humidityPercent / 100) * (tempC - 14.4) + 46.4;
  return Math.round(thi * 10) / 10;
}

/**
 * Evaluates live cattle and barn measurements against configurable thresholds.
 * Performs alert deduplication: if an active alert already exists for the same target + rule,
 * it updates the observed value and timestamp without duplicating the alert in the list.
 */
export class AlertEngine {
  private thresholds: ThresholdConfig;
  private alerts: SmartMooAlert[];

  constructor(initialThresholds: ThresholdConfig, initialAlerts: SmartMooAlert[] = []) {
    this.thresholds = initialThresholds;
    this.alerts = [...initialAlerts];
  }

  public setThresholds(newThresholds: Partial<ThresholdConfig>) {
    this.thresholds = { ...this.thresholds, ...newThresholds };
  }

  public getThresholds(): ThresholdConfig {
    return { ...this.thresholds };
  }

  public getAlerts(): SmartMooAlert[] {
    return [...this.alerts];
  }

  public getActiveAlerts(): SmartMooAlert[] {
    return this.alerts.filter((a) => a.status === "active");
  }

  public evaluateCows(cows: Cow[], nowIso: string = new Date().toISOString()): SmartMooAlert[] {
    const nowDate = new Date(nowIso);

    for (const cow of cows) {
      // 1. Cattle Body Temperature
      if (cow.temperature > this.thresholds.cowTempCriticalHigh) {
        this.upsertAlert({
          ruleId: "COW_HYPERTHERMIA_CRITICAL",
          severity: "critical",
          targetType: "cow",
          targetId: cow.id,
          targetName: cow.name,
          metric: "Body Temperature",
          observedValue: cow.temperature,
          thresholdValue: `>${this.thresholds.cowTempCriticalHigh}°C`,
          unit: "°C",
          timestamp: nowIso,
          recommendedAction:
            "High fever detected. Move animal to isolation stall, check for infection signs, provide cool water, and summon veterinarian.",
        });
      } else if (cow.temperature < this.thresholds.cowTempCriticalLow) {
        this.upsertAlert({
          ruleId: "COW_HYPOTHERMIA_CRITICAL",
          severity: "critical",
          targetType: "cow",
          targetId: cow.id,
          targetName: cow.name,
          metric: "Body Temperature",
          observedValue: cow.temperature,
          thresholdValue: `<${this.thresholds.cowTempCriticalLow}°C`,
          unit: "°C",
          timestamp: nowIso,
          recommendedAction:
            "Hypothermia alert. Provide dry bedding, heat lamp, check for systemic shock or collapse.",
        });
      } else if (cow.temperature > this.thresholds.cowTempWarningHigh) {
        this.upsertAlert({
          ruleId: "COW_TEMP_ELEVATED_WARN",
          severity: "warning",
          targetType: "cow",
          targetId: cow.id,
          targetName: cow.name,
          metric: "Body Temperature",
          observedValue: cow.temperature,
          thresholdValue: `>${this.thresholds.cowTempWarningHigh}°C`,
          unit: "°C",
          timestamp: nowIso,
          recommendedAction:
            "Elevated temperature observed. Monitor rumination rate and physical appetite during next milking.",
        });
      }

      // 2. Collar Battery Alert
      if (cow.battery <= this.thresholds.batteryCritical) {
        this.upsertAlert({
          ruleId: "COLLAR_BATTERY_CRITICAL",
          severity: "critical",
          targetType: "cow",
          targetId: cow.id,
          targetName: cow.name,
          metric: "Collar Battery",
          observedValue: cow.battery,
          thresholdValue: `<=${this.thresholds.batteryCritical}%`,
          unit: "%",
          timestamp: nowIso,
          recommendedAction:
            "Critical collar battery. Telemetry will terminate imminently. Swap collar battery pack immediately.",
        });
      } else if (cow.battery <= this.thresholds.batteryWarning) {
        this.upsertAlert({
          ruleId: "COLLAR_BATTERY_WARN",
          severity: "warning",
          targetType: "cow",
          targetId: cow.id,
          targetName: cow.name,
          metric: "Collar Battery",
          observedValue: cow.battery,
          thresholdValue: `<=${this.thresholds.batteryWarning}%`,
          unit: "%",
          timestamp: nowIso,
          recommendedAction:
            "Low battery. Schedule collar replacement during evening pen rotation.",
        });
      }

      // 3. Stale Sensor / Disconnected Check
      const lastSeenDate = new Date(cow.lastSeen || nowIso);
      const diffSeconds = Math.max(0, (nowDate.getTime() - lastSeenDate.getTime()) / 1000);
      if (diffSeconds > this.thresholds.staleSensorSeconds) {
        this.upsertAlert({
          ruleId: "COW_SENSOR_STALE",
          severity: "warning",
          targetType: "sensor",
          targetId: `COLLAR-${cow.id}`,
          targetName: `${cow.name} Collar Sensor`,
          metric: "Telemetry Freshness",
          observedValue: `${Math.round(diffSeconds / 60)} min silent`,
          thresholdValue: `>${Math.round(this.thresholds.staleSensorSeconds / 60)} min`,
          unit: "time",
          timestamp: nowIso,
          recommendedAction:
            "Collar beacon silent. Check wireless gateway reception, antenna alignment, or physical collar detachment.",
        });
      }

      // 4. Labor Detection
      if (cow.inLabor) {
        this.upsertAlert({
          ruleId: "COW_LABOR_ACTIVE",
          severity: "critical",
          targetType: "cow",
          targetId: cow.id,
          targetName: cow.name,
          metric: "Obstetric Contraction",
          observedValue: "Active labor pattern",
          thresholdValue: "Active Stage 2",
          unit: "state",
          timestamp: nowIso,
          recommendedAction:
            "Active calving in progress. Move to clean maternity pen, observe delivery progression, prepare calf resuscitation equipment.",
        });
      }
    }

    return this.alerts;
  }

  public evaluateBarn(barn: BarnEnvironment, nowIso: string = new Date().toISOString()): SmartMooAlert[] {
    // 1. THI / Heat Stress
    const thi = calculateTHI(barn.ambientTemperature, barn.humidity);
    if (thi >= this.thresholds.barnThiCritical) {
      this.upsertAlert({
        ruleId: "BARN_HEAT_STRESS_CRITICAL",
        severity: "critical",
        targetType: "barn",
        targetId: barn.id,
        targetName: barn.name,
        metric: "Heat Stress THI",
        observedValue: thi,
        thresholdValue: `>=${this.thresholds.barnThiCritical}`,
        unit: "THI",
        timestamp: nowIso,
        recommendedAction:
          "Severe heat stress threshold exceeded. Engage high-velocity misting fans, shade curtains, and increase water station flow.",
      });
    } else if (thi >= this.thresholds.barnThiWarning) {
      this.upsertAlert({
        ruleId: "BARN_HEAT_STRESS_WARN",
        severity: "warning",
        targetType: "barn",
        targetId: barn.id,
        targetName: barn.name,
        metric: "Heat Stress THI",
        observedValue: thi,
        thresholdValue: `>=${this.thresholds.barnThiWarning}`,
        unit: "THI",
        timestamp: nowIso,
        recommendedAction:
          "Moderate heat stress detected. Verify ventilation air flow and check water trough replenishing speed.",
      });
    }

    // 2. Water Availability
    if (barn.waterTroughLevel <= this.thresholds.waterLevelCritical) {
      this.upsertAlert({
        ruleId: "BARN_WATER_CRITICAL",
        severity: "critical",
        targetType: "barn",
        targetId: barn.id,
        targetName: barn.name,
        metric: "Drinking Water Level",
        observedValue: barn.waterTroughLevel,
        thresholdValue: `<=${this.thresholds.waterLevelCritical}%`,
        unit: "%",
        timestamp: nowIso,
        recommendedAction:
          "Critical water deficit. Cattle drinking troughs nearing dry. Inspect solenoid inlet valve and pump supply immediately.",
      });
    } else if (barn.waterTroughLevel <= this.thresholds.waterLevelWarning) {
      this.upsertAlert({
        ruleId: "BARN_WATER_WARN",
        severity: "warning",
        targetType: "barn",
        targetId: barn.id,
        targetName: barn.name,
        metric: "Drinking Water Level",
        observedValue: barn.waterTroughLevel,
        thresholdValue: `<=${this.thresholds.waterLevelWarning}%`,
        unit: "%",
        timestamp: nowIso,
        recommendedAction:
          "Low water trough level. Ensure automated refill supply line is active.",
      });
    }

    // 3. Feed Availability
    if (barn.feedSiloCapacity <= this.thresholds.feedLevelCritical) {
      this.upsertAlert({
        ruleId: "BARN_FEED_CRITICAL",
        severity: "critical",
        targetType: "barn",
        targetId: barn.id,
        targetName: barn.name,
        metric: "Feed Silo Capacity",
        observedValue: barn.feedSiloCapacity,
        thresholdValue: `<=${this.thresholds.feedLevelCritical}%`,
        unit: "%",
        timestamp: nowIso,
        recommendedAction:
          "Feed silo critically low. Dispatch emergency ration distribution and reorder grain delivery.",
      });
    } else if (barn.feedSiloCapacity <= this.thresholds.feedLevelWarning) {
      this.upsertAlert({
        ruleId: "BARN_FEED_WARN",
        severity: "warning",
        targetType: "barn",
        targetId: barn.id,
        targetName: barn.name,
        metric: "Feed Silo Capacity",
        observedValue: barn.feedSiloCapacity,
        thresholdValue: `<=${this.thresholds.feedLevelWarning}%`,
        unit: "%",
        timestamp: nowIso,
        recommendedAction:
          "Feed inventory running low. Plan feed mix bunker restocking.",
      });
    }

    return this.alerts;
  }

  /**
   * Alert deduplication mechanism.
   * If an active or acknowledged alert for (targetId + ruleId) exists, updates it
   * instead of creating a duplicate entry.
   */
  public upsertAlert(alertData: Omit<SmartMooAlert, "id" | "status">): SmartMooAlert {
    const existingIndex = this.alerts.findIndex(
      (a) =>
        a.targetId === alertData.targetId &&
        a.ruleId === alertData.ruleId &&
        (a.status === "active" || a.status === "acknowledged")
    );

    if (existingIndex >= 0) {
      const existing = this.alerts[existingIndex];
      const updated: SmartMooAlert = {
        ...existing,
        observedValue: alertData.observedValue,
        thresholdValue: alertData.thresholdValue,
        timestamp: alertData.timestamp,
        severity: alertData.severity,
        recommendedAction: alertData.recommendedAction,
      };
      this.alerts[existingIndex] = updated;
      return updated;
    }

    const newAlert: SmartMooAlert = {
      ...alertData,
      id: `ALT-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      status: "active",
    };
    this.alerts.unshift(newAlert);
    return newAlert;
  }

  public acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert && alert.status === "active") {
      alert.status = "acknowledged";
      alert.acknowledgedAt = new Date().toISOString();
      return true;
    }
    return false;
  }

  public resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert && alert.status !== "resolved") {
      alert.status = "resolved";
      alert.resolvedAt = new Date().toISOString();
      return true;
    }
    return false;
  }
}
