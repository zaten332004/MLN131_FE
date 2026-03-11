import * as crypto from "node:crypto";

type Role = "admin" | "user" | "viewer";
type ChatRole = "user" | "assistant";

type KvUser = {
  id: string;
  email: string;
  fullName?: string | null;
  age?: number | null;
  phoneNumber?: string | null;
  avatarUrl?: string | null;
  role: Role;
  isDisabled: boolean;
  createdAt: string;
  updatedAt: string;
  passwordSalt: string;
  passwordHash: string;
};

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
};

function json(res: any, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

async function readJson(req: any) {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function toBearerToken(req: any) {
  const header = String(req?.headers?.authorization ?? req?.headers?.Authorization ?? "");
  const match = header.match(/^bearer\s+(.+)$/i);
  return match ? match[1].trim() : "";
}

type KvConfig = { url: string; token: string };

function getKvConfig(): KvConfig | null {
  const url = (process.env.KV_REST_API_URL ?? "").trim() || (process.env.UPSTASH_REDIS_REST_URL ?? "").trim();
  const token = (process.env.KV_REST_API_TOKEN ?? "").trim() || (process.env.UPSTASH_REDIS_REST_TOKEN ?? "").trim();
  if (!url || !token) return null;
  return { url, token };
}

async function kvCommand<T = unknown>(...args: Array<string | number>) {
  const cfg = getKvConfig();
  if (!cfg) {
    const err = new Error("KV not configured");
    (err as any).code = "KV_NOT_CONFIGURED";
    throw err;
  }

  const resp = await fetch(cfg.url, {
    method: "POST",
    headers: {
      authorization: `Bearer ${cfg.token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(args),
  });

  const data = await resp.json().catch(() => null);
  if (!resp.ok) {
    const err = new Error(`KV command failed (${resp.status})`);
    (err as any).status = resp.status;
    (err as any).details = data;
    throw err;
  }

  return (data?.result ?? null) as T;
}

function createId() {
  return typeof crypto.randomUUID === "function" ? crypto.randomUUID() : crypto.randomBytes(16).toString("hex");
}

function createSalt(bytes = 16) {
  return crypto.randomBytes(bytes).toString("hex");
}

function sha256Hex(input: string) {
  return crypto.createHash("sha256").update(input, "utf8").digest("hex");
}

function hashPassword(password: string, salt: string) {
  return sha256Hex(`${salt}:${password}`);
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function getAdminCredentials() {
  const email = normalizeEmail(process.env.ADMIN_EMAIL ?? "admin@mln131.local");
  const password = String(process.env.ADMIN_PASSWORD ?? "Admin@123456");
  return { email, password };
}

async function getUserById(id: string): Promise<KvUser | null> {
  const raw = await kvCommand<string | null>("GET", `user:${id}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as KvUser;
  } catch {
    return null;
  }
}

async function getUserByEmail(email: string): Promise<KvUser | null> {
  const id = await kvCommand<string | null>("GET", `userByEmail:${normalizeEmail(email)}`);
  if (!id) return null;
  return getUserById(id);
}

async function saveUser(user: KvUser) {
  await kvCommand("SET", `user:${user.id}`, JSON.stringify(user));
  await kvCommand("SET", `userByEmail:${normalizeEmail(user.email)}`, user.id);
  await kvCommand("SADD", "users", user.id);
  return user;
}

async function ensureSeedAdmin(): Promise<KvUser> {
  const { email, password } = getAdminCredentials();
  const existing = await getUserByEmail(email);
  if (existing) {
    if (existing.role !== "admin") {
      const now = new Date().toISOString();
      await saveUser({ ...existing, role: "admin", updatedAt: now });
      return (await getUserByEmail(email)) as KvUser;
    }
    return existing;
  }

  const now = new Date().toISOString();
  const salt = createSalt();
  const user: KvUser = {
    id: createId(),
    email,
    fullName: "Administrator",
    age: null,
    phoneNumber: null,
    avatarUrl: null,
    role: "admin",
    isDisabled: false,
    createdAt: now,
    updatedAt: now,
    passwordSalt: salt,
    passwordHash: hashPassword(password, salt),
  };
  await saveUser(user);
  return user;
}

async function listAllUsers(): Promise<KvUser[]> {
  const ids = await kvCommand<string[]>("SMEMBERS", "users");
  const keys = ids.map((id) => `user:${id}`);
  const raws = keys.length ? await kvCommand<Array<string | null>>("MGET", ...keys) : [];
  const users: KvUser[] = [];
  for (const raw of raws) {
    if (!raw) continue;
    try {
      const u = JSON.parse(raw) as KvUser;
      if (u && typeof u.id === "string" && typeof u.email === "string") {
        users.push(u);
      }
    } catch {
      // ignore
    }
  }
  return users;
}

async function patchUser(id: string, patch: Partial<Omit<KvUser, "id" | "createdAt">>) {
  const existing = await getUserById(id);
  if (!existing) return null;
  const now = new Date().toISOString();

  const nextEmail = typeof (patch as any)?.email === "string" ? normalizeEmail(String((patch as any).email)) : null;
  if (nextEmail && normalizeEmail(existing.email) !== nextEmail) {
    await kvCommand("DEL", `userByEmail:${normalizeEmail(existing.email)}`);
  }

  const next: KvUser = {
    ...existing,
    ...patch,
    ...(nextEmail ? { email: nextEmail } : {}),
    updatedAt: now,
  };
  await saveUser(next);
  return next;
}

async function createUser(params: { email: string; password: string; fullName?: string; age?: number; phoneNumber?: string }) {
  const now = new Date().toISOString();
  const salt = createSalt();
  const user: KvUser = {
    id: createId(),
    email: normalizeEmail(params.email),
    fullName: params.fullName?.trim() || null,
    age: params.age ?? null,
    phoneNumber: params.phoneNumber?.trim() || null,
    avatarUrl: null,
    role: "user",
    isDisabled: false,
    createdAt: now,
    updatedAt: now,
    passwordSalt: salt,
    passwordHash: hashPassword(params.password, salt),
  };
  await saveUser(user);
  return user;
}

type Session = { token: string; userId: string; expiresAt: string };
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;

async function createSession(userId: string): Promise<Session> {
  const token = createId();
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000).toISOString();
  await kvCommand("SETEX", `session:${token}`, SESSION_TTL_SECONDS, userId);
  return { token, userId, expiresAt };
}

async function getSessionUserId(token: string) {
  return await kvCommand<string | null>("GET", `session:${token}`);
}

async function requireUser(req: any, res: any) {
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

async function requireAdmin(req: any, res: any) {
  const user = await requireUser(req, res);
  if (!user) return null;
  if (user.role !== "admin") {
    json(res, 403, { message: "Forbidden" });
    return null;
  }
  return user;
}

function toProfile(u: KvUser) {
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

function normalize(text: string) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\\u0300-\\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/\\s+/g, " ")
    .trim();
}

const FAQS: Array<{ keys: string[]; answer: string }> = [
  {
    keys: ["khai niem co cau xa hoi", "co cau xa hoi la gi"],
    answer:
      "Theo quan điểm của chủ nghĩa Mác – Lênin, cơ cấu xã hội là tổng thể các cộng đồng người (giai cấp, tầng lớp, nhóm xã hội) cùng với toàn bộ các mối quan hệ xã hội giữa những cộng đồng đó trong một hình thái kinh tế – xã hội nhất định. Cơ cấu xã hội phản ánh mối quan hệ biện chứng giữa cơ sở hạ tầng (quan hệ sản xuất) và kiến trúc thượng tầng (chính trị, pháp luật, ý thức hệ, văn hoá).",
  },
  {
    keys: ["khai niem co cau xa hoi - giai cap", "co cau xa hoi giai cap la gi"],
    answer:
      "Cơ cấu xã hội – giai cấp là hệ thống các giai cấp và tầng lớp xã hội tồn tại khách quan trong một chế độ xã hội nhất định. Nó được xác định thông qua các quan hệ về sở hữu tư liệu sản xuất, vai trò trong tổ chức/quản lý quá trình sản xuất và địa vị chính trị – xã hội.",
  },
  {
    keys: ["vi tri cua co cau xa hoi - giai cap", "vai tro cua co cau xa hoi - giai cap"],
    answer:
      "Cơ cấu xã hội – giai cấp giữ vai trò trung tâm và có ý nghĩa quyết định trong hệ thống các loại hình cơ cấu xã hội. Vì nó hình thành trực tiếp từ quan hệ sản xuất và gắn chặt với các vấn đề về nhà nước, quyền sở hữu, tổ chức lao động và phân phối thu nhập.",
  },
  {
    keys: ["bien doi co tinh quy luat", "quy luat bien doi"],
    answer:
      "Trong thời kỳ quá độ, cơ cấu xã hội – giai cấp biến đổi theo các quy luật cơ bản: gắn liền với cơ cấu kinh tế; ngày càng phức tạp, đa dạng, xuất hiện tầng lớp xã hội mới; và biến đổi trong mối quan hệ vừa đấu tranh vừa liên minh, từng bước xoá bỏ bất bình đẳng xã hội.",
  },
  {
    keys: ["lien minh giai cap, tang lop la gi", "khai niem lien minh"],
    answer:
      "Liên minh giai cấp, tầng lớp là sự liên kết, hợp tác và hỗ trợ lẫn nhau giữa các giai cấp, tầng lớp nhằm thực hiện lợi ích chính đáng và tạo động lực thực hiện thắng lợi mục tiêu xây dựng CNXH. Hạt nhân là liên minh công nhân – nông dân – trí thức do Đảng lãnh đạo.",
  },
];

const FAQS_V2: Array<{ keys: string[]; answer: string }> = [
  {
    keys: ["khai niem co cau xa hoi", "co cau xa hoi la gi"],
    answer:
      "Theo quan điểm của chủ nghĩa Mác - Lênin, cơ cấu xã hội là tổng thể các cộng đồng người (giai cấp, tầng lớp, nhóm xã hội) cùng với toàn bộ các mối quan hệ xã hội giữa những cộng đồng đó trong một hình thái kinh tế - xã hội nhất định. Cơ cấu xã hội phản ánh mối quan hệ biện chứng giữa cơ sở hạ tầng (quan hệ sản xuất) và kiến trúc thượng tầng (chính trị, pháp luật, ý thức hệ, văn hóa).",
  },
  {
    keys: ["co cau xa hoi - giai cap", "khai niem co cau xa hoi giai cap", "co cau xa hoi giai cap la gi"],
    answer:
      "Cơ cấu xã hội - giai cấp là hệ thống các giai cấp và tầng lớp xã hội tồn tại khách quan trong một chế độ xã hội nhất định; được xác định thông qua các quan hệ về sở hữu tư liệu sản xuất, vai trò trong tổ chức/quản lý quá trình sản xuất và địa vị chính trị - xã hội.",
  },
  {
    keys: ["vi tri", "vai tro", "vi tri cua co cau xa hoi - giai cap", "vai tro cua co cau xa hoi - giai cap"],
    answer:
      "Cơ cấu xã hội - giai cấp giữ vai trò trung tâm và có ý nghĩa quyết định trong hệ thống các loại hình cơ cấu xã hội khác vì nó hình thành trực tiếp từ quan hệ sản xuất và gắn chặt với các vấn đề nhà nước, quyền sở hữu tư liệu sản xuất, tổ chức lao động và phân phối thu nhập.",
  },
  {
    keys: ["bien doi", "quy luat bien doi", "bien doi co tinh quy luat"],
    answer:
      "Trong thời kỳ quá độ, cơ cấu xã hội - giai cấp biến đổi theo các quy luật cơ bản: gắn liền và chịu sự quy định của cơ cấu kinh tế; diễn biến phức tạp, đa dạng, xuất hiện các tầng lớp xã hội mới; và biến đổi trong mối quan hệ vừa đấu tranh, vừa liên minh, từng bước xóa bỏ bất bình đẳng xã hội.",
  },
  {
    keys: ["lien minh", "khai niem lien minh", "lien minh giai cap", "lien minh giai cap tang lop"],
    answer:
      "Liên minh giai cấp, tầng lớp trong thời kỳ quá độ lên chủ nghĩa xã hội là sự liên kết, hợp tác và hỗ trợ lẫn nhau giữa các giai cấp, tầng lớp xã hội nhằm thực hiện lợi ích chính đáng của các chủ thể trong khối liên minh và tạo động lực thực hiện thắng lợi mục tiêu xây dựng chủ nghĩa xã hội. Hạt nhân là liên minh công nhân - nông dân - trí thức do Đảng lãnh đạo.",
  },
];

function findFaqAnswer(text: string) {
  const n = normalize(text);
  if (!n) return "";

  let bestAnswer = "";
  let bestLen = 0;

  for (const faq of FAQS_V2) {
    for (const key of faq.keys) {
      const k = normalize(key);
      if (!k) continue;
      if (n.includes(k) && k.length > bestLen) {
        bestLen = k.length;
        bestAnswer = faq.answer;
      }
    }
  }
  return bestAnswer;
}

function pickGeminiText(data: any) {
  const text =
    data?.candidates?.[0]?.content?.parts?.map((p: any) => (typeof p?.text === "string" ? p.text : "")).join("") ?? "";
  return typeof text === "string" ? text : "";
}

async function appendChatMessage(userId: string, message: ChatMessage) {
  await kvCommand("RPUSH", `chat:${userId}`, JSON.stringify(message));
  await kvCommand("LTRIM", `chat:${userId}`, -1000, -1);
}

async function getChatMessagesNewestFirst(userId: string, page: number, pageSize: number) {
  const normalizedPage = Math.max(1, Math.floor(page));
  const normalizedSize = Math.max(1, Math.min(200, Math.floor(pageSize)));

  const total = await kvCommand<number>("LLEN", `chat:${userId}`);
  if (!total) {
    return { page: normalizedPage, pageSize: normalizedSize, total: 0, items: [] as ChatMessage[] };
  }

  const stop = total - (normalizedPage - 1) * normalizedSize - 1;
  const start = Math.max(0, total - normalizedPage * normalizedSize);
  if (stop < 0 || start > stop) {
    return { page: normalizedPage, pageSize: normalizedSize, total, items: [] as ChatMessage[] };
  }

  const raws = await kvCommand<string[]>("LRANGE", `chat:${userId}`, start, stop);
  const parsed: ChatMessage[] = [];
  for (const raw of raws) {
    if (!raw) continue;
    try {
      const msg = JSON.parse(raw) as ChatMessage;
      if (msg && typeof msg.id === "string" && typeof msg.content === "string" && typeof msg.createdAt === "string") {
        parsed.push(msg);
      }
    } catch {
      // ignore
    }
  }
  parsed.reverse();
  return { page: normalizedPage, pageSize: normalizedSize, total, items: parsed };
}

function getPathSegments(req: any): string[] {
  const raw = req?.query?.path;
  if (Array.isArray(raw)) {
    return raw
      .flatMap((s) => String(s).split("/"))
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (typeof raw === "string" && raw) {
    return raw
      .split("/")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  const url = String(req?.url ?? "/");
  const pathname = url.split("?")[0] || "/";
  return pathname.replace(/^\/api\/?/, "").split("/").filter(Boolean);
}

export default async function handler(req: any, res: any) {
  const segments = getPathSegments(req);
  const method = String(req?.method ?? "GET").toUpperCase();

  try {
    if (segments[0] === "health") {
      const cfg = getKvConfig();
      const body = {
        ok: true,
        vercelEnv: process.env.VERCEL_ENV ?? null,
        kvConfigured: Boolean(cfg?.url && cfg?.token),
        geminiConfigured: Boolean(String(process.env.GEMINI_API_KEY ?? "").trim()),
        geminiModel: (process.env.GEMINI_MODEL ?? "gemini-1.5-flash").trim() || "gemini-1.5-flash",
        kvHost: cfg?.url
          ? (() => {
              try {
                return new URL(cfg.url).host;
              } catch {
                return null;
              }
            })()
          : null,
      };
      return json(res, 200, body);
    }

    if (segments[0] === "uploads") {
      return json(res, 404, { message: "Uploads are not configured for this deployment." });
    }

    if (segments[0] === "auth" && segments[1] === "register" && method === "POST") {
      await ensureSeedAdmin();
      const body = await readJson(req);
      const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
      const password = typeof body?.password === "string" ? body.password : "";
      const fullName = typeof body?.fullName === "string" ? body.fullName.trim() : "";
      if (!email || !password) return json(res, 400, { message: "Missing email/password." });
      if (await getUserByEmail(email)) return json(res, 409, { message: "Email đã được sử dụng." });
      const user = await createUser({ email, password, fullName: fullName || undefined });
      const session = await createSession(user.id);
      return json(res, 200, { accessToken: session.token, expiresAt: session.expiresAt, user: toProfile(user) });
    }

    if (segments[0] === "auth" && segments[1] === "login" && method === "POST") {
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
      return json(res, 200, { accessToken: session.token, expiresAt: session.expiresAt, user: toProfile(user) });
    }

    if (segments[0] === "auth" && segments[1] === "me" && method === "GET") {
      const user = await requireUser(req, res);
      if (!user) return;
      return json(res, 200, toProfile(user));
    }

    if (segments[0] === "auth" && segments[1] === "password-reset" && method === "POST") {
      await ensureSeedAdmin();
      const body = await readJson(req);
      const action = typeof body?.action === "string" ? body.action : "";
      const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
      if (!email) return json(res, 400, { message: "Missing email." });
      const user = await getUserByEmail(email);
      if (!user) return json(res, 200, { ok: true });

      if (action === "request") {
        const code = crypto.randomInt(100000, 999999).toString();
        const expiresAt = Date.now() + 10 * 60 * 1000;
        await kvCommand("SETEX", `pwdreset:${email}`, 10 * 60, JSON.stringify({ code, expiresAt }));
        return json(res, 200, { ok: true, resetCode: code, expiresAt });
      }

      if (action === "reset") {
        const code = typeof body?.code === "string" ? body.code.trim() : "";
        const newPassword = typeof body?.newPassword === "string" ? body.newPassword : "";
        if (!code || !newPassword) return json(res, 400, { message: "Missing code/newPassword." });

        const raw = await kvCommand<string | null>("GET", `pwdreset:${email}`);
        if (!raw) return json(res, 400, { message: "Mã không hợp lệ hoặc đã hết hạn." });
        let parsed: any = null;
        try {
          parsed = JSON.parse(raw);
        } catch {
          parsed = null;
        }
        if (!parsed || parsed.code !== code || Date.now() > Number(parsed.expiresAt || 0)) {
          return json(res, 400, { message: "Mã không hợp lệ hoặc đã hết hạn." });
        }

        const salt = createSalt();
        await patchUser(user.id, { passwordSalt: salt, passwordHash: hashPassword(newPassword, salt) });
        await kvCommand("DEL", `pwdreset:${email}`);
        return json(res, 200, { ok: true });
      }

      return json(res, 400, { message: "Invalid action." });
    }

    if (segments[0] === "presence" && segments[1] === "ping" && method === "POST") {
      await ensureSeedAdmin();
      const body = await readJson(req);
      const deviceId = typeof body?.deviceId === "string" ? body.deviceId.trim() : "";
      const tabId = typeof body?.tabId === "string" ? body.tabId.trim() : "";
      const userId = typeof body?.userId === "string" ? body.userId.trim() : "";
      if (!deviceId || !tabId) return json(res, 200, { ok: true });
      const now = Date.now();
      await kvCommand("ZADD", "presence", now, `${deviceId}:${tabId}:${userId || 0}`);
      await kvCommand("ZREMRANGEBYSCORE", "presence", "-inf", now - 5 * 60 * 1000);
      return json(res, 200, { ok: true });
    }

    if (segments[0] === "presence" && segments[1] === "leave" && method === "POST") {
      await ensureSeedAdmin();
      const body = await readJson(req);
      const deviceId = typeof body?.deviceId === "string" ? body.deviceId.trim() : "";
      const tabId = typeof body?.tabId === "string" ? body.tabId.trim() : "";
      const userId = typeof body?.userId === "string" ? body.userId.trim() : "";
      if (!deviceId || !tabId) return json(res, 200, { ok: true });
      await kvCommand("ZREM", "presence", `${deviceId}:${tabId}:${userId || 0}`);
      return json(res, 200, { ok: true });
    }

    if (segments[0] === "track" && segments[1] === "pageview" && method === "POST") {
      await ensureSeedAdmin();
      const body = await readJson(req);
      const deviceId = typeof body?.deviceId === "string" ? body.deviceId.trim() : "";
      if (!deviceId) return json(res, 200, { ok: true });

      const now = Date.now();
      const lastRaw = await kvCommand<string | null>("GET", `device:lastSeen:${deviceId}`);
      const last = lastRaw ? Number(lastRaw) : NaN;
      const isNewSession = !Number.isFinite(last) || now - last > 30 * 60 * 1000;

      if (isNewSession) {
        await kvCommand("ZADD", "sessions", now, `${deviceId}:${now}`);
        await kvCommand("ZREMRANGEBYSCORE", "sessions", "-inf", now - 30 * 24 * 60 * 60 * 1000);
      }

      await kvCommand("SETEX", `device:lastSeen:${deviceId}`, 2 * 24 * 60 * 60, String(now));
      return json(res, 200, { ok: true, isNewSession });
    }

    if (segments[0] === "admin" && segments[1] === "stats" && segments[2] === "realtime" && method === "GET") {
      const admin = await requireAdmin(req, res);
      if (!admin) return;

      const now = Date.now();
      const min = now - 30_000;
      const members = await kvCommand<string[]>("ZRANGEBYSCORE", "presence", min, "+inf");

      const devices = new Set<string>();
      const users = new Set<string>();
      for (const m of members) {
        const [deviceId, , userId] = String(m).split(":");
        if (deviceId) devices.add(deviceId);
        if (userId && userId !== "0") users.add(userId);
      }

      const totalSessions = await kvCommand<number>("ZCARD", "sessions");
      const sessions24h = await kvCommand<number>("ZCOUNT", "sessions", now - 24 * 60 * 60 * 1000, "+inf");

      return json(res, 200, {
        asOf: new Date(now).toISOString(),
        visitorsOnline: devices.size,
        loggedInOnline: users.size,
        distinctUsersAnsweredTotal: 0,
        distinctUsersAnsweredLast24h: 0,
        avgSessionDurationSecondsLast24h: 0,
        totalPageviews: totalSessions,
        pageviewsLast24h: sessions24h,
      });
    }

    if (segments[0] === "admin" && segments[1] === "users" && segments.length === 2 && method === "GET") {
      const admin = await requireAdmin(req, res);
      if (!admin) return;

      const q = typeof req?.query?.q === "string" ? req.query.q.trim().toLowerCase() : "";
      const users = await listAllUsers();
      const filtered = q
        ? users.filter((u) => (u.email ?? "").toLowerCase().includes(q) || (u.fullName ?? "").toLowerCase().includes(q))
        : users;

      return json(res, 200, filtered.map((u) => ({ ...toProfile(u), roles: [u.role] })));
    }

    if (segments[0] === "admin" && segments[1] === "users" && segments[3] === "disabled" && method === "POST") {
      const admin = await requireAdmin(req, res);
      if (!admin) return;

      const id = String(segments[2] ?? "").trim();
      if (!id) return json(res, 400, { message: "Missing id" });
      if (id === admin.id) return json(res, 400, { message: "Không thể tự vô hiệu hoá chính mình." });

      const body = await readJson(req);
      const disabled = !!body?.disabled;
      const next = await patchUser(id, { isDisabled: disabled });
      if (!next) return json(res, 404, { message: "Không tìm thấy người dùng." });
      return json(res, 200, { ok: true });
    }

    if (segments[0] === "profile" && segments.length === 1 && method === "GET") {
      const user = await requireUser(req, res);
      if (!user) return;
      return json(res, 200, toProfile(user));
    }

    if (segments[0] === "profile" && segments.length === 1 && method === "PUT") {
      const user = await requireUser(req, res);
      if (!user) return;

      const body = await readJson(req);
      const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : undefined;
      const fullName = typeof body?.fullName === "string" ? (body.fullName.trim() ? body.fullName.trim() : null) : undefined;
      const phoneNumber =
        typeof body?.phoneNumber === "string" ? (body.phoneNumber.trim() ? body.phoneNumber.trim() : null) : undefined;
      const age = body?.age === null ? null : typeof body?.age === "number" && Number.isFinite(body.age) ? body.age : undefined;
      if (typeof age === "number" && age < 0) return json(res, 400, { message: "Tuổi không hợp lệ." });

      if (email && email !== String(user.email ?? "").toLowerCase()) {
        const existing = await getUserByEmail(email);
        if (existing && existing.id !== user.id) return json(res, 409, { message: "Email đã được sử dụng." });
      }

      const next = await patchUser(user.id, {
        ...(email ? { email } : {}),
        ...(fullName !== undefined ? { fullName } : {}),
        ...(phoneNumber !== undefined ? { phoneNumber } : {}),
        ...(age !== undefined ? { age } : {}),
      });

      if (!next) return json(res, 500, { message: "Cập nhật thất bại." });
      return json(res, 200, toProfile(next));
    }

    if (segments[0] === "profile" && segments[1] === "avatar" && method === "POST") {
      const user = await requireUser(req, res);
      if (!user) return;

      const body = await readJson(req);
      const dataUrl = typeof body?.dataUrl === "string" ? body.dataUrl : "";
      if (!dataUrl.startsWith("data:image/")) return json(res, 400, { message: "File ảnh không hợp lệ." });
      if (dataUrl.length > 900_000) return json(res, 413, { message: "Ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn." });

      const next = await patchUser(user.id, { avatarUrl: dataUrl });
      if (!next) return json(res, 500, { message: "Cập nhật thất bại." });
      return json(res, 200, toProfile(next));
    }

    if (segments[0] === "chat" && segments[1] === "history" && method === "GET") {
      const user = await requireUser(req, res);
      if (!user) return;

      const page = typeof req?.query?.page === "string" ? Number(req.query.page) : 1;
      const pageSize = typeof req?.query?.pageSize === "string" ? Number(req.query.pageSize) : 50;
      const data = await getChatMessagesNewestFirst(user.id, page, pageSize);
      return json(res, 200, data);
    }

    if (segments[0] === "chat" && segments[1] === "send" && method === "POST") {
      const user = await requireUser(req, res);
      if (!user) return;

      const payload = await readJson(req);
      const message = typeof payload?.message === "string" ? payload.message.trim() : "";
      if (!message) return json(res, 400, { message: "Missing `message`." });
      if (message.length > 8000) return json(res, 413, { message: "Message too large." });

      const userMsg: ChatMessage = { id: createId(), role: "user", content: message, createdAt: new Date().toISOString() };
      await appendChatMessage(user.id, userMsg);

      const faqAnswer = findFaqAnswer(message).trim();
      if (faqAnswer) {
        const assistantMsg: ChatMessage = {
          id: createId(),
          role: "assistant",
          content: faqAnswer,
          createdAt: new Date().toISOString(),
        };
        await appendChatMessage(user.id, assistantMsg);
        return json(res, 200, { answer: faqAnswer, source: "faq" });
      }

      const apiKey = (process.env.GEMINI_API_KEY ?? "").trim();
      if (!apiKey) return json(res, 501, { message: "Missing server env var GEMINI_API_KEY." });
      const model = (process.env.GEMINI_MODEL ?? "gemini-1.5-flash").trim() || "gemini-1.5-flash";

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
        model,
      )}:generateContent?key=${encodeURIComponent(apiKey)}`;

      const upstream = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: message }] }],
          generationConfig: { temperature: 0.4 },
        }),
      });

      const data = await upstream.json().catch(() => null);
      if (!upstream.ok) return json(res, upstream.status, { message: "Gemini request failed.", details: data });

      const answer = pickGeminiText(data).trim();
      if (answer) {
        const assistantMsg: ChatMessage = {
          id: createId(),
          role: "assistant",
          content: answer,
          createdAt: new Date().toISOString(),
        };
        await appendChatMessage(user.id, assistantMsg);
      }
      return json(res, 200, { answer });
    }

    if (segments[0] === "ai" && segments[1] === "chat" && method === "POST") {
      const apiKey = (process.env.GEMINI_API_KEY ?? "").trim();
      if (!apiKey) return json(res, 501, { message: "Missing server env var GEMINI_API_KEY." });
      const model = (process.env.GEMINI_MODEL ?? "gemini-1.5-flash").trim() || "gemini-1.5-flash";

      const payload = await readJson(req);
      const message = typeof payload?.message === "string" ? payload.message.trim() : "";
      if (!message) return json(res, 400, { message: "Missing `message`." });
      if (message.length > 8000) return json(res, 413, { message: "Message too large." });

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
        model,
      )}:generateContent?key=${encodeURIComponent(apiKey)}`;

      const upstream = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: message }] }],
          generationConfig: { temperature: 0.4 },
        }),
      });

      const data = await upstream.json().catch(() => null);
      if (!upstream.ok) return json(res, upstream.status, { message: "Gemini request failed.", details: data });
      const answer = pickGeminiText(data).trim();
      return json(res, 200, { answer });
    }

    return json(res, 404, { message: "Not found." });
  } catch (err: any) {
    if (String(err?.code ?? "") === "KV_NOT_CONFIGURED") {
      return json(res, 501, {
        message: "KV not configured. Set KV_REST_API_URL + KV_REST_API_TOKEN (or UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN).",
      });
    }
    return json(res, 500, { message: "Server error", detail: String(err?.message ?? err) });
  }
}
