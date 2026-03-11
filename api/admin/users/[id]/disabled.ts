import { json, readJson } from "../../../_utils";
import { requireAdmin } from "../../../_requireAuth";
import { patchUser } from "../../../_users";

export default async function handler(req: any, res: any) {
  if ((req.method ?? "GET").toUpperCase() !== "POST") {
    res.setHeader("allow", "POST");
    return json(res, 405, { message: "Method not allowed" });
  }

  const admin = await requireAdmin(req, res);
  if (!admin) return;

  const id = String(req?.query?.id ?? "").trim();
  if (!id) return json(res, 400, { message: "Missing id" });
  if (id === admin.id) return json(res, 400, { message: "Không thể tự vô hiệu hoá chính mình." });

  const body = await readJson(req);
  const disabled = !!body?.disabled;

  const next = await patchUser(id, { isDisabled: disabled });
  if (!next) return json(res, 404, { message: "Không tìm thấy người dùng." });

  return json(res, 200, { ok: true });
}

