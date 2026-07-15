const nextConfig = {
  experimental: {
    typedRoutes: true
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Prevent caching of sensitive pages
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate"
          },
          {
            key: "Pragma",
            value: "no-cache"
          },
          {
            key: "Expires",
            value: "0"
          },
          // Prevent clickjacking — do not allow iframe embedding
          {
            key: "X-Frame-Options",
            value: "DENY"
          },
          // Prevent MIME-type sniffing attacks
          {
            key: "X-Content-Type-Options",
            value: "nosniff"
          },
          // Control referrer information leakage
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin"
          },
          // Restrict browser feature access
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()"
          },
          // XSS protection (legacy but still useful for older browsers)
          {
            key: "X-XSS-Protection",
            value: "1; mode=block"
          },
          // HSTS — enforce HTTPS (future-ready for production deployment)
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains"
          }
        ]
      }
    ];
  }
};

export default nextConfig;
