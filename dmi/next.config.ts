import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack(config) {
    // Añadimos un fallback para que Webpack ignore los módulos de Node.js
    config.resolve.fallback = {
      ...config.resolve.fallback,
      child_process: false, // Ignorar child_process
      fs: false, // Ignorar fs
      path: false, // Ignorar path
      os: false, // Ignorar os
    };
    return config;
  },
};

export default nextConfig;