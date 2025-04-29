import { GuestData } from "@/app/(types)/guest-data";
import supabase from "@/config/supabase-config";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { invitation_id } = body;

    if (!invitation_id) {
      return NextResponse.json(
        { error: "invitation_id is required" },
        { status: 400 }
      );
    }

    const { data: invitationData, error: invitationError } = await supabase
      .from("invitations")
      .select("*")
      .eq("id", invitation_id)
      .single();

    if (invitationError || !invitationData) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      );
    }

    const { data: guestsData, error: guestsError } = await supabase
      .from("guests")
      .select("id, guest_name")
      .eq("invitation_id", invitation_id);

    if (guestsError || !guestsData || guestsData.length === 0) {
      return NextResponse.json(
        { error: "No guests found for this invitation" },
        { status: 404 }
      );
    }

    const results = guestsData.map((guest) => {
      const sanitizedGuestName = encodeURIComponent(guest.guest_name);
      const link = `${invitationData.web_url}?to=${sanitizedGuestName}`;

      const template = `
Yth. Bapak/Ibu/Saudara/i
${guest.guest_name}
di Tempat

Dengan segala kerendahan hati, kami mengundang Bapak/Ibu/Saudara/i dan teman-teman untuk menghadiri acara,

${invitationData.event_name}

Pada:
🗓️ Tanggal: ${formatDate(invitationData.event_date)}
🕛 Pukul: ${formatTime(invitationData.event_time)} WIB s/d selesai
📍 Lokasi: ${invitationData.location}

Link undangan bisa diakses lengkap di:
${link}

Merupakan suatu kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan untuk hadir di acara kami
Mohon maaf perihal undangan hanya dibagikan melalui pesan ini
Terima kasih banyak atas perhatiannya

catatan:
Untuk mendapatkan hasil yang lebih baik, harap buka melalui browser Google Chrome terbaru dan matikan mode gelap dari smartphone.
                          `;
      return {
        to: guest.guest_name,
        template: template.trim(),
      };
    });

    return NextResponse.json({
      message: "Templates generated successfully",
      data: results,
    });
  } catch (error) {
    console.error("Generate templates error:", error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(timeString: string): string {
  const [hours, minutes] = timeString.split(":");
  return `${hours}:${minutes}`;
}
