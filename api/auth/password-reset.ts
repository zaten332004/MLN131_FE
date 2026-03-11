import { json, readJson } from "../_utils";
import { ensureSeedAdmin, getUserByEmail, patchUser } from "../_users";
import { createSalt, hashPassword } from "../_crypto";
import { kvCommand } from "../_kv";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function randomCode() {
  return String(Math.floor(Math.random() * 1_000_000)).padStart(6, "0");
}

export default async function handler(req: any, res: any) {
  const method = (req.method ?? "GET").toUpperCase();
  if (method !== "POST") {
    res.setHeader("allow", "POST");
    return json(res, 405, { message: "Method not allowed" });
  }

  await ensureSeedAdmin();

  const body = await readJson(req);
  const action = typeof body?.action === "string" ? body.action : "";

  if (action === "request") {
    const email = typeof body?.email === "string" ? normalizeEmail(body.email) : "";
    if (!email) return json(res, 200, { ok: true });

    const user = await getUserByEmail(email);
    if (!user) return json(res, 200, { ok: true });

    const code = randomCode();
    const expiresAt = Date.now() + 10 * 60 * 1000;
    await kvCommand("SETEX", `pwdreset:${email}`, 10 * 60, JSON.stringify({ code, expiresAt }));
    // Demo: return code so UI can show it.
    return json(res, 200, { ok: true, resetCode: code, expiresAt });
  }

  if (action === "reset") {
    const email = typeof body?.email === "string" ? normalizeEmail(body.email) : "";
    const code = typeof body?.code === "string" ? body.code.trim() : "";
    const newPassword = typeof body?.newPassword === "string" ? body.newPassword : "";
    if (!email || !code || !newPassword) return json(res, 400, { message: "Thiếu thông tin." });
    if (newPassword.length < 6) return json(res, 400, { message: "Mật khẩu phải có ít nhất 6 ký tự." });

    const raw = await kvCommand<string | null>("GET", `pwdreset:${email}`);
    if (!raw) return json(res, 400, { message: "Yêu cầu đặt lại mật khẩu không hợp lệ." });
    let parsed: any = null;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // ignore
    }
    if (!parsed?.code || parsed.code !== code) return json(res, 400, { message: "Mã xác nhận không đúng." });
    if (Date.now() > Number(parsed.expiresAt ?? 0)) return json(res, 400, { message: "Mã xác nhận đã hết hạn." });

    const user = await getUserByEmail(email);
    if (!user) return json(res, 404, { message: "Không tìm thấy người dùng." });
    if (user.isDisabled) return json(res, 403, { message: "Tài khoản đã bị vô hiệu hoá." });

    const salt = createSalt();
    const passwordHash = hashPassword(newPassword, salt);
    await patchUser(user.id, { passwordSalt: salt, passwordHash });
    await kvCommand("DEL", `pwdreset:${email}`);
    return json(res, 200, { ok: true });
  }

  return json(res, 400, { message: "Action không hợp lệ." });
}

