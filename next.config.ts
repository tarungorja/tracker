import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const projectRoot = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Pin the workspace root so a stray parent lockfile doesn't confuse Turbopack.
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
