import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const config: NextConfig = {
  /* config options here */

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.padelfip.com',
      },
      {
        protocol: 'https',
        hostname: 'widget.matchscorerlive.com',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

const withPWAConfig = withPWA({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,

  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
    importScripts: ["/push-sw.js"],
  },
});

// export default config;
export default withPWAConfig(config);
