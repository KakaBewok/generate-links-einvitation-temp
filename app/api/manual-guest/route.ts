import db from "@/config/db-config";
import { NextResponse } from "next/server";

// TODO
export async function POST(req: Request) {
  const body = await req.json();

  if (!Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
  }

  const guests = body.map((guest: any) => ({
    name: guest.name,
    invitation_id: guest.invitationId,
  }));

  const { data, error } = await db.from("guests").insert(guests);

  if (error) {
    console.error("Supabase insert error:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan tamu" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, data });
}
