import { getApiBaseUrl } from "./http";
import { loadAuth } from "./storage";

export function getStatsHubUrl(accessToken?: string) {
  const token = accessToken ?? loadAuth()?.accessToken ?? "";
  const baseUrl = getApiBaseUrl();
  const path = `/hubs/stats?access_token=${encodeURIComponent(token)}`;
  return baseUrl ? `${baseUrl}${path}` : path;
}

