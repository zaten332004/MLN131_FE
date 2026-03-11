import { json, readJson } from "../_utils";
import { requireUser } from "../_requireAuth";
import { getUserByEmail, patchUser } from "../_users";

function toProfile(u: any) {
  return {
    id: u.id,
    email: u.email,
    fullName: u.fullName ?? null,
    age: u.age ?? null,
    phoneNumber: u.phoneNumber ?? null,
    avatarUrl: u.avatarUrl ?? null,
    role: u.role,
    roles: [u.role],
    isDisabled: u.isDisabled,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  };
}

export default async function handler(req: any, res: any) {
  const method = String(req.method ?? "GET").toUpperCase();
  if (method !== "GET" && method !== "PUT") {
    res.setHeader("allow", "GET, PUT");
    return json(res, 405, { message: "Method not allowed" });
  }

  const user = await requireUser(req, res);
  if (!user) return;

  if (method === "GET") {
    return json(res, 200, toProfile(user));
  }

  const body = await readJson(req);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : undefined;
  const fullName =
    typeof body?.fullName === "string" ? (body.fullName.trim() ? body.fullName.trim() : null) : undefined;
  const phoneNumber =
    typeof body?.phoneNumber === "string"
      ? body.phoneNumber.trim()
        ? body.phoneNumber.trim()
        : null
      : undefined;

  const age =
    body?.age === null ? null : typeof body?.age === "number" && Number.isFinite(body.age) ? body.age : undefined;
  if (typeof age === "number" && age < 0) {
    return json(res, 400, { message: "Tuổi không hợp lệ." });
  }

  if (email && email !== String(user.email ?? "").toLowerCase()) {
    const existing = await getUserByEmail(email);
    if (existing && existing.id !== user.id) {
      return json(res, 409, { message: "Email đã được sử dụng." });
    }
  }

  const next = await patchUser(user.id, {
    ...(email ? { email } : {}),
    ...(fullName !== undefined ? { fullName } : {}),
    ...(phoneNumber !== undefined ? { phoneNumber } : {}),
    ...(age !== undefined ? { age } : {}),
  });

  if (!next) {
    return json(res, 500, { message: "Cập nhật thất bại." });
  }

  return json(res, 200, toProfile(next));
}

