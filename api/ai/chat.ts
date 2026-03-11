function json(res: any, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

async function readJson(req: any) {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function pickGeminiText(data: any) {
  const text =
    data?.candidates?.[0]?.content?.parts?.map((p: any) => (typeof p?.text === "string" ? p.text : "")).join("") ??
    "";
  return typeof text === "string" ? text : "";
}

export default async function handler(req: any, res: any) {
  if ((req.method ?? "GET").toUpperCase() !== "POST") {
    res.setHeader("allow", "POST");
    return json(res, 405, { message: "Method not allowed" });
  }

  const apiKey = (process.env.GEMINI_API_KEY ?? "").trim();
  if (!apiKey) {
    return json(res, 501, { message: "Missing server env var GEMINI_API_KEY." });
  }

  const model = (process.env.GEMINI_MODEL ?? "gemini-1.5-flash").trim() || "gemini-1.5-flash";

  const payload = await readJson(req);
  const message = typeof payload?.message === "string" ? payload.message.trim() : "";

  if (!message) {
    return json(res, 400, { message: "Missing `message`." });
  }

  if (message.length > 8000) {
    return json(res, 413, { message: "Message too large." });
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const upstream = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: message }] }],
      generationConfig: { temperature: 0.4 },
    }),
  });

  const data = await upstream.json().catch(() => null);
  if (!upstream.ok) {
    return json(res, upstream.status, { message: "Gemini request failed.", details: data });
  }

  const answer = pickGeminiText(data).trim();
  return json(res, 200, { answer });
}

