import { getApiBaseUrl } from "./http";
import { loadAuth } from "./storage";

function getHubBaseUrl() {
  const raw = (import.meta.env.VITE_HUB_BASE_URL as string | undefined) ?? "";
  const trimmed = raw.trim().replace(/\/+$/, "");
  if (!trimmed) {
    return getApiBaseUrl();
  }
  return trimmed.endsWith("/api") ? trimmed.slice(0, -4) : trimmed;
}

export function getStatsHubUrl(accessToken?: string) {
  const token = accessToken ?? loadAuth()?.accessToken ?? "";
  const baseUrl = getHubBaseUrl();
  const path = `/hubs/stats?access_token=${encodeURIComponent(token)}`;
  return baseUrl ? `${baseUrl}${path}` : path;
}
