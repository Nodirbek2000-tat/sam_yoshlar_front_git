import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // Docker uchun: `.next/standalone` ichiga faqat kerakli fayllar yig'iladi,
    // shunda tayyor obraz `node_modules` siz ham ishlaydi va ancha yengil bo'ladi.
    output: "standalone",

    images: {
        // Tayyorlangan o'lcham 30 kun keshda turadi. Yangi yuklangan rasm yangi
        // nom oladi, shuning uchun eskisi «qotib qolmaydi».
        minimumCacheTTL: 60 * 60 * 24 * 30,
        // Lokalda rasmlar 127.0.0.1 dan keladi — Next 16 buni standart holatda
        // taqiqlaydi (SSRF himoyasi). Serverda o'chiq qoladi.
        dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production",
        // Rasmlar Django tomonidan beriladi (media fayllar)
        remotePatterns: [
            { protocol: "https", hostname: "samarqandyoshlari.uz" },
            { protocol: "http", hostname: "127.0.0.1", port: "8000" },
            { protocol: "http", hostname: "localhost", port: "8000" },
            { protocol: "http", hostname: "web", port: "8000" },
        ],
    },

    // Server javoblarida versiyani ko'rsatmaymiz
    poweredByHeader: false,
};

export default nextConfig;
