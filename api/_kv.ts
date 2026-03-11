type KvConfig = { url: string; token: string };

function getKvConfig(): KvConfig | null {
  const url =
    (process.env.KV_REST_API_URL ?? "").trim() ||
    (process.env.UPSTASH_REDIS_REST_URL ?? "").trim();
  const token =
    (process.env.KV_REST_API_TOKEN ?? "").trim() ||
    (process.env.UPSTASH_REDIS_REST_TOKEN ?? "").trim();

  if (!url || !token) return null;
  return { url, token };
}

export async function kvCommand<T = unknown>(...args: Array<string | number>) {
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

