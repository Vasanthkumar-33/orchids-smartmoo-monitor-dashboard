import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { AnalyticsService } from "../src/lib/services/analyticsService.ts";
import type { TelemetryPoint, SmartMooAlert } from "../src/lib/types.ts";

describe("Analytics & Calculations Tests", () => {
  const samplePoints: TelemetryPoint[] = [
    {
      timestamp: "2026-10-28T00:00:00Z",
      cowTemp: 38.4,
      ambientTemp: 20.0,
      humidity: 60.0,
      thi: 66.5,
      waterLevel: 80,
      feedLevel: 85,
      ruminationMin: 30,
      activityScore: 40,
    },
    {
      timestamp: "2026-10-28T06:00:00Z",
      cowTemp: 38.6,
      ambientTemp: 22.0,
      humidity: 65.0,
      thi: 73.0,
      waterLevel: 75,
      feedLevel: 75,
      ruminationMin: 35,
      activityScore: 55,
    },
    {
      timestamp: "2026-10-28T12:00:00Z",
      cowTemp: 39.8, // Spike
      ambientTemp: 28.0,
      humidity: 70.0,
      thi: 78.4, // Heat stress
      waterLevel: 30, // Depleted
      feedLevel: 60,
      ruminationMin: 15,
      activityScore: 70,
    },
  ];

  const sampleAlerts: SmartMooAlert[] = [
    {
      id: "A1",
      ruleId: "R1",
      severity: "critical",
      targetType: "cow",
      targetId: "C1",
      targetName: "Bella",
      metric: "Temp",
      observedValue: 39.8,
      thresholdValue: ">39.8",
      unit: "°C",
      timestamp: "2026-10-28T12:00:00Z",
      status: "active",
      recommendedAction: "Cool animal",
    },
    {
      id: "A2",
      ruleId: "R2",
      severity: "warning",
      targetType: "barn",
      targetId: "B1",
      targetName: "Barn A",
      metric: "Water",
      observedValue: 30,
      thresholdValue: "<=35",
      unit: "%",
      timestamp: "2026-10-28T12:00:00Z",
      status: "active",
      recommendedAction: "Refill water",
    },
  ];

  test("Computes correct min, max, and average values", () => {
    const summary = AnalyticsService.computeSummary(samplePoints, sampleAlerts, "24h");

    assert.equal(summary.minCowTemp, 38.4);
    assert.equal(summary.maxCowTemp, 39.8);
    // (38.4 + 38.6 + 39.8) / 3 = 116.8 / 3 = 38.93 -> 38.9
    assert.equal(summary.avgCowTemp, 38.9);

    assert.equal(summary.totalAlerts, 2);
    assert.equal(summary.activeCritical, 1);
    assert.equal(summary.activeWarning, 1);
  });

  test("Generates traceable actionable recommendations based on observed metrics", () => {
    const summary = AnalyticsService.computeSummary(samplePoints, sampleAlerts, "24h");

    // THI 78.4 spike should trigger heat mitigation recommendation
    const heatRec = summary.recommendations.find((r) => r.id === "REC-THI-HEAT");
    assert.ok(heatRec, "Should generate THI heat stress recommendation");
    assert.equal(heatRec.priority, "medium");

    // Water level 30% should trigger water inspection recommendation
    const waterRec = summary.recommendations.find((r) => r.id === "REC-WATER-DEPLETION");
    assert.ok(waterRec, "Should generate water trough recommendation");

    // Max cow temp 39.8°C should trigger targeted screening recommendation
    const feverRec = summary.recommendations.find((r) => r.id === "REC-HERD-FEVER");
    assert.ok(feverRec, "Should generate livestock screening recommendation");
  });

  test("Trend calculation accurately determines delta and direction", () => {
    const upTrend = AnalyticsService.calculateTrend(26, 20);
    assert.equal(upTrend.isUp, true);
    assert.equal(upTrend.delta, 30.0);

    const downTrend = AnalyticsService.calculateTrend(18, 20);
    assert.equal(downTrend.isUp, false);
    assert.equal(downTrend.delta, 10.0);
  });
});
