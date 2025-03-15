/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  
  // Enable static page generation optimization
  output: 'standalone',
  
  // Optimize images
  images: {
    domains: ['localhost'],
  },
  
  // Enable SWC minification for faster builds
  swcMinify: true,
  
  // Configure compiler options
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Enable experimental features
  experimental: {
    // Enable optimizeCss for better CSS optimization
    optimizeCss: true,
  },

  // Configure API proxy
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://localhost:8000/api/v1/:path*',
      },
    ]
  },
}

export default nextConfig; 