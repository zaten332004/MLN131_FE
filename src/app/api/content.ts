import { apiRequest } from "./http";
import type { ContentPageDetail, ContentPageSummary } from "./types";

export function listPages() {
  return apiRequest<ContentPageSummary[]>("/api/content/pages", { method: "GET" });
}

export function getPage(slug: string) {
  return apiRequest<ContentPageDetail>(`/api/content/pages/${encodeURIComponent(slug)}`, { method: "GET" });
}

