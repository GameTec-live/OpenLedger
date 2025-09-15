import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    images: {
        remotePatterns: [
            new URL("https://tailwindcss.com/**"),
            {
                protocol: "https",
                hostname: "images.unsplash.com",
                pathname: "**",
            },
        ],
    },
};

export default nextConfig;
