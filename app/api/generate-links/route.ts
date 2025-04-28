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

    const templates = guestsData.map((guest) => {
      const link = `${invitationData.web_url}?to=${guest.guest_name}`;

      return `
Yth. Bapak/Ibu/Saudara/i
${guest.guest_name}
di Tempat

Dengan segala kerendahan hati, kami mengundang Bapak/Ibu/Saudara/i dan teman-teman untuk menghadiri acara,

${invitationData.event_title}

Pada:
🗓️ Tanggal: ${formatDate(invitationData.event_date)}
🕛 Pukul: ${invitationData.event_time}
📍 Lokasi: ${invitationData.event_location}

Link undangan bisa diakses lengkap di:
${link}

Merupakan suatu kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan untuk hadir di acara kami
Mohon maaf perihal undangan hanya dibagikan melalui pesan ini
Terima kasih banyak atas perhatiannya

Note:
Untuk mendapatkan hasil yg bagus, harap buka melalui Google Chrome terupdate dan matikan mode gelap dari hp
      `.trim();
    });

    return NextResponse.json({
      message: "Templates generated successfully",
      templates,
    });
  } catch (error) {
    console.error("Generate templates error:", error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}

function formatDate(dateString: string): string {
  const [year, month, day] = dateString.split("-");
  return `${day}-${month}-${year}`;
}
