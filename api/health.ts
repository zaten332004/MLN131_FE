export default function handler(_req: any, res: any) {
  const url = (process.env.KV_REST_API_URL ?? "").trim() || (process.env.UPSTASH_REDIS_REST_URL ?? "").trim();
  const token =
    (process.env.KV_REST_API_TOKEN ?? "").trim() || (process.env.UPSTASH_REDIS_REST_TOKEN ?? "").trim();

  const provider = (process.env.KV_REST_API_URL || process.env.KV_REST_API_TOKEN) ? "vercel-kv" : "upstash";

  let kvHost: string | null = null;
  try {
    kvHost = url ? new URL(url).host : null;
  } catch {
    kvHost = null;
  }

  const body = {
    ok: true,
    vercelEnv: process.env.VERCEL_ENV ?? null,
    kvConfigured: Boolean(url && token),
    kvProvider: provider,
    kvHost,
  };

  res.statusCode = 200;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

