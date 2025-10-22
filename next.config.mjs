/** @type {import('next').NextConfig} */
const nextConfig = {
  // Build configuration
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Performance: Enable SWC minification
  swcMinify: true,
  
  // Performance: Compression
  compress: true,
  
  // Performance: Power optimizations
  poweredByHeader: false,
  
  // Image optimization
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
  },
  
  // CORS + Cache headers
  async headers() {
    return [
      // API CORS
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
      // Static assets caching
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
        ],
      },
      // Font caching
      {
        source: '/fonts/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
  
  // Vercel-specific optimizations
  experimental: {
    optimizePackageImports: [
      'lucide-react', 
      '@radix-ui/react-icons',
      'recharts',
      'date-fns',
    ],
    // Use Edge Runtime for faster cold starts on Vercel
    serverComponentsExternalPackages: ['mongoose'],
  },
  
  // Output optimization
  reactStrictMode: true,
  
  // Logging
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
}

export default nextConfig

