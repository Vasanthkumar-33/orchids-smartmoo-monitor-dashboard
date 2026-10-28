import type { ThresholdConfig } from "../types.ts";

/**
 * Default demonstration thresholds based on common dairy cattle physiology and environmental comfort metrics.
 * 
 * VETERINARY ADVISORY:
 * Livestock physiological baselines vary by breed, lactation stage, gestation status, ambient climate, and individual animal history.
 * These demonstration values are configurable defaults and must be validated by a licensed veterinarian or qualified dairy domain expert.
 * SmartMoo is a monitoring aid and does NOT provide automated diagnosis or replace physical veterinary assessment.
 */
export const DEFAULT_THRESHOLDS: ThresholdConfig = {
  cowTempWarningLow: 38.0,
  cowTempWarningHigh: 39.3,
  cowTempCriticalLow: 37.5,
  cowTempCriticalHigh: 39.8,
  barnTempWarning: 26.0,
  barnTempCritical: 30.0,
  barnThiWarning: 72.0, // THI > 72 indicates moderate heat stress in dairy cows
  barnThiCritical: 78.0, // THI > 78 indicates severe heat stress
  waterLevelWarning: 35.0, // % of trough capacity
  waterLevelCritical: 20.0,
  feedLevelWarning: 25.0, // % of silo/bunk capacity
  feedLevelCritical: 15.0,
  batteryWarning: 20.0, // %
  batteryCritical: 10.0,
  staleSensorSeconds: 600, // 10 minutes without signal
};

export const VETERINARY_DISCLAIMER =
  "Notice: Livestock-specific thresholds require validation by a qualified veterinarian. SmartMoo is an IoT monitoring system designed for early detection and operational awareness; it does not replace professional veterinary care.";
