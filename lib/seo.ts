import type { Metadata } from "next";

import { plainText } from "./format";

/** Saytning tashqi manzili — sitemap va canonical havolalar shundan yasaladi. */
export const SITE_URL = (
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://samarqandyoshlari.uz"
).replace(/\/$/, "");

export const absoluteUrl = (path: string) => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

/** Google uchun belgilar — sahifaga `<script type="application/ld+json">` bo'lib tushadi. */
export const organizationSchema = () => ({
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Samarqand yoshlari — Yosh Tadbirkorlar Kengashi",
    alternateName: "sam-yosh tadbirkor",
    url: SITE_URL,
    logo: absoluteUrl("/logo/belgi-kun.webp"),
    description:
        "Yoshlarni birlashtiruvchi, qo'llab-quvvatlovchi va rivojlantirishga xizmat qiluvchi yagona axborot platformasi.",
    address: {
        "@type": "PostalAddress",
        addressLocality: "Samarqand",
        addressCountry: "UZ",
    },
    telephone: "+998940449442",
    sameAs: ["https://t.me/Samstf"],
});

export const websiteSchema = () => ({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Samarqand yoshlari",
    url: SITE_URL,
    inLanguage: "uz",
});

/* --------------------------------------------------------------------------
   Ulashish ko'rinishi (Telegram, Facebook, Google)
   -------------------------------------------------------------------------- */

export const SITE_NAME = "Samarqand yoshlari";

/** Sahifaning o'z rasmi bo'lmasa — saytning umumiy muqovasi (1200×630). */
const DEFAULT_SHARE_IMAGE = { url: "/opengraph-image.png", width: 1200, height: 630, alt: SITE_NAME };

/** Tavsif uchun: bezash belgilarisiz, so'z o'rtasida uzilmagan ~160 belgi. */
export function shareText(text: string | null | undefined, limit = 160) {
    const clean = plainText(text ?? "");
    if (clean.length <= limit) return clean;
    return `${clean.slice(0, limit).replace(/\s+\S*$/, "")}…`;
}

/**
 * Bitta sahifaning ulashish ma'lumoti: sarlavha, tavsif va **o'z rasmi**.
 *
 * Sahifa `openGraph` bersa, Next ildiz qobiqdagisini butunlay almashtiradi —
 * shuning uchun sayt nomi va til ham shu yerda qayta beriladi, aks holda
 * Telegram'da «Samarqand yoshlari» yozuvi yo'qolib qoladi.
 */
export function shareMetadata({
    title,
    description,
    image,
    article,
}: {
    title: string;
    description?: string | null;
    /** Yangilik, tadbir, e'lon... rasmi (to'liq manzil) */
    image?: string | null;
    /** Yangilik bo'lsa — chop etilgan vaqti */
    article?: { publishedTime: string };
}): Metadata {
    const text = shareText(description) || undefined;
    const images = image ? [{ url: image, alt: title }] : [DEFAULT_SHARE_IMAGE];
    const common = { title, description: text, siteName: SITE_NAME, locale: "uz_UZ", images };

    return {
        title,
        description: text,
        openGraph: article
            ? { ...common, type: "article", publishedTime: article.publishedTime }
            : { ...common, type: "website" },
        twitter: {
            card: "summary_large_image",
            title,
            description: text,
            images: images.map((item) => item.url),
        },
    };
}
