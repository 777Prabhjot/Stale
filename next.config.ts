import type { NextConfig } from "next";

/** Where the Express API runs. Read at build/start time. */
const BACKEND_URL = (process.env.BACKEND_URL ?? "http://localhost:4000").replace(/\/$/, "");

const nextConfig: NextConfig = {
  // The browser only ever calls /api/* on this site; Next forwards it to the API server.
  // One origin means no CORS and a first-party session cookie.
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${BACKEND_URL}/api/:path*` }];
  },
  // Quick-tunnel hostnames change on every `cloudflared` run, so allow the whole subdomain.
  allowedDevOrigins: ["*.trycloudflare.com"],
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
