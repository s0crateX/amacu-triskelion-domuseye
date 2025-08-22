import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["images.unsplash.com", "ik.imagekit.io", "firebasestorage.googleapis.com"],
  },
};

export default nextConfig;
module.exports = nextConfig;
