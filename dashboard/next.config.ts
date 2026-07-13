import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Hide the Next.js dev-mode indicator (the "N" overlay bottom-left). Dev only; prod never shows it.
  devIndicators: false,
};

export default nextConfig;
