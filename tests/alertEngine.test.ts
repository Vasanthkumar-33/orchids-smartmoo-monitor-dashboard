import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { AlertEngine, calculateTHI } from "../src/lib/services/alertEngine.ts";
import { DEFAULT_THRESHOLDS } from "../src/lib/config/thresholds.ts";
import type { Cow, BarnEnvironment } from "../src/lib/types.ts";

describe("AlertEngine & Threshold Evaluation Tests", () => {
  const baseCow: Cow = {
    id: "COW-TEST-1",
    name: "TestCow",
    status: "Healthy",
    battery: 90,
    temperature: 38.6,
    feedingStatus: "Optimal",
    movement: "Normal",
    sleep: "8h",
    immunityScore: 90,
    isPregnant: false,
    inLabor: false,
    ruminationMinutes: 480,
    lastSeen: new Date().toISOString(),
    sensors: { temp: "ONLINE", motion: "ONLINE", gps: "ONLINE" },
    history: [],
  };

  test("Normal temperature produces 0 alerts", () => {
    const engine = new AlertEngine(DEFAULT_THRESHOLDS);
    engine.evaluateCows([baseCow]);
    assert.equal(engine.getActiveAlerts().length, 0);
  });

  test("Elevated temperature (39.5°C) triggers Warning alert", () => {
    const engine = new AlertEngine(DEFAULT_THRESHOLDS);
    const cow = { ...baseCow, temperature: 39.5 };
    engine.evaluateCows([cow]);

    const active = engine.getActiveAlerts();
    assert.equal(active.length, 1);
    assert.equal(active[0].severity, "warning");
    assert.equal(active[0].ruleId, "COW_TEMP_ELEVATED_WARN");
    assert.equal(active[0].observedValue, 39.5);
  });

  test("High fever (40.4°C) triggers Critical alert", () => {
    const engine = new AlertEngine(DEFAULT_THRESHOLDS);
    const cow = { ...baseCow, temperature: 40.4 };
    engine.evaluateCows([cow]);

    const active = engine.getActiveAlerts();
    assert.equal(active.length, 1);
    assert.equal(active[0].severity, "critical");
    assert.equal(active[0].ruleId, "COW_HYPERTHERMIA_CRITICAL");
    assert.match(active[0].recommendedAction, /isolation stall/i);
  });

  test("Hypothermia (37.1°C) triggers Critical alert", () => {
    const engine = new AlertEngine(DEFAULT_THRESHOLDS);
    const cow = { ...baseCow, temperature: 37.1 };
    engine.evaluateCows([cow]);

    const active = engine.getActiveAlerts();
    assert.equal(active.length, 1);
    assert.equal(active[0].severity, "critical");
    assert.equal(active[0].ruleId, "COW_HYPOTHERMIA_CRITICAL");
  });

  test("Critical collar battery (8%) triggers alert", () => {
    const engine = new AlertEngine(DEFAULT_THRESHOLDS);
    const cow = { ...baseCow, battery: 8 };
    engine.evaluateCows([cow]);

    const active = engine.getActiveAlerts();
    assert.equal(active.length, 1);
    assert.equal(active[0].severity, "critical");
    assert.equal(active[0].ruleId, "COLLAR_BATTERY_CRITICAL");
  });

  test("Alert Deduplication: consecutive ticks do not duplicate alerts", () => {
    const engine = new AlertEngine(DEFAULT_THRESHOLDS);
    const feverCow = { ...baseCow, temperature: 40.2 };

    // Tick 1
    engine.evaluateCows([feverCow]);
    assert.equal(engine.getActiveAlerts().length, 1);

    // Tick 2 (temperature rises slightly to 40.3)
    engine.evaluateCows([{ ...feverCow, temperature: 40.3 }]);
    assert.equal(engine.getActiveAlerts().length, 1, "Alert count should still be 1 (deduplicated)");
    assert.equal(engine.getActiveAlerts()[0].observedValue, 40.3, "Observed value should be updated");

    // Tick 3
    engine.evaluateCows([{ ...feverCow, temperature: 40.4 }]);
    assert.equal(engine.getActiveAlerts().length, 1);
    assert.equal(engine.getActiveAlerts()[0].observedValue, 40.4);
  });

  test("Stale sensor detection: beacon silent for > 10 minutes", () => {
    const engine = new AlertEngine(DEFAULT_THRESHOLDS);
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const staleCow = { ...baseCow, lastSeen: fifteenMinutesAgo };

    engine.evaluateCows([staleCow]);
    const staleAlert = engine.getActiveAlerts().find((a) => a.ruleId === "COW_SENSOR_STALE");
    assert.ok(staleAlert, "Should have generated COW_SENSOR_STALE alert");
    assert.equal(staleAlert.targetType, "sensor");
  });

  test("Active labor detection generates critical obstetric alert", () => {
    const engine = new AlertEngine(DEFAULT_THRESHOLDS);
    const laborCow = { ...baseCow, inLabor: true };

    engine.evaluateCows([laborCow]);
    const laborAlert = engine.getActiveAlerts().find((a) => a.ruleId === "COW_LABOR_ACTIVE");
    assert.ok(laborAlert);
    assert.equal(laborAlert.severity, "critical");
  });

  test("Barn THI formula and heat stress evaluation", () => {
    // 25°C at 65% RH
    const thi = calculateTHI(25, 65);
    assert.equal(thi, 73.3);

    const baseBarn: BarnEnvironment = {
      id: "BARN-01",
      name: "Sector Alpha",
      ambientTemperature: 25,
      humidity: 65,
      thi: 73.3,
      waterTroughLevel: 70,
      waterFlowRate: 15,
      feedSiloCapacity: 80,
      feedBunkStatus: "Adequate",
      ventilationActive: true,
      lastUpdated: new Date().toISOString(),
      sensorsStatus: { tempHumidity: "ONLINE", waterLevel: "ONLINE", feedSilo: "ONLINE" },
    };

    const engine = new AlertEngine(DEFAULT_THRESHOLDS);
    engine.evaluateBarn(baseBarn);

    const thiAlert = engine.getActiveAlerts().find((a) => a.ruleId === "BARN_HEAT_STRESS_WARN");
    assert.ok(thiAlert, "THI 73.3 should trigger BARN_HEAT_STRESS_WARN");
  });

  test("Barn water critical deficit (15%) triggers critical alert", () => {
    const baseBarn: BarnEnvironment = {
      id: "BARN-01",
      name: "Sector Alpha",
      ambientTemperature: 21,
      humidity: 55,
      thi: 67.5,
      waterTroughLevel: 15,
      waterFlowRate: 2,
      feedSiloCapacity: 80,
      feedBunkStatus: "Adequate",
      ventilationActive: true,
      lastUpdated: new Date().toISOString(),
      sensorsStatus: { tempHumidity: "ONLINE", waterLevel: "ONLINE", feedSilo: "ONLINE" },
    };

    const engine = new AlertEngine(DEFAULT_THRESHOLDS);
    engine.evaluateBarn(baseBarn);

    const waterAlert = engine.getActiveAlerts().find((a) => a.ruleId === "BARN_WATER_CRITICAL");
    assert.ok(waterAlert);
    assert.equal(waterAlert.severity, "critical");
  });

  test("Alert acknowledgement and resolution lifecycle", () => {
    const engine = new AlertEngine(DEFAULT_THRESHOLDS);
    const cow = { ...baseCow, temperature: 40.5 };
    engine.evaluateCows([cow]);

    const alert = engine.getActiveAlerts()[0];
    assert.equal(alert.status, "active");

    // Acknowledge
    const ackResult = engine.acknowledgeAlert(alert.id);
    assert.equal(ackResult, true);
    assert.equal(engine.getActiveAlerts().length, 0); // No longer active
    assert.equal(engine.getAlerts()[0].status, "acknowledged");
    assert.ok(engine.getAlerts()[0].acknowledgedAt);

    // Resolve
    const resolveResult = engine.resolveAlert(alert.id);
    assert.equal(resolveResult, true);
    assert.equal(engine.getAlerts()[0].status, "resolved");
    assert.ok(engine.getAlerts()[0].resolvedAt);
  });
});
