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
    // Mengganti modul polyfill bawaan Next.js dengan modul kosong. Seluruh API
    // yang ditambalnya sudah tersedia pada browser target resmi Next.js
    // (chrome 111, edge 111, firefox 111, safari 16.4), sehingga polyfill itu
    // hanya menjadi byte mati dan memicu audit "legacy JavaScript".
    resolveAlias: {
      "@next/polyfill-module": "./scripts/empty-polyfill.js",
      "../build/polyfills/polyfill-module": "./scripts/empty-polyfill.js",
      "next/dist/build/polyfills/polyfill-module": "./scripts/empty-polyfill.js",
    },
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
