import type { TrackPageviewRequest } from "./types";
import { trackPageview } from "../local/analytics";
import { getDeviceId } from "../local/analytics";
import { loadAuth } from "./storage";

export function pageview(payload: TrackPageviewRequest) {
  try {
    trackPageview(payload);
  } catch {
    // ignore storage/quota errors to avoid blank screens during navigation
  }

  try {
    const auth = loadAuth();
    const deviceId = getDeviceId();
    fetch("/api/track/pageview", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        deviceId,
        userId: auth?.user?.id || undefined,
        path: payload.path,
        referrer: payload.referrer,
      }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // ignore
  }
  return Promise.resolve();
}
