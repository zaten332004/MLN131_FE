import { json } from "../_utils";
import { requireUser } from "../_requireAuth";

export default async function handler(req: any, res: any) {
  if ((req.method ?? "GET").toUpperCase() !== "GET") {
    res.setHeader("allow", "GET");
    return json(res, 405, { message: "Method not allowed" });
  }

  const user = await requireUser(req, res);
  if (!user) return;

  return json(res, 200, {
    id: user.id,
    email: user.email,
    fullName: user.fullName ?? null,
    age: user.age ?? null,
    phoneNumber: user.phoneNumber ?? null,
    avatarUrl: user.avatarUrl ?? null,
    role: user.role,
    roles: [user.role],
    isDisabled: user.isDisabled,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  });
}

