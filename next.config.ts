import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.alias["@config"] = path.resolve(__dirname, "src/config");
    return config;
  },
};

export default nextConfig;
