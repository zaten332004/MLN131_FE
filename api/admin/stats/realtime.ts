import { json } from "../../_utils";
import { requireAdmin } from "../../_requireAuth";
import { kvCommand } from "../../_kv";

export default async function handler(req: any, res: any) {
  if ((req.method ?? "GET").toUpperCase() !== "GET") {
    res.setHeader("allow", "GET");
    return json(res, 405, { message: "Method not allowed" });
  }

  const admin = await requireAdmin(req, res);
  if (!admin) return;

  const now = Date.now();
  const min = now - 30_000;

  const members = await kvCommand<string[]>("ZRANGEBYSCORE", "presence", min, "+inf");

  const devices = new Set<string>();
  const users = new Set<string>();
  for (const m of members) {
    const [deviceId, , userId] = String(m).split(":");
    if (deviceId) devices.add(deviceId);
    if (userId && userId !== "0") users.add(userId);
  }

  const totalSessions = await kvCommand<number>("ZCARD", "sessions");
  const sessions24h = await kvCommand<number>("ZCOUNT", "sessions", now - 24 * 60 * 60 * 1000, "+inf");

  return json(res, 200, {
    asOf: new Date(now).toISOString(),
    visitorsOnline: devices.size,
    loggedInOnline: users.size,
    distinctUsersAnsweredTotal: 0,
    distinctUsersAnsweredLast24h: 0,
    avgSessionDurationSecondsLast24h: 0,
    totalPageviews: totalSessions,
    pageviewsLast24h: sessions24h,
  });
}

