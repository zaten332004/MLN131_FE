import { useEffect, useRef } from "react";
import { useLocation } from "react-router";
import { pageview } from "../api/track";

export function usePageTracking() {
  const location = useLocation();
  const previousPath = useRef<string | undefined>(undefined);

  useEffect(() => {
    const path = `${location.pathname}${location.search}${location.hash}`;
    const referrer = previousPath.current;
    previousPath.current = path;

    pageview({ path, referrer }).catch(() => {});
  }, [location.pathname, location.search, location.hash]);
}

