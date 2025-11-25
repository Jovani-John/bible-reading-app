/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    reactCompiler: true,
  },
  images: {
    domains: [],
  },
}

module.exports = nextConfig