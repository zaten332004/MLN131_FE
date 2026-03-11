function getBackendOrigin() {
  const raw = (process.env.BACKEND_ORIGIN ?? "").trim();
  return raw.replace(/\/+$/, "");
}

function toSingleHeaderValue(value: string | string[] | undefined) {
  if (!value) return undefined;
  return Array.isArray(value) ? value.join(",") : value;
}

function copyRequestHeaders(req: any) {
  const headers = new Headers();
  const source = req?.headers ?? {};

  for (const [key, value] of Object.entries(source)) {
    const normalizedKey = String(key).toLowerCase();
    if (normalizedKey === "host" || normalizedKey === "connection" || normalizedKey === "content-length") {
      continue;
    }
    if (normalizedKey === "accept-encoding") {
      continue;
    }

    const single = toSingleHeaderValue(value as any);
    if (single !== undefined) {
      headers.set(normalizedKey, single);
    }
  }

  // ngrok (free) sometimes shows an interstitial warning page for browser-like traffic.
  headers.set("ngrok-skip-browser-warning", "true");

  // Preserve original host/proto context for apps sitting behind reverse proxies.
  const host = toSingleHeaderValue(source.host);
  if (host) {
    headers.set("x-forwarded-host", host);
  }
  const forwardedProto = toSingleHeaderValue(source["x-forwarded-proto"]);
  if (forwardedProto) {
    headers.set("x-forwarded-proto", forwardedProto);
  }

  return headers;
}

async function readRawBody(req: any): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export async function proxyToBackend(req: any, res: any, buildTargetUrl: (origin: string, incomingUrl: URL) => string) {
  const origin = getBackendOrigin();
  if (!origin) {
    res.statusCode = 500;
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ message: "Missing server env var BACKEND_ORIGIN." }));
    return;
  }

  const incomingUrl = new URL(req.url ?? "/", "http://localhost");
  const targetUrl = buildTargetUrl(origin, incomingUrl);

  const method = (req.method ?? "GET").toUpperCase();
  const headers = copyRequestHeaders(req);

  const body = method === "GET" || method === "HEAD" ? undefined : await readRawBody(req);

  const upstream = await fetch(targetUrl, {
    method,
    headers,
    body,
    redirect: "manual",
  });

  res.statusCode = upstream.status;

  upstream.headers.forEach((value, key) => {
    const normalizedKey = key.toLowerCase();
    if (normalizedKey === "transfer-encoding") return;
    res.setHeader(key, value);
  });

  const buf = Buffer.from(await upstream.arrayBuffer());
  res.end(buf);
}

