import { NextResponse } from "next/server";
import { INITIAL_COWS_DATA, INITIAL_BARN_DATA } from "@/lib/services/telemetryService";

export async function GET() {
  const collarSensors = INITIAL_COWS_DATA.map((c) => ({
    id: `COLLAR-${c.id}`,
    target: c.name,
    targetId: c.id,
    type: "Wearable Livestock Collar V3.2",
    batteryPercent: c.battery,
    status: c.sensors.gps === "DAMAGED" ? "DEGRADED" : "ONLINE",
    lastHeartbeat: c.lastSeen,
    subsystems: c.sensors,
  }));

  const barnSensors = [
    {
      id: "BARN-SENSOR-ENV-01",
      target: INITIAL_BARN_DATA.name,
      type: "Ambient Temp & RH Sensor",
      status: INITIAL_BARN_DATA.sensorsStatus.tempHumidity,
      lastHeartbeat: INITIAL_BARN_DATA.lastUpdated,
    },
    {
      id: "BARN-SENSOR-WATER-01",
      target: "Automated Water Trough A",
      type: "Ultrasonic Liquid Level Sensor",
      status: INITIAL_BARN_DATA.sensorsStatus.waterLevel,
      lastHeartbeat: INITIAL_BARN_DATA.lastUpdated,
    },
    {
      id: "BARN-SENSOR-FEED-01",
      target: "Main Feed Silo 1",
      type: "Load Cell Weight Matrix",
      status: INITIAL_BARN_DATA.sensorsStatus.feedSilo,
      lastHeartbeat: INITIAL_BARN_DATA.lastUpdated,
    },
  ];

  return NextResponse.json({
    success: true,
    totalSensors: collarSensors.length + barnSensors.length,
    collarSensors,
    barnSensors,
    gatewayStatus: "CONNECTED",
    gatewaySignal: "Strong (RSSI -58 dBm)",
    timestamp: new Date().toISOString(),
  });
}
