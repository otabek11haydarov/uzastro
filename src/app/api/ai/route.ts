import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const maxDuration = 60;

const SYSTEM_PROMPT = `Sen UzAstro platformasining shaxsiy astronomiya yordamchisisan (AI Yordamchi).
Qoidalar:
- Doim o'zbek tilida (lotin yozuvida) javob ber. Xalqaro ilmiy atamalarni (masalan, "exoplanet", "redshift") kerak bo'lsa qavs ichida inglizcha ko'rsat.
- Murakkab mavzularni sodda, tushunarli tilda, misol va o'xshatishlar bilan tushuntir.
- Faqat ilmiy jihatdan to'g'ri ma'lumot ber. Aniq bilmasang yoki ma'lumot o'zgargan bo'lishi mumkin bo'lsa, buni halol ayt va to'qima.
- Foydalanuvchi so'rasa: mini-test tuz (har bir savolda 4 ta variant bo'lsin; to'g'ri javobni foydalanuvchi javob bergunicha ochma). Foydalanuvchi javob berganda tekshir va nima uchun to'g'ri yoki noto'g'ri ekanini tushuntir.
- Kunlik vazifalar bo'yicha yo'l-yo'riq ber, lekin vazifa javoblarini to'g'ridan-to'g'ri aytib berma — o'rganishga yordam ber.
- Astronomiyaga aloqasi yo'q so'rovlarda muloyimlik bilan mavzuga qaytar.
- Javoblar ixcham bo'lsin (odatda 3-8 gap), kerak bo'lsa qisqa ro'yxat ishlat.`;

interface Body {
  conversation_id?: string;
  message?: string;
}

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI hali ulanmagan: serverda ANTHROPIC_API_KEY o‘rnatilmagan." },
      { status: 503 },
    );
  }

  const sb = await getServerSupabase();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "Avval tizimga kiring." }, { status: 401 });

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Noto‘g‘ri so‘rov." }, { status: 400 });
  }
  const message = (body.message ?? "").trim();
  if (!message) return NextResponse.json({ error: "Xabar bo‘sh." }, { status: 400 });
  if (message.length > 2000) return NextResponse.json({ error: "Xabar juda uzun (maksimum 2000 belgi)." }, { status: 400 });

  // Kunlik cheklov: suiiste'moldan himoya
  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const { count } = await sb
    .from("ai_messages")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("role", "user")
    .gte("created_at", since);
  if ((count ?? 0) >= 100) {
    return NextResponse.json({ error: "Kunlik xabarlar limiti (100) tugadi. Ertaga qayta urinib ko‘ring." }, { status: 429 });
  }

  // Suhbat (RLS orqali faqat o'zingizniki)
  let convId = body.conversation_id;
  if (convId) {
    const { data } = await sb.from("ai_conversations").select("id").eq("id", convId).maybeSingle();
    if (!data) return NextResponse.json({ error: "Suhbat topilmadi." }, { status: 404 });
  } else {
    const { data, error } = await sb
      .from("ai_conversations")
      .insert({ user_id: user.id, title: message.slice(0, 48) })
      .select("id")
      .single();
    if (error || !data) return NextResponse.json({ error: "Suhbatni yaratib bo‘lmadi." }, { status: 500 });
    convId = data.id as string;
  }

  const { error: insErr } = await sb.from("ai_messages").insert({ conversation_id: convId, user_id: user.id, role: "user", content: message });
  if (insErr) return NextResponse.json({ error: "Xabarni saqlab bo‘lmadi." }, { status: 500 });

  const { data: hist } = await sb
    .from("ai_messages")
    .select("role, content")
    .eq("conversation_id", convId)
    .order("created_at", { ascending: false })
    .limit(20);
  const messages = ((hist ?? []) as { role: "user" | "assistant"; content: string }[]).reverse();

  let reply = "";
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL || "claude-sonnet-5-5",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages,
      }),
    });
    if (!r.ok) {
      const t = await r.text();
      console.error("Anthropic API xatosi", r.status, t.slice(0, 500));
      return NextResponse.json({ error: "AI hozir javob bera olmadi. Birozdan so‘ng qayta urinib ko‘ring." }, { status: 502 });
    }
    const j = (await r.json()) as { content?: { type: string; text?: string }[] };
    reply = (j.content ?? []).filter((c) => c.type === "text").map((c) => c.text ?? "").join("\n").trim();
  } catch (e) {
    console.error("AI so‘rovi muvaffaqiyatsiz", e);
    return NextResponse.json({ error: "AI bilan aloqa o‘rnatilmadi." }, { status: 502 });
  }
  if (!reply) return NextResponse.json({ error: "AI bo‘sh javob qaytardi." }, { status: 502 });

  await sb.from("ai_messages").insert({ conversation_id: convId, user_id: user.id, role: "assistant", content: reply });
  await sb.from("ai_conversations").update({ updated_at: new Date().toISOString() }).eq("id", convId);

  return NextResponse.json({ conversation_id: convId, reply });
}
