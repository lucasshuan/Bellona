import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  typedRoutes: true,
  experimental: {
    optimizePackageImports: ["date-fns", "lucide-react"],
  },
};

export default nextConfig;
