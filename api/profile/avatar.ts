import { json, readJson } from "../_utils";
import { requireUser } from "../_requireAuth";
import { patchUser } from "../_users";

export default async function handler(req: any, res: any) {
  const method = String(req.method ?? "GET").toUpperCase();
  if (method !== "POST") {
    res.setHeader("allow", "POST");
    return json(res, 405, { message: "Method not allowed" });
  }

  const user = await requireUser(req, res);
  if (!user) return;

  const body = await readJson(req);
  const dataUrl = typeof body?.dataUrl === "string" ? body.dataUrl : "";

  if (!dataUrl.startsWith("data:image/")) {
    return json(res, 400, { message: "File ảnh không hợp lệ." });
  }

  // Keep it small to stay within common KV value limits.
  if (dataUrl.length > 900_000) {
    return json(res, 413, { message: "Ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn." });
  }

  const next = await patchUser(user.id, { avatarUrl: dataUrl });
  if (!next) return json(res, 500, { message: "Cập nhật thất bại." });

  return json(res, 200, {
    id: next.id,
    email: next.email,
    fullName: next.fullName ?? null,
    age: next.age ?? null,
    phoneNumber: next.phoneNumber ?? null,
    avatarUrl: next.avatarUrl ?? null,
    role: next.role,
    roles: [next.role],
    isDisabled: next.isDisabled,
    createdAt: next.createdAt,
    updatedAt: next.updatedAt,
  });
}

