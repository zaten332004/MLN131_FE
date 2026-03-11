import { json, readJson } from "../_utils";
import { kvCommand } from "../_kv";
import { ensureSeedAdmin } from "../_users";

const SESSION_GAP_MS = 30 * 60 * 1000;

export default async function handler(req: any, res: any) {
  if ((req.method ?? "GET").toUpperCase() !== "POST") {
    res.setHeader("allow", "POST");
    return json(res, 405, { message: "Method not allowed" });
  }

  await ensureSeedAdmin();

  const body = await readJson(req);
  const deviceId = typeof body?.deviceId === "string" ? body.deviceId.trim() : "";
  if (!deviceId) return json(res, 200, { ok: true });

  const now = Date.now();

  const lastRaw = await kvCommand<string | null>("GET", `device:lastSeen:${deviceId}`);
  const last = lastRaw ? Number(lastRaw) : NaN;
  const isNewSession = !Number.isFinite(last) || now - last > SESSION_GAP_MS;

  if (isNewSession) {
    await kvCommand("ZADD", "sessions", now, `${deviceId}:${now}`);
    // keep 30 days
    await kvCommand("ZREMRANGEBYSCORE", "sessions", "-inf", now - 30 * 24 * 60 * 60 * 1000);
  }

  await kvCommand("SETEX", `device:lastSeen:${deviceId}`, 2 * 24 * 60 * 60, String(now));

  return json(res, 200, { ok: true, isNewSession });
}

