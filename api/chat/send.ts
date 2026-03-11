import { json, readJson } from "../_utils";
import { requireUser } from "../_requireAuth";
import { appendChatMessage } from "../_chat";
import { createId } from "../_crypto";
import type { ChatMessage } from "../_models";
import { findFaqAnswer } from "../_faqs";

function pickGeminiText(data: any) {
  const text =
    data?.candidates?.[0]?.content?.parts?.map((p: any) => (typeof p?.text === "string" ? p.text : "")).join("") ?? "";
  return typeof text === "string" ? text : "";
}

export default async function handler(req: any, res: any) {
  const method = String(req.method ?? "GET").toUpperCase();
  if (method !== "POST") {
    res.setHeader("allow", "POST");
    return json(res, 405, { message: "Method not allowed" });
  }

  const user = await requireUser(req, res);
  if (!user) return;

  const payload = await readJson(req);
  const message = typeof payload?.message === "string" ? payload.message.trim() : "";
  if (!message) return json(res, 400, { message: "Missing `message`." });
  if (message.length > 8000) return json(res, 413, { message: "Message too large." });

  const now = new Date().toISOString();
  const userMsg: ChatMessage = { id: createId(), role: "user", content: message, createdAt: now };
  await appendChatMessage(user.id, userMsg);

  const faqAnswer = findFaqAnswer(message).trim();
  if (faqAnswer) {
    const assistantMsg: ChatMessage = {
      id: createId(),
      role: "assistant",
      content: faqAnswer,
      createdAt: new Date().toISOString(),
    };
    await appendChatMessage(user.id, assistantMsg);
    return json(res, 200, { answer: faqAnswer, source: "faq" });
  }

  const apiKey = (process.env.GEMINI_API_KEY ?? "").trim();
  if (!apiKey) {
    return json(res, 501, { message: "Missing server env var GEMINI_API_KEY." });
  }
  const model = (process.env.GEMINI_MODEL ?? "gemini-1.5-flash").trim() || "gemini-1.5-flash";

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model,
  )}:generateContent?key=${encodeURIComponent(apiKey)}`;

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
  if (answer) {
    const assistantMsg: ChatMessage = {
      id: createId(),
      role: "assistant",
      content: answer,
      createdAt: new Date().toISOString(),
    };
    await appendChatMessage(user.id, assistantMsg);
  }

  return json(res, 200, { answer });
}
