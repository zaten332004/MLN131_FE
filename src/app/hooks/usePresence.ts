import { useEffect } from "react";
import { loadAuth } from "../api/storage";
import { onLocalEvent } from "../local/events";
import { prunePresence, removePresenceForCurrentTab, upsertPresence } from "../local/presence";
import { getDeviceId } from "../local/analytics";
import { getTabId } from "../local/presence";

export function usePresence() {
  useEffect(() => {
    const tick = () => {
      try {
        const auth = loadAuth();
        const deviceId = getDeviceId();
        const tabId = getTabId();
        const userId = auth?.user?.id || undefined;
        upsertPresence({ userId: auth?.user?.id || undefined });
        prunePresence();

        fetch("/api/presence/ping", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ deviceId, tabId, userId }),
          keepalive: true,
        }).catch(() => {});
      } catch {
        // ignore storage errors
      }
    };

    tick();

    const interval = window.setInterval(tick, 10_000);

    const onUnload = () => {
      try {
        const auth = loadAuth();
        const deviceId = getDeviceId();
        const tabId = getTabId();
        const userId = auth?.user?.id || undefined;
        removePresenceForCurrentTab();
        prunePresence();

        fetch("/api/presence/leave", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ deviceId, tabId, userId }),
          keepalive: true,
        }).catch(() => {});
      } catch {
        // ignore
      }
    };
    window.addEventListener("beforeunload", onUnload);
    window.addEventListener("pagehide", onUnload);

    const onVisibility = () => {
      if (document.hidden) {
        try {
          const auth = loadAuth();
          const deviceId = getDeviceId();
          const tabId = getTabId();
          const userId = auth?.user?.id || undefined;
          removePresenceForCurrentTab();
          prunePresence();
          fetch("/api/presence/leave", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ deviceId, tabId, userId }),
            keepalive: true,
          }).catch(() => {});
        } catch {
          // ignore
        }
      } else {
        tick();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    const offAuth = onLocalEvent("auth-changed", tick);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("beforeunload", onUnload);
      window.removeEventListener("pagehide", onUnload);
      document.removeEventListener("visibilitychange", onVisibility);
      offAuth();
    };
  }, []);
}
