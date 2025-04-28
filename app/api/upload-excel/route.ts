import supabase from "@/config/supabase-config";
import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

// disable automatic body parsing for this route
// because we are using formData to upload a file
export const config = {
  api: {
    bodyParser: false,
  },
};

// Define the interface for the guest data
// that will be extracted from the Excel file
interface GuestData {
  id: string;
  name: string;
  phone_number: string;
  address: string;
  invitation_id: string;
}

// --- Helper functions ---
async function parseExcelFile(file: File): Promise<GuestData[]> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json<GuestData>(sheet);
  return data;
}

// Function to validate the guest data
// to ensure all required fields are present
function validateGuestData(item: GuestData): boolean {
  return !!(
    item.invitation_id &&
    item.name &&
    item.phone_number &&
    item.address
  );
}

async function findInvitationId(invitationId: string): Promise<string> {
  const { data, error } = await supabase
    .from("invitations")
    .select("id")
    .eq("id", invitationId)
    .single();

  if (error || !data) {
    throw new Error(`Invitation not found for id: ${invitationId}`);
  }

  return data.id;
}

//sampe sini
const upsertGuestsToDB = async (guests: any[]) => {
  const { data, error } = await supabase.from("guests").upsert(guests);
  if (error) {
    throw new Error(error.message || "Error saving guest data to database");
  }
  return data;
};

// --- Main Handler ---
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

    const data = await parseExcelFile(file);
    console.log("Parsed Excel Data:", data);

    const guests = [];

    for (const item of data) {
      if (!validateGuestData(item)) {
        continue;
      }

      const invitationId = await findInvitationId(item.invitation_id);

      guests.push({
        guest_name: item.name,
        phone_number: item.phone_number,
        address: item.address,
        invitation_id: invitationId,
      });
    }

    const insertedGuests = await upsertGuestsToDB(guests);

    console.log("Results Excel Data:", insertedGuests);

    return NextResponse.json({
      message: "File uploaded and guest data saved successfully",
      data: insertedGuests,
    });
  } catch (err: any) {
    console.error("Error processing file:", err.message);
    return NextResponse.json(
      { error: err.message || "Error processing file" },
      { status: 500 }
    );
  }
}
