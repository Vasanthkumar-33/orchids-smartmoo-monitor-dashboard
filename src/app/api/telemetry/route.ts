import { NextRequest, NextResponse } from "next/server";
import { TelemetryReadingSchema } from "@/lib/validations/telemetrySchema";
import { generateSyntheticHistory, INITIAL_BARN_DATA, INITIAL_COWS_DATA } from "@/lib/services/telemetryService";
import { AlertEngine } from "@/lib/services/alertEngine";
import { DEFAULT_THRESHOLDS } from "@/lib/config/thresholds";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const periodParam = searchParams.get("period");
    const period = periodParam === "1h" || periodParam === "7d" ? periodParam : "24h";

    const history = generateSyntheticHistory(period);

    return NextResponse.json({
      success: true,
      demoMode: true,
      period,
      count: history.length,
      currentBarn: INITIAL_BARN_DATA,
      cowsCount: INITIAL_COWS_DATA.length,
      data: history,
      dataSource: "Simulated Demonstration Engine (Circadian Model)",
      disclaimer: "Simulated values for demonstration. Not real hardware telemetry.",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch telemetry" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = TelemetryReadingSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: parseResult.error.format(),
        },
        { status: 400 }
      );
    }

    const validatedData = parseResult.data;

    // Evaluate rules on incoming reading
    const engine = new AlertEngine(DEFAULT_THRESHOLDS);
    // If target is cow and temp is passed, simulate evaluation
    if (validatedData.targetType === "cow" && validatedData.temperature) {
      const mockCow = {
        id: validatedData.targetId,
        name: `Cow ${validatedData.targetId}`,
        status: "Healthy" as const,
        battery: validatedData.battery ?? 80,
        temperature: validatedData.temperature,
        feedingStatus: "Normal",
        movement: validatedData.movement ?? "Normal",
        sleep: "8h",
        immunityScore: 85,
        isPregnant: false,
        inLabor: false,
        ruminationMinutes: validatedData.ruminationMinutes ?? 450,
        lastSeen: validatedData.timestamp,
        sensors: { temp: "ONLINE" as const, motion: "ONLINE" as const, gps: "ONLINE" as const },
        history: [],
      };
      engine.evaluateCows([mockCow]);
    }

    return NextResponse.json({
      success: true,
      message: "Telemetry reading accepted and validated",
      reading: validatedData,
      triggeredAlerts: engine.getActiveAlerts(),
      receivedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Malformed request body" },
      { status: 400 }
    );
  }
}
