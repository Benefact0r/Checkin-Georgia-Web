/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Emit a self-contained server bundle for Cloud Run / minimal Docker images.
  output: "standalone",
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL ??
      "https://checkin-georgia-api-171625154738.europe-west1.run.app",
  },
};

export default nextConfig;
