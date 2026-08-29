import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/chat/:path*",
        destination: "http://127.0.0.1:8000/chat/:path*",
      },
      {
        source: "/user/:path*",
        destination: "http://127.0.0.1:8000/user/:path*",
      },
      {
        source: "/auth/:path*",
        destination: "http://127.0.0.1:8000/auth/:path*",
      },
      {
        source: "/api/:path*",
        destination: "http://127.0.0.1:8000/api/:path*",
      },
    ];
  },
};

export default nextConfig;