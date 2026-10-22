/** @type {import('next').NextConfig} */
const nextConfig = {
  // Generate a standalone build suitable for minimal production Docker containers
  output: 'standalone',
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'local.blfa.com',
        port: '9000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'nginx',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'secure.gravatar.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
