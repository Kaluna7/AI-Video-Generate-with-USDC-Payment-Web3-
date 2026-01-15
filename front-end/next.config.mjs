import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    // Prevent Turbopack from incorrectly picking a different workspace root on Windows
    root: __dirname,
  },
  // Ensure file tracing stays within the frontend project folder
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
