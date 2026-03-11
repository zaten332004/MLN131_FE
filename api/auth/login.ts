import { json, readJson } from "../_utils";
import { createSession } from "../_sessions";
import { ensureSeedAdmin, getUserByEmail } from "../_users";
import { hashPassword } from "../_crypto";

export default async function handler(req: any, res: any) {
  if ((req.method ?? "GET").toUpperCase() !== "POST") {
    res.setHeader("allow", "POST");
    return json(res, 405, { message: "Method not allowed" });
  }

  await ensureSeedAdmin();

  const body = await readJson(req);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) return json(res, 401, { message: "Email hoặc mật khẩu không đúng." });

  const user = await getUserByEmail(email);
  if (!user) return json(res, 401, { message: "Email hoặc mật khẩu không đúng." });
  if (user.isDisabled) return json(res, 403, { message: "Tài khoản đã bị vô hiệu hoá." });

  const attempted = hashPassword(password, user.passwordSalt);
  if (attempted !== user.passwordHash) return json(res, 401, { message: "Email hoặc mật khẩu không đúng." });

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

