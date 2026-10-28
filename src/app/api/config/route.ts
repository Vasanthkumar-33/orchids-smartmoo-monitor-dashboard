import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_THRESHOLDS, VETERINARY_DISCLAIMER } from "@/lib/config/thresholds";
import { ThresholdUpdateSchema } from "@/lib/validations/telemetrySchema";

let apiThresholds = { ...DEFAULT_THRESHOLDS };

export async function GET() {
  return NextResponse.json({
    success: true,
    thresholds: apiThresholds,
    disclaimer: VETERINARY_DISCLAIMER,
    timestamp: new Date().toISOString(),
  });
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = ThresholdUpdateSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parseResult.error.format() },
        { status: 400 }
      );
    }

    apiThresholds = {
      ...apiThresholds,
      ...parseResult.data,
    };

    return NextResponse.json({
      success: true,
      message: "Threshold configuration updated",
      thresholds: apiThresholds,
      disclaimer: VETERINARY_DISCLAIMER,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Invalid update request" },
      { status: 400 }
    );
  }
}
