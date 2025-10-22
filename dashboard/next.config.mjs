/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/n-dashboard-bot',
  assetPrefix: '/n-dashboard-bot',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
