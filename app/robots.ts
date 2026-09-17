import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/seo";

/**
 * Qidiruv tizimlariga yo'riqnoma.
 *
 * Ochiq sahifalar indekslanadi; panel, kabinet, kirish va API yopiq —
 * ular qidiruvda chiqmasligi kerak.
 */
export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/nazorat", "/kabinet", "/kirish", "/royxatdan-otish", "/api/"],
            },
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
        host: SITE_URL,
    };
}
