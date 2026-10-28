import { z } from "zod";

export const TelemetryReadingSchema = z.object({
  deviceId: z.string().min(1, "Device ID is required"),
  targetType: z.enum(["cow", "barn"]),
  targetId: z.string().min(1, "Target ID is required"),
  timestamp: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}T/)),
  temperature: z.number().min(20).max(55, "Temperature must be between 20°C and 55°C").optional(),
  ambientTemp: z.number().min(-20).max(60, "Barn ambient temp must be between -20°C and 60°C").optional(),
  humidity: z.number().min(0).max(100, "Humidity must be between 0% and 100%").optional(),
  waterLevel: z.number().min(0).max(100, "Water level must be between 0% and 100%").optional(),
  feedLevel: z.number().min(0).max(100, "Feed level must be between 0% and 100%").optional(),
  battery: z.number().min(0).max(100, "Battery level must be between 0% and 100%").optional(),
  movement: z.enum(["High", "Normal", "Low"]).optional(),
  ruminationMinutes: z.number().min(0).max(1440).optional(),
});

export type ValidatedTelemetryReading = z.infer<typeof TelemetryReadingSchema>;

export const AlertActionSchema = z.object({
  alertId: z.string().min(1),
  action: z.enum(["acknowledge", "resolve"]),
  notes: z.string().max(500).optional(),
});

export const ThresholdUpdateSchema = z.object({
  cowTempWarningLow: z.number().min(30).max(42).optional(),
  cowTempWarningHigh: z.number().min(35).max(45).optional(),
  cowTempCriticalLow: z.number().min(25).max(40).optional(),
  cowTempCriticalHigh: z.number().min(38).max(45).optional(),
  barnTempWarning: z.number().min(15).max(45).optional(),
  barnTempCritical: z.number().min(20).max(55).optional(),
  barnThiWarning: z.number().min(50).max(90).optional(),
  barnThiCritical: z.number().min(60).max(95).optional(),
  waterLevelWarning: z.number().min(5).max(60).optional(),
  waterLevelCritical: z.number().min(1).max(40).optional(),
  feedLevelWarning: z.number().min(5).max(60).optional(),
  feedLevelCritical: z.number().min(1).max(40).optional(),
  batteryWarning: z.number().min(5).max(40).optional(),
  batteryCritical: z.number().min(1).max(25).optional(),
  staleSensorSeconds: z.number().min(30).max(86400).optional(),
});
