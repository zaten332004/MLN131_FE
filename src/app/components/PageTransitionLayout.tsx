import { Outlet, useLocation } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { usePageTracking } from "../hooks/usePageTracking";

const transition = { duration: 0.25, ease: [0.32, 0.72, 0, 1] as const };

export function PageTransitionLayout() {
  const location = useLocation();
  usePageTracking();

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
