export function json(res: any, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

export async function readJson(req: any) {
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

export function toBearerToken(req: any) {
  const header = String(req?.headers?.authorization ?? req?.headers?.Authorization ?? "");
  const match = header.match(/^bearer\s+(.+)$/i);
  return match ? match[1].trim() : "";
}

