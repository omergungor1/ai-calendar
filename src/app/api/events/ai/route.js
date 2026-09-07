import { createClient } from "@/lib/supabase/server";
import { EVENT_COLORS } from "@/lib/event-colors";

const COLOR_LIST = EVENT_COLORS.map((color) => color.value).join(", ");

function jsonError(message, status = 400) {
  return Response.json({ error: message }, { status });
}

export async function POST(request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return jsonError("OPENAI_API_KEY tanımlı değil.", 500);
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return jsonError("Oturum gerekli.", 401);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError("Geçersiz istek.");
  }

  const text = String(body.text || "").trim();
  const timeZone =
    String(body.timeZone || "Europe/Istanbul").slice(0, 64) || "Europe/Istanbul";

  if (text.length < 3) {
    return jsonError("Eklemek için biraz daha ayrıntı söyle.");
  }

  const now = new Date();
  const prompt = [
    `Bugünün tarihi (ISO): ${now.toISOString()}`,
    `Kullanıcı saat dilimi: ${timeZone}`,
    "Kullanıcının söylediklerinden TEK bir takvim etkinliği çıkar.",
    "Sadece JSON döndür. Anahtarlar: title, description, starts_at, ends_at, all_day, location, color.",
    "starts_at ve ends_at ISO 8601 olsun.",
    "Saat yoksa all_day true olsun; varsa false ve makul bir bitiş saati seç (varsayılan 1 saat).",
    "Tarih yoksa bugünü veya en yakın mantıklı zamanı kullan.",
    `color şu listeden birini seç: ${COLOR_LIST}`,
    "title kısa ve net olsun. description boş olabilir.",
    "Düzenleme veya silme yapma; sadece yeni etkinlik alanları üret.",
    "",
    `Metin: ${text}`,
  ].join("\n");

  const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Takvim asistanısın. Kullanıcı Türkçe konuşur. Yalnızca yeni etkinlik JSON'u üretirsin.",
        },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!aiResponse.ok) {
    return jsonError("AI şu anda etkinlik oluşturamadı.", 502);
  }

  const aiJson = await aiResponse.json();
  const content = aiJson.choices?.[0]?.message?.content;

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch {
    return jsonError("AI yanıtı okunamadı.", 502);
  }

  const title = String(parsed.title || "").trim();
  const startsAt = new Date(parsed.starts_at);
  const endsAt = new Date(parsed.ends_at);

  if (!title || Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
    return jsonError("Etkinlik bilgisi eksik kaldı. Bir daha dene.");
  }

  if (endsAt < startsAt) {
    endsAt.setTime(startsAt.getTime() + 60 * 60 * 1000);
  }

  const allowedColors = EVENT_COLORS.map((color) => color.value);
  const color = allowedColors.includes(parsed.color)
    ? parsed.color
    : EVENT_COLORS[0].value;

  const { data, error } = await supabase
    .from("events")
    .insert({
      user_id: user.id,
      title,
      description: String(parsed.description || "").trim() || null,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      all_day: Boolean(parsed.all_day),
      location: String(parsed.location || "").trim() || null,
      color,
    })
    .select("*")
    .single();

  if (error) {
    return jsonError(error.message, 400);
  }

  return Response.json({ event: data });
}
