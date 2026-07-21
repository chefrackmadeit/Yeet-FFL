/** @type {import('next').NextConfig} */
const nextConfig = {
  // Sleeper avatar images are served from this host.
  images: {
    remotePatterns: [{ protocol: "https", hostname: "sleepercdn.com" }],
  },
};

export default nextConfig;
