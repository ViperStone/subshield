/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker & Vercel production builds
  output: "standalone",

  // Expose API URL at build time for Vercel
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  },

  // Disable image optimization if not using Vercel's CDN
  images: {
    unoptimized: process.env.NODE_ENV === "development",
  },
};

module.exports = nextConfig;
