import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  // Disable compression so that Caddy compresses requests with the more compact zstd
  compress: false,
  output: 'export',
};

export default nextConfig;
