import db from "@/config/db-config";
import { formatDate, formatTime } from "@/lib/utils";
import Data, { Guest } from "@/types/data";
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

    const { data: invitationData, error: invitationError } = await db
      .from("invitations")
      .select(
        `
        *,
        themes (*),
        music (*),
        videos (*),
        images (*),
        gift_infos (*),
        rundowns (*),
        guests (*),
        stories (*),
        rsvps (*)
      `
      )
      .eq("id", invitation_id)
      .single();

    if (invitationError || !invitationData) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      );
    }

    const data: Data = invitationData;
    const results = data?.guests?.map((guest) => {
      return createTemplateMessage(data, guest);
    });

    return NextResponse.json({
      message: "Templates generated successfully",
      data: results,
    });
  } catch (error) {
    console.error("Generate templates error: ", error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}

const createTemplateMessage = (data: Data, guest: Guest) => {
  const sanitizedGuestName = encodeURIComponent(guest.name).replace(
    /%20/g,
    "+"
  );
  const link = `${data.web_url}/${data.slug}?to=${sanitizedGuestName}`;

  const template = `
Yth. Bapak/Ibu/Saudara/i
${guest.name}
di Tempat

Dengan segala kerendahan hati, kami mengundang Bapak/Ibu/Saudara/i dan teman-teman untuk menghadiri acara

${data.event_title}

Pada:
🗓️ Tanggal  : ${formatDate(data.event_date)}
🕛 Pukul    : ${formatTime(data.rundowns?.[0].start_time || null)} ${
    data.rundowns?.[0].time_zone
  } s/d selesai
📍 Lokasi   : ${data.rundowns?.[0].location}

Undangan lengkap bisa diakses di link berikut:
${link}

Merupakan suatu kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan untuk hadir di acara kami
Mohon maaf perihal undangan hanya dibagikan melalui pesan ini

Terima kasih banyak atas perhatiannya 💕

                          `;

  return {
    to: guest.name,
    template: template.trim(),
  };
};
