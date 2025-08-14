import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3001",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "ecommerce-j5j0.onrender.com",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
