import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  env: {
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  transpilePackages: ["motion"],
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
