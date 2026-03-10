import { defineConfig, loadEnv } from "vite";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const rawProxyTarget = (env.VITE_API_PROXY_TARGET || env.VITE_API_BASE_URL || "").trim().replace(/\/+$/, "");
  const proxyTarget = rawProxyTarget.endsWith("/api") ? rawProxyTarget.slice(0, -4) : rawProxyTarget;

  return {
    plugins: [
      // The React and Tailwind plugins are both required for Make, even if
      // Tailwind is not being actively used – do not remove them
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: proxyTarget
      ? {
          proxy: {
            "/api": {
              target: proxyTarget,
              changeOrigin: true,
              secure: false,
            },
            "/uploads": {
              target: proxyTarget,
              changeOrigin: true,
              secure: false,
            },
            "/hubs": {
              target: proxyTarget,
              changeOrigin: true,
              secure: false,
              ws: true,
            },
          },
        }
      : undefined,
    assetsInclude: ["**/*.svg", "**/*.csv"],
  };
});
