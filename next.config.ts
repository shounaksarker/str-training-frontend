import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...(process.env.PLAYWRIGHT_TEST === "1" ? { distDir: ".next-playwright" } : {}),
};

export default nextConfig;
