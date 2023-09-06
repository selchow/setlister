// validate environment variables on build
import('./src/utils/env/server.mjs')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = nextConfig
