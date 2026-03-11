import { loadAuth } from "./storage";

export class ApiError extends Error {
  status: number;
  body: unknown;
  url?: string;

  constructor(message: string, status: number, body: unknown, url?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
    this.url = url;
  }
}

export function getApiBaseUrl() {
  const raw = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "";
  const trimmed = raw.trim().replace(/\/+$/, "");
  return trimmed.endsWith("/api") ? trimmed.slice(0, -4) : trimmed;
}

export function resolveApiAssetUrl(assetPath?: string | null) {
  if (!assetPath) {
    return "";
  }
  if (/^(https?:)?\/\//i.test(assetPath) || /^data:/i.test(assetPath) || /^blob:/i.test(assetPath)) {
    return assetPath;
  }
  const baseUrl =
    getApiBaseUrl() ||
    (((import.meta.env.VITE_API_PROXY_TARGET as string | undefined) ?? "").trim().replace(/\/+$/, "").replace(/\/api$/, ""));
  if (!baseUrl) {
    return assetPath;
  }
  if (assetPath.startsWith("/")) {
    return `${baseUrl}${assetPath}`;
  }
  return `${baseUrl}/${assetPath}`;
}

function buildUrl(path: string, query?: Record<string, unknown>) {
  const baseUrl = getApiBaseUrl();
  const url = path.startsWith("http://") || path.startsWith("https://") ? path : `${baseUrl}${path}`;

  if (!query) {
    return url;
  }

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) {
      continue;
    }
    params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${url}${url.includes("?") ? "&" : "?"}${qs}` : url;
}

export type ApiRequestOptions = Omit<RequestInit, "body"> & {
  query?: Record<string, unknown>;
  json?: unknown;
  auth?: boolean;
  body?: RequestInit["body"];
};

async function readResponseBody(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";
  if (response.status === 204) {
    return null;
  }
  if (contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }
  try {
    return await response.text();
  } catch {
    return null;
  }
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { query, json, auth = true, headers, body: requestBody, ...init } = options;

  const resolvedHeaders = new Headers(headers);
  resolvedHeaders.set("accept", "application/json");

  if (json !== undefined) {
    resolvedHeaders.set("content-type", "application/json");
  }

  if (json !== undefined && requestBody !== undefined) {
    throw new Error("apiRequest: provide either json or body, not both");
  }

  const token = auth ? loadAuth()?.accessToken : null;
  if (token) {
    resolvedHeaders.set("authorization", `Bearer ${token}`);
  }

  const url = buildUrl(path, query);
  const response = await fetch(url, {
    ...init,
    headers: resolvedHeaders,
    body: json !== undefined ? JSON.stringify(json) : requestBody,
    credentials: init.credentials ?? "include",
  });

  const responseBody = await readResponseBody(response);

  if (!response.ok) {
    const message =
      typeof responseBody === "object" &&
      responseBody &&
      "message" in responseBody &&
      typeof (responseBody as any).message === "string"
        ? (responseBody as any).message
        : `Request failed (${response.status})`;
    throw new ApiError(message, response.status, responseBody, url);
  }

  return responseBody as T;
}
