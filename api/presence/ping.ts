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
    return json(res, 400, { message: "Missing deviceId/tabId" });
  }

  const now = Date.now();
  const member = `${deviceId}:${tabId}:${userId || "0"}`;

  await kvCommand("ZADD", "presence", now, member);
  await kvCommand("ZREMRANGEBYSCORE", "presence", "-inf", now - 30_000);

  return json(res, 200, { ok: true });
}

