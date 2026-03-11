import { Outlet, useLocation, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useEffect } from "react";
import { usePageTracking } from "../hooks/usePageTracking";
import { loadDisabledNotice } from "../local/db";
import { onLocalEvent } from "../local/events";
import { usePresence } from "../hooks/usePresence";

const transition = { duration: 0.25, ease: [0.32, 0.72, 0, 1] as const };

export function PageTransitionLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  usePageTracking();
  usePresence();

  useEffect(() => {
    const check = () => {
      const notice = loadDisabledNotice();
      if (notice && location.pathname !== "/disabled") {
        navigate("/disabled", { replace: true });
      }
    };

    check();

    const off = onLocalEvent("auth-changed", check);
    const onStorage = (e: StorageEvent) => {
      if (e.key === "mln131.auth.disabledNotice.v1") {
        check();
      }
    };
    window.addEventListener("storage", onStorage);

    return () => {
      off();
      window.removeEventListener("storage", onStorage);
    };
  }, [location.pathname, navigate]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={transition}
        style={{ minHeight: "100vh" }}
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  );
}
