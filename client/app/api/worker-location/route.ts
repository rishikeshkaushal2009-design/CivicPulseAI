import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type WorkerLocation = {
  complaintId: string;
  latitude: number;
  longitude: number;
  timestamp: string;
};

const locations = new Map<string, WorkerLocation>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { complaintId, latitude, longitude } = body;

    if (
      !complaintId ||
      typeof latitude !== "number" ||
      typeof longitude !== "number"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid location data",
        },
        { status: 400 }
      );
    }

    const location: WorkerLocation = {
      complaintId,
      latitude,
      longitude,
      timestamp: new Date().toISOString(),
    };

    locations.set(complaintId, location);

    return NextResponse.json({
      success: true,
      message: "Worker location updated",
      location,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid request",
      },
      { status: 400 }
    );
  }
}

export async function GET(request: NextRequest) {
  const complaintId = request.nextUrl.searchParams.get("complaintId");

  if (!complaintId) {
    return NextResponse.json(
      {
        success: false,
        message: "complaintId is required",
      },
      { status: 400 }
    );
  }

  const location = locations.get(complaintId);

  if (!location) {
    return NextResponse.json({
      success: true,
      location: null,
    });
  }

  return NextResponse.json({
    success: true,
    location,
  });
}