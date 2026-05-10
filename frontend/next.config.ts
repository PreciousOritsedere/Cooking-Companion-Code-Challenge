import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/upload",
        destination: "http://localhost:8000/upload",
      },
    ];
  },
};

export default nextConfig;
