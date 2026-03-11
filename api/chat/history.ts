import { json } from "../_utils";
import { requireUser } from "../_requireAuth";
import { getChatMessagesNewestFirst } from "../_chat";

export default async function handler(req: any, res: any) {
  const method = String(req.method ?? "GET").toUpperCase();
  if (method !== "GET") {
    res.setHeader("allow", "GET");
    return json(res, 405, { message: "Method not allowed" });
  }

  const user = await requireUser(req, res);
  if (!user) return;

  const pageRaw = req?.query?.page;
  const pageSizeRaw = req?.query?.pageSize;

  const page = typeof pageRaw === "string" ? Number(pageRaw) : 1;
  const pageSize = typeof pageSizeRaw === "string" ? Number(pageSizeRaw) : 50;

  const data = await getChatMessagesNewestFirst(user.id, page, pageSize);
  return json(res, 200, data);
}

