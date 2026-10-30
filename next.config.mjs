/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["three"],
  images: {
    remotePatterns: [{ protocol: "https", hostname: "apod.nasa.gov" }],
  },
};

export default nextConfig;
