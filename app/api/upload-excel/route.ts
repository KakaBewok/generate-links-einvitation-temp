import db from "@/config/db-config";
import { Guest } from "@/types/data";
import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

// disable automatic body parsing for this route
// because we are using formData to upload a file
export const config = {
  api: {
    bodyParser: false,
  },
};

// --- Helper functions ---
async function parseExcelFile(file: File): Promise<Guest[]> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json<Guest>(sheet);
  return data;
}

// Function to validate the guest data
// to ensure all required fields are present
function validateGuestData(item: Guest): boolean {
  return !!(item.invitation_id && item.name);
}

async function findInvitationId(invitationId: number): Promise<number> {
  const { data, error } = await db
    .from("invitations")
    .select("id")
    .eq("id", invitationId)
    .single();

  if (error || !data) {
    throw new Error(`Invitation not found for id: ${invitationId}`);
  }

  return data.id;
}

// Function to upsert guest data into the database
const upsertGuestsToDB = async (guests: Guest[]) => {
  const { data, error } = await db.from("guests").upsert(guests);
  if (error) {
    console.error("Error saving guest data to database:", error.message);
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

    const guests: Guest[] = [];

    for (const item of data) {
      if (!validateGuestData(item)) {
        continue;
      }

      const invitationId = await findInvitationId(item.invitation_id);

      guests.push({
        name: item.name,
        invitation_id: invitationId,
      });
    }

    const insertedGuests = await upsertGuestsToDB(guests);

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
