import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // CSS di-inline ke HTML agar tidak ada permintaan yang memblokir render.
  experimental: {
    inlineCss: true,
  },
  poweredByHeader: false,
  // Turbopack diaktifkan sebagai bundler utama untuk dev maupun build.
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "open-api.delcom.org" },
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "127.0.0.1" },
    ],
  },
};

export default nextConfig;
