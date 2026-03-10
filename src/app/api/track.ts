import { apiRequest } from "./http";
import type { TrackPageviewRequest } from "./types";

export function pageview(payload: TrackPageviewRequest) {
  return apiRequest<void>("/api/track/pageview", { method: "POST", json: payload, auth: false });
}

