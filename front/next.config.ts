import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  output: 'export',
};

export default nextConfig;
