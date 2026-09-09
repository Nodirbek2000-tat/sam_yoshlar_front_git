import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // Docker uchun: `.next/standalone` ichiga faqat kerakli fayllar yig'iladi,
    // shunda tayyor obraz `node_modules` siz ham ishlaydi va ancha yengil bo'ladi.
    output: "standalone",

    images: {
        // Rasmlar Django tomonidan beriladi (media fayllar)
        remotePatterns: [
            { protocol: "https", hostname: "mentadbirkor.uz" },
            { protocol: "http", hostname: "127.0.0.1", port: "8000" },
            { protocol: "http", hostname: "localhost", port: "8000" },
            { protocol: "http", hostname: "web", port: "8000" },
        ],
    },

    // Server javoblarida versiyani ko'rsatmaymiz
    poweredByHeader: false,
};

export default nextConfig;
