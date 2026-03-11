import { json } from "../../_utils";
import { requireAdmin } from "../../_requireAuth";
import { listAllUsers } from "../../_users";

export default async function handler(req: any, res: any) {
  if ((req.method ?? "GET").toUpperCase() !== "GET") {
    res.setHeader("allow", "GET");
    return json(res, 405, { message: "Method not allowed" });
  }

  const admin = await requireAdmin(req, res);
  if (!admin) return;

  const q = typeof req?.query?.q === "string" ? req.query.q.trim().toLowerCase() : "";
  const users = await listAllUsers();
  const filtered = q
    ? users.filter((u) => (u.email ?? "").toLowerCase().includes(q) || (u.fullName ?? "").toLowerCase().includes(q))
    : users;

  return json(
    res,
    200,
    filtered.map((u) => ({
      id: u.id,
      email: u.email,
      fullName: u.fullName ?? null,
      age: u.age ?? null,
      phoneNumber: u.phoneNumber ?? null,
      avatarUrl: u.avatarUrl ?? null,
      isDisabled: u.isDisabled,
      roles: [u.role],
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    })),
  );
}

