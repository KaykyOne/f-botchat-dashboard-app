/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/f-botchat-dashboard-app',
  assetPrefix: '/f-botchat-dashboard-app',
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_APIURL: process.env.NEXT_PUBLIC_APIURL,
    NEXT_PUBLIC_SUPABASE: process.env.NEXT_PUBLIC_SUPABASE,
  },
  trailingSlash: true,
};

export default nextConfig;
