import { json, toBearerToken } from "./_utils";
import { ensureSeedAdmin, getUserById } from "./_users";
import { getSessionUserId } from "./_sessions";

export async function requireUser(req: any, res: any) {
  await ensureSeedAdmin();
  const token = toBearerToken(req);
  if (!token) {
    json(res, 401, { message: "Unauthorized" });
    return null;
  }
  const userId = await getSessionUserId(token);
  if (!userId) {
    json(res, 401, { message: "Unauthorized" });
    return null;
  }
  const user = await getUserById(userId);
  if (!user) {
    json(res, 401, { message: "Unauthorized" });
    return null;
  }
  if (user.isDisabled) {
    json(res, 403, { message: "User disabled" });
    return null;
  }
  return user;
}

export async function requireAdmin(req: any, res: any) {
  const user = await requireUser(req, res);
  if (!user) return null;
  if (user.role !== "admin") {
    json(res, 403, { message: "Forbidden" });
    return null;
  }
  return user;
}

