import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    name: "enyo",
    status: "ok",
    timestamp: new Date().toISOString(),
  });
}
