import { json, readJson } from "../_utils";
import { kvCommand } from "../_kv";
import { ensureSeedAdmin } from "../_users";

export default async function handler(req: any, res: any) {
  if ((req.method ?? "GET").toUpperCase() !== "POST") {
    res.setHeader("allow", "POST");
    return json(res, 405, { message: "Method not allowed" });
  }

  await ensureSeedAdmin();

  const body = await readJson(req);
  const deviceId = typeof body?.deviceId === "string" ? body.deviceId.trim() : "";
  const tabId = typeof body?.tabId === "string" ? body.tabId.trim() : "";
  const userId = typeof body?.userId === "string" ? body.userId.trim() : "";

  if (!deviceId || !tabId) {
    return json(res, 200, { ok: true });
  }

  const members = userId
    ? [`${deviceId}:${tabId}:${userId}`, `${deviceId}:${tabId}:0`]
    : [`${deviceId}:${tabId}:0`];

  await kvCommand("ZREM", "presence", ...members);

  return json(res, 200, { ok: true });
}

