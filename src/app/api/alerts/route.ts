import { NextRequest, NextResponse } from "next/server";
import { AlertActionSchema } from "@/lib/validations/telemetrySchema";
import { INITIAL_ALERTS } from "@/lib/services/telemetryService";
import { VETERINARY_DISCLAIMER } from "@/lib/config/thresholds";

// Server-side in-memory alerts store for API endpoints
let apiAlertsStore = [...INITIAL_ALERTS];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");

    let filtered = apiAlertsStore;
    if (status) {
      filtered = filtered.filter((a) => a.status === status);
    }

    return NextResponse.json({
      success: true,
      total: filtered.length,
      alerts: filtered,
      activeCriticalCount: filtered.filter((a) => a.severity === "critical" && a.status === "active").length,
      activeWarningCount: filtered.filter((a) => a.severity === "warning" && a.status === "active").length,
      disclaimer: VETERINARY_DISCLAIMER,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to retrieve alerts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = AlertActionSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { alertId, action } = parseResult.data;
    const alert = apiAlertsStore.find((a) => a.id === alertId);

    if (!alert) {
      return NextResponse.json(
        { success: false, error: `Alert with ID ${alertId} not found` },
        { status: 404 }
      );
    }

    if (action === "acknowledge") {
      alert.status = "acknowledged";
      alert.acknowledgedAt = new Date().toISOString();
    } else if (action === "resolve") {
      alert.status = "resolved";
      alert.resolvedAt = new Date().toISOString();
    }

    return NextResponse.json({
      success: true,
      message: `Alert ${alertId} marked as ${action}d`,
      alert,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Invalid alert action request" },
      { status: 400 }
    );
  }
}
