import db from "@/config/db-config";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ invitation_id: string }> }
) {
  const { invitation_id } = await params;

  try {
    const { data, error } = await db
      .from("guests")
      .select("*")
      .eq("invitation_id", invitation_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
