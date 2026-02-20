/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable server actions
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
  // Transpile Three.js/R3F packages for Next.js
  transpilePackages: ["three", "@react-three/fiber", "@react-three/drei"],
  webpack: (config) => {
    // Handle GLTF/GLB files
    config.module.rules.push({
      test: /\.(glb|gltf)$/,
      use: {
        loader: "file-loader",
        options: {
          publicPath: "/_next/static/files",
          outputPath: "static/files",
        },
      },
    });
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
