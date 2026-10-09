import type { NextConfig } from "next";

const backendUrl =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://ai-based-agricultural-advisory-system-ouyx.onrender.com";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/chat/:path*",
        destination: `${backendUrl}/chat/:path*`,
      },
      {
        source: "/user/:path*",
        destination: `${backendUrl}/user/:path*`,
      },
      {
        source: "/auth/:path*",
        destination: `${backendUrl}/auth/:path*`,
      },
      {
        source: "/api/chat/:path*",
        destination: `${backendUrl}/chat/:path*`,
      },
      {
        source: "/api/auth/:path*",
        destination: `${backendUrl}/auth/:path*`,
      },
      {
        source: "/api/user/:path*",
        destination: `${backendUrl}/user/:path*`,
      },
    ];
  },
};

export default nextConfig;