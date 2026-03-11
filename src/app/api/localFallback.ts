import { ApiError } from "./http";

function isTruthyEnv(value: unknown) {
  const v = String(value ?? "")
    .trim()
    .toLowerCase();
  return v === "1" || v === "true" || v === "yes" || v === "on";
}

export const LOCAL_FALLBACK_ENABLED = import.meta.env.DEV || isTruthyEnv(import.meta.env.VITE_ENABLE_LOCAL_FALLBACK);

export function shouldUseLocalFallback(error: unknown) {
  if (!LOCAL_FALLBACK_ENABLED) {
    return false;
  }
  if (error instanceof ApiError) {
    return error.status === 404 || error.status === 405 || error.status === 501 || error.status >= 500;
  }
  if (error instanceof Error) {
    return /failed to fetch|networkerror|load failed/i.test(error.message || "");
  }
  return true;
}

