import type { NextConfig } from "next";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === "production";

// Base URL of the FastAPI backend (tracker-api). Browser calls to /api/v1/* are proxied here so
// the session cookie stays first-party; Server Components call it directly (lib/api/server.ts).
const API_URL = (process.env.API_URL ?? "http://localhost:8000").replace(/\/+$/, "");

// Content-Security-Policy. The app loads no third-party scripts, styles, fonts or images; the only
// external calls are Firebase Cloud Messaging's token registration (lib/firebase/client.ts).
// `'unsafe-inline'` is required for scripts because Next.js emits inline hydration scripts and
// this policy is static (a per-request nonce would need middleware); the other directives are
// what stop framing, plugin content, base-tag hijacking and form posts to other origins.
// Dev additionally needs `'unsafe-eval'` (React refresh) and a websocket for HMR.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'", // framer-motion and Radix set inline styles
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self' https://firebaseinstallations.googleapis.com https://fcmregistrations.googleapis.com${isProd ? "" : " ws: wss:"}`,
  "worker-src 'self'",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Frame-Options", value: "DENY" }, // legacy twin of frame-ancestors
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  // Browsers ignore HSTS over plain HTTP, so it is harmless on localhost. No `preload` or
  // `includeSubDomains` on purpose: those are hard to undo and depend on the final domain.
  ...(isProd ? [{ key: "Strict-Transport-Security", value: "max-age=31536000" }] : []),
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  outputFileTracingRoot: projectRoot,
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async rewrites() {
    return [{ source: "/api/v1/:path*", destination: `${API_URL}/api/v1/:path*` }];
  },
};

export default nextConfig;
