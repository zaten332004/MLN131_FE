import { defineConfig, loadEnv, type Plugin } from "vite";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "fs";

type DevRouteSegment =
  | { kind: "literal"; value: string }
  | { kind: "param"; name: string }
  | { kind: "catchall"; name: string };

type DevRoute = {
  file: string;
  segments: DevRouteSegment[];
  specificity: number;
};

function buildDevApiRoutes(apiRoot: string): DevRoute[] {
  const routes: DevRoute[] = [];

  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith(".")) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
        continue;
      }
      if (!entry.isFile() || !entry.name.endsWith(".ts")) continue;
      if (entry.name.startsWith("_")) continue;

      const rel = path.relative(apiRoot, full).replace(/\\/g, "/");
      const noExt = rel.replace(/\.ts$/i, "");
      const parts = noExt.split("/").filter(Boolean);
      const routeParts = parts[parts.length - 1] === "index" ? parts.slice(0, -1) : parts;

      const segments: DevRouteSegment[] = [];
      let specificity = 0;
      for (const part of routeParts) {
        const paramMatch = part.match(/^\[([^\]]+)\]$/);
        if (paramMatch) {
          const raw = paramMatch[1];
          const catchall = raw.startsWith("...");
          const name = catchall ? raw.slice(3) : raw;
          segments.push(catchall ? { kind: "catchall", name } : { kind: "param", name });
          continue;
        }
        segments.push({ kind: "literal", value: part });
        specificity += 10;
      }

      specificity += segments.length;
      routes.push({ file: full, segments, specificity });
    }
  };

  walk(apiRoot);
  routes.sort((a, b) => b.specificity - a.specificity);
  return routes;
}

function matchDevRoute(segments: string[], route: DevRouteSegment[]) {
  const params: Record<string, string | string[]> = {};

  for (let i = 0; i < route.length; i++) {
    const expected = route[i];
    const actual = segments[i];

    if (expected.kind === "catchall") {
      params[expected.name] = segments.slice(i);
      return { params };
    }

    if (actual === undefined) return null;

    if (expected.kind === "literal") {
      if (expected.value !== actual) return null;
      continue;
    }

    params[expected.name] = actual;
  }

  if (segments.length !== route.length) return null;
  return { params };
}

function vercelFunctionsDevPlugin(proxyTarget: string, apiRoot: string): Plugin | null {
  if (proxyTarget) return null;
  if (!fs.existsSync(apiRoot) || !fs.statSync(apiRoot).isDirectory()) return null;

  const routes = buildDevApiRoutes(apiRoot);

  return {
    name: "mln131-vercel-functions-dev",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const rawUrl = req.url || "/";
        if (!rawUrl.startsWith("/api") && !rawUrl.startsWith("/uploads")) {
          return next();
        }

        const parsed = new URL(rawUrl, "http://localhost");
        let pathname = parsed.pathname;

        // Match prod rewrite: /uploads/* -> /api/uploads/*
        if (pathname.startsWith("/uploads")) {
          pathname = `/api/uploads${pathname.slice("/uploads".length)}`;
        }

        if (!pathname.startsWith("/api")) return next();

        const routeSegments = pathname
          .replace(/^\/api\/?/, "")
          .split("/")
          .filter(Boolean)
          .map((s) => decodeURIComponent(s));

        let match: { route: DevRoute; params: Record<string, string | string[]> } | null = null;
        for (const route of routes) {
          const attempt = matchDevRoute(routeSegments, route.segments);
          if (!attempt) continue;
          match = { route, params: attempt.params };
          break;
        }

        if (!match) {
          return next();
        }

        const query: Record<string, string | string[]> = { ...match.params };
        for (const [key, value] of parsed.searchParams.entries()) {
          if (key in query) {
            const existing = query[key];
            query[key] = Array.isArray(existing) ? [...existing, value] : [String(existing), value];
          } else {
            query[key] = value;
          }
        }
        (req as any).query = query;

        try {
          const moduleId = `/${path.relative(process.cwd(), match.route.file).replace(/\\/g, "/")}`;
          const mod = await server.ssrLoadModule(moduleId);
          const handler = (mod as any)?.default ?? mod;

          if (typeof handler !== "function") {
            res.statusCode = 500;
            res.setHeader("content-type", "application/json; charset=utf-8");
            res.end(JSON.stringify({ message: "Invalid API handler." }));
            return;
          }

          await handler(req as any, res as any);
          return;
        } catch (error) {
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader("content-type", "application/json; charset=utf-8");
            res.end(JSON.stringify({ message: "Dev API error", detail: String((error as any)?.message ?? error) }));
            return;
          }
          return;
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const rawProxyTarget = (env.VITE_API_PROXY_TARGET || env.VITE_API_BASE_URL || "").trim().replace(/\/+$/, "");
  const proxyTarget = rawProxyTarget.endsWith("/api") ? rawProxyTarget.slice(0, -4) : rawProxyTarget;

  // Make secrets from `.env*` available to the dev API middleware (server-side).
  for (const [key, value] of Object.entries(env)) {
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }

  const apiRoot = path.resolve(__dirname, "./api");
  const devApiPlugin = vercelFunctionsDevPlugin(proxyTarget, apiRoot);

  return {
    plugins: [
      // The React and Tailwind plugins are both required for Make, even if
      // Tailwind is not being actively used – do not remove them
      react(),
      tailwindcss(),
      devApiPlugin,
    ].filter(Boolean) as Plugin[],
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
