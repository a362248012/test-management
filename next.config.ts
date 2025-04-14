import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbo: {
      memoryLimit: 8192 // 8GB内存限制
    },
    serverComponentsExternalPackages: ["prisma", "bcrypt", "bcryptjs"], // 外部化更多包
  },
  // 生产环境构建时忽略ESLint
  eslint: {
    ignoreDuringBuilds: process.env.NODE_ENV === 'production',
  },
  // 生产环境构建时忽略TypeScript错误
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === 'production',
  },
  // 缓存优化
  onDemandEntries: {
    // 开发时页面保持在内存中的时间（毫秒）
    maxInactiveAge: 60 * 60 * 1000, // 1小时
    // 同时保持在内存中的页面数
    pagesBufferLength: 5,
  },
  // 压缩响应
  compress: true,
  // 图像优化
  images: {
    domains: ['localhost'],
    // 配置图像缓存
    minimumCacheTTL: 60,
  },
  // 输出跟踪分析
  productionBrowserSourceMaps: false,
};

export default nextConfig;
