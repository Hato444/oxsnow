/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    const immutable = [
      { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
    ];
    return [
      { source: "/previews/:path*", headers: immutable },
      { source: "/teasers/:path*", headers: immutable },
      { source: "/trailers/:path*", headers: immutable },
      { source: "/posters/:path*", headers: immutable },
    ];
  },
};

export default nextConfig;
