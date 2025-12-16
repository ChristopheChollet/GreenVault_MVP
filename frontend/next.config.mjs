/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  webpack: (config, { isServer }) => {
    // Ignore problematic test modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'why-is-node-running': false,
      'tap': false,
    };
    return config;
  },
  // Ignore ESLint errors during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ignore TypeScript errors during build
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
