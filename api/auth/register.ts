import { json, readJson } from "../_utils";
import { createSession } from "../_sessions";
import { createUser, ensureSeedAdmin, getAdminCredentials, getUserByEmail } from "../_users";

export default async function handler(req: any, res: any) {
  if ((req.method ?? "GET").toUpperCase() !== "POST") {
    res.setHeader("allow", "POST");
    return json(res, 405, { message: "Method not allowed" });
  }

  await ensureSeedAdmin();

  const body = await readJson(req);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json(res, 400, { message: "Email không hợp lệ." });
  if (!password || password.length < 6) return json(res, 400, { message: "Mật khẩu phải có ít nhất 6 ký tự." });

  const { email: adminEmail } = getAdminCredentials();
  if (email === adminEmail) return json(res, 409, { message: "Email này đã được dành cho quản trị viên." });

  const existing = await getUserByEmail(email);
  if (existing) return json(res, 409, { message: "Email đã được sử dụng." });

  const user = await createUser({
    email,
    password,
    fullName: typeof body?.fullName === "string" ? body.fullName : undefined,
    age: typeof body?.age === "number" ? body.age : undefined,
    phoneNumber: typeof body?.phoneNumber === "string" ? body.phoneNumber : undefined,
    role: "user",
  });

  const session = await createSession(user.id);

  return json(res, 200, {
    accessToken: session.token,
    expiresAt: session.expiresAt,
    user: {
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
    },
  });
}

