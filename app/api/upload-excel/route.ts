import supabase from "@/config/supabase-config";
import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

export const config = {
  api: {
    bodyParser: false, // Disable Next.js body parser untuk file upload
  },
};

interface GuestData {
  id: string;
  name: string;
  phone_number: string;
  address: string;
  invitation_id: string;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No valid file uploaded" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "buffer" });

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json<GuestData>(sheet);
    console.log("Parsed Excel Data:", data);

    const guests = [];

    for (const item of data) {
      if (
        !item["invitation_id"] ||
        !item["name"] ||
        !item["phone_number"] ||
        !item["address"]
      ) {
        continue;
      }

      const { data: invitationData, error: invitationError } = await supabase
        .from("invitations")
        .select("id")
        .eq("id", item["invitation_id"])
        .single();

      if (invitationError) {
        return NextResponse.json(
          {
            error: "Invitation not found for id: " + item["invitation_id"],
          },
          { status: 400 }
        );
      }

      guests.push({
        guest_name: item["name"],
        phone_number: item["phone_number"],
        address: item["address"],
        invitation_id: invitationData.id,
      });
    }

    // Menyimpan data tamu ke tabel guests
    const { data: insertedGuests, error: guestError } = await supabase
      .from("guests")
      .upsert(guests);

    if (guestError) {
      console.error("Supabase upsert error:", guestError);
      return NextResponse.json(
        { error: guestError.message || "Error saving guest data to database" },
        { status: 500 }
      );
    }

    console.log("Results Excel Data:", insertedGuests);

    return NextResponse.json({
      message: "File uploaded and guest data saved successfully",
      data: insertedGuests,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Error processing file" },
      { status: 500 }
    );
  }
}
