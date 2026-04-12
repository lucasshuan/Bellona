import { NextResponse } from "next/server";
import { getGamePageData } from "@/server/db/queries/public";

export async function GET() {
  const data = await getGamePageData("superfighters-deluxe");
  return NextResponse.json({ data });
}
