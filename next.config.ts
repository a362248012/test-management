import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbo: {
      memoryLimit: 4096 // 增加内存限制到4GB
    },
    serverComponentsExternalPackages: ["prisma"] // 外部化Prisma
  },
  eslint: {
    ignoreDuringBuilds: true, // 构建时忽略ESLint
  },
  typescript: {
    ignoreBuildErrors: true, // 构建时忽略TypeScript错误
  },
};

export default nextConfig;
