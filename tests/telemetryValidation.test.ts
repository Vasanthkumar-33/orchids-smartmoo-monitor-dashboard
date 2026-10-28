import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  TelemetryReadingSchema,
  AlertActionSchema,
  ThresholdUpdateSchema,
} from "../src/lib/validations/telemetrySchema.ts";

describe("Telemetry & Data Validation Tests", () => {
  test("Valid livestock telemetry passes validation", () => {
    const validPacket = {
      deviceId: "DEV-COLLAR-101",
      targetType: "cow",
      targetId: "COW-101",
      timestamp: new Date().toISOString(),
      temperature: 38.6,
      battery: 88,
      movement: "Normal",
      ruminationMinutes: 480,
    };

    const result = TelemetryReadingSchema.safeParse(validPacket);
    assert.equal(result.success, true);
  });

  test("Valid barn environmental telemetry passes validation", () => {
    const validBarn = {
      deviceId: "DEV-BARN-ENV-01",
      targetType: "barn",
      targetId: "BARN-01",
      timestamp: new Date().toISOString(),
      ambientTemp: 23.4,
      humidity: 62.5,
      waterLevel: 75.0,
      feedLevel: 80.0,
    };

    const result = TelemetryReadingSchema.safeParse(validBarn);
    assert.equal(result.success, true);
  });

  test("Missing deviceId fails validation", () => {
    const invalidPacket = {
      targetType: "cow",
      targetId: "COW-101",
      timestamp: new Date().toISOString(),
      temperature: 38.6,
    };

    const result = TelemetryReadingSchema.safeParse(invalidPacket);
    assert.equal(result.success, false);
    if (!result.success) {
      assert.ok(result.error.issues.some((i) => i.path.includes("deviceId")));
    }
  });

  test("Out of range biologically impossible temperature (95°C) fails validation", () => {
    const invalidTemp = {
      deviceId: "DEV-01",
      targetType: "cow",
      targetId: "COW-101",
      timestamp: new Date().toISOString(),
      temperature: 95.0, // Absurd value
    };

    const result = TelemetryReadingSchema.safeParse(invalidTemp);
    assert.equal(result.success, false);
  });

  test("Alert action validation accepts valid actions and rejects invalid ones", () => {
    const validAck = { alertId: "ALT-123", action: "acknowledge" };
    assert.equal(AlertActionSchema.safeParse(validAck).success, true);

    const validResolve = { alertId: "ALT-123", action: "resolve" };
    assert.equal(AlertActionSchema.safeParse(validResolve).success, true);

    const invalidAction = { alertId: "ALT-123", action: "delete_everything" };
    assert.equal(AlertActionSchema.safeParse(invalidAction).success, false);
  });

  test("Threshold updates validate within safe physiological ranges", () => {
    const validUpdate = {
      cowTempCriticalHigh: 40.0,
      barnThiWarning: 74.0,
      waterLevelCritical: 15.0,
    };
    assert.equal(ThresholdUpdateSchema.safeParse(validUpdate).success, true);

    const invalidUpdate = {
      waterLevelCritical: -50, // Negative percentage impossible
    };
    assert.equal(ThresholdUpdateSchema.safeParse(invalidUpdate).success, false);
  });
});
