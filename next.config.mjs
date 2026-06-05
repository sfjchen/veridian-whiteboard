import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));

const basePath = "/veridian";

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  allowedDevOrigins: ["localhost", "127.0.0.1"],
  reactStrictMode: true,
  turbopack: {
    root,
  },
  async redirects() {
    return [{ source: "/", destination: basePath, permanent: false, basePath: false }];
  },
};

export default nextConfig;
