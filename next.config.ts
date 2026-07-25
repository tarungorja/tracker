import type { NextConfig } from "next";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Pin the workspace root so a stray parent lockfile doesn't confuse tracing.
  outputFileTracingRoot: projectRoot,
  // Mongoose ships optional native/driver deps that Next tries to bundle for
  // server components. Mark it external so the App Router uses the Node build.
  serverExternalPackages: ["mongoose"],
  experimental: {
    // Framer Motion is ESM-heavy; letting Next optimize its imports keeps
    // the client bundle lean.
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
};

export default nextConfig;
