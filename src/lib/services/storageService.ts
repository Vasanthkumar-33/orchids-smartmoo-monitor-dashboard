import { Cow, BarnEnvironment, SmartMooAlert, ThresholdConfig } from "../types";
import { INITIAL_COWS_DATA, INITIAL_BARN_DATA, INITIAL_ALERTS } from "./telemetryService";
import { DEFAULT_THRESHOLDS } from "../config/thresholds";

const STORAGE_KEYS = {
  COWS: "smartmoo_cows_v2",
  BARN: "smartmoo_barn_v2",
  ALERTS: "smartmoo_alerts_v2",
  THRESHOLDS: "smartmoo_thresholds_v2",
  DEMO_MODE: "smartmoo_demo_mode_v2",
};

/**
 * Storage Service:
 * Handles persistence across sessions.
 * 
 * PERSISTENCE DISCLOSURE:
 * In the current Phase 2 prototype, persistence is maintained client-side via Web Storage (localStorage)
 * with graceful in-memory fallbacks when localStorage is inaccessible (e.g. during SSR or in private mode).
 * A dedicated LibSQL / PostgreSQL database will be wired up during Phase 3.
 */
export class StorageService {
  private static isBrowser(): boolean {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
  }

  public static loadCows(): Cow[] {
    if (!this.isBrowser()) return INITIAL_COWS_DATA;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEYS.COWS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((c: any) => {
            const base = INITIAL_COWS_DATA.find((b) => b.id === c.id) || INITIAL_COWS_DATA[0];
            return {
              ...base,
              ...c,
              sensors: { ...base.sensors, ...(c.sensors || {}) },
              history: Array.isArray(c.history) ? c.history : base.history,
              ruminationMinutes: c.ruminationMinutes ?? base.ruminationMinutes ?? 450,
            };
          });
        }
      }
    } catch (e) {
      console.warn("StorageService: Failed to read cows from localStorage, falling back to defaults", e);
    }
    return INITIAL_COWS_DATA;
  }

  public static saveCows(cows: Cow[]): void {
    if (!this.isBrowser()) return;
    try {
      window.localStorage.setItem(STORAGE_KEYS.COWS, JSON.stringify(cows));
    } catch (e) {
      console.error("StorageService: Failed to write cows to localStorage", e);
    }
  }

  public static loadBarn(): BarnEnvironment {
    if (!this.isBrowser()) return INITIAL_BARN_DATA;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEYS.BARN);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn("StorageService: Failed to read barn data from localStorage", e);
    }
    return INITIAL_BARN_DATA;
  }

  public static saveBarn(barn: BarnEnvironment): void {
    if (!this.isBrowser()) return;
    try {
      window.localStorage.setItem(STORAGE_KEYS.BARN, JSON.stringify(barn));
    } catch (e) {
      console.error("StorageService: Failed to write barn data to localStorage", e);
    }
  }

  public static loadAlerts(): SmartMooAlert[] {
    if (!this.isBrowser()) return INITIAL_ALERTS;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEYS.ALERTS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn("StorageService: Failed to read alerts from localStorage", e);
    }
    return INITIAL_ALERTS;
  }

  public static saveAlerts(alerts: SmartMooAlert[]): void {
    if (!this.isBrowser()) return;
    try {
      window.localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
    } catch (e) {
      console.error("StorageService: Failed to write alerts to localStorage", e);
    }
  }

  public static loadThresholds(): ThresholdConfig {
    if (!this.isBrowser()) return DEFAULT_THRESHOLDS;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEYS.THRESHOLDS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn("StorageService: Failed to read thresholds from localStorage", e);
    }
    return DEFAULT_THRESHOLDS;
  }

  public static saveThresholds(thresholds: ThresholdConfig): void {
    if (!this.isBrowser()) return;
    try {
      window.localStorage.setItem(STORAGE_KEYS.THRESHOLDS, JSON.stringify(thresholds));
    } catch (e) {
      console.error("StorageService: Failed to write thresholds to localStorage", e);
    }
  }

  public static loadDemoMode(): boolean {
    if (!this.isBrowser()) return true; // Demo mode enabled by default
    try {
      const stored = window.localStorage.getItem(STORAGE_KEYS.DEMO_MODE);
      if (stored !== null) return stored === "true";
    } catch (e) {
      // fallback
    }
    return true;
  }

  public static saveDemoMode(active: boolean): void {
    if (!this.isBrowser()) return;
    try {
      window.localStorage.setItem(STORAGE_KEYS.DEMO_MODE, active ? "true" : "false");
    } catch (e) {
      // fallback
    }
  }

  public static resetToDefaults(): void {
    if (!this.isBrowser()) return;
    try {
      window.localStorage.removeItem(STORAGE_KEYS.COWS);
      window.localStorage.removeItem(STORAGE_KEYS.BARN);
      window.localStorage.removeItem(STORAGE_KEYS.ALERTS);
      window.localStorage.removeItem(STORAGE_KEYS.THRESHOLDS);
      window.localStorage.removeItem(STORAGE_KEYS.DEMO_MODE);
    } catch (e) {
      // fallback
    }
  }
}
