import type { Metadata } from "next";

import { plainText } from "./format";
import type { Event, News } from "./types";

/** Saytning tashqi manzili — sitemap va canonical havolalar shundan yasaladi. */
export const SITE_URL = (
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://samarqandyoshlari.uz"
).replace(/\/$/, "");

export const absoluteUrl = (path: string) => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

/** Google uchun belgilar — sahifaga `<script type="application/ld+json">` bo'lib tushadi. */
export const organizationSchema = () => ({
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Samarqand yoshlari",
    alternateName: "Yoshlar uchun tashabbus maydoni",
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
 * Bitta sahifaning ulashish ma'lumoti: sarlavha, tavsif, **o'z rasmi** va
 * asosiy (canonical) manzili.
 *
 * Sahifa `openGraph` bersa, Next ildiz qobiqdagisini butunlay almashtiradi —
 * shuning uchun sayt nomi va til ham shu yerda qayta beriladi, aks holda
 * Telegram'da «Samarqand yoshlari» yozuvi yo'qolib qoladi.
 *
 * `path` — sahifaning yagona to'g'ri manzili. Bir sahifa `?utm=...`, katta
 * harf yoki boshqa ko'rinishda ochilsa ham Google hammasini shu manzilga
 * birlashtiradi va «dublikat» deb reytingni bo'lib yubormaydi.
 */
export function shareMetadata({
    title,
    description,
    image,
    path,
    article,
}: {
    title: string;
    description?: string | null;
    /** Yangilik, tadbir, e'lon... rasmi (to'liq manzil) */
    image?: string | null;
    /** Sahifaning asosiy manzili: `/yangiliklar/slug` */
    path: string;
    /** Yangilik bo'lsa — chop etilgan vaqti */
    article?: { publishedTime: string };
}): Metadata {
    const text = shareText(description) || undefined;
    const images = image ? [{ url: image, alt: title }] : [DEFAULT_SHARE_IMAGE];
    const url = absoluteUrl(path);
    const common = { title, description: text, url, siteName: SITE_NAME, locale: "uz_UZ", images };

    return {
        title,
        description: text,
        alternates: { canonical: url },
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

/* --------------------------------------------------------------------------
   Google belgilari (schema.org) — yangilik va tadbir sahifalari uchun
   -------------------------------------------------------------------------- */

/** Nashr qiluvchi — barcha sahifalarda bir xil. */
const PUBLISHER = {
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: { "@type": "ImageObject", url: absoluteUrl("/logo/belgi-kun.webp") },
};

const DEFAULT_IMAGE_URL = absoluteUrl(DEFAULT_SHARE_IMAGE.url);

/**
 * Yangilik: Google uni «yangilik» sifatida taniydi — sarlavha, rasm va sana
 * bilan (Top stories, Google News).
 */
export function newsArticleSchema(item: News) {
    const url = absoluteUrl(`/yangiliklar/${item.slug}`);
    return {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        // Google 110 belgidan uzun sarlavhani qabul qilmaydi
        headline: item.title.length > 110 ? `${item.title.slice(0, 109)}…` : item.title,
        description: shareText(item.excerpt),
        image: [item.image ?? DEFAULT_IMAGE_URL],
        datePublished: item.published_at,
        dateModified: item.published_at,
        author: item.author_name ? { "@type": "Person", name: item.author_name } : PUBLISHER,
        publisher: PUBLISHER,
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        url,
        inLanguage: "uz",
    };
}

/**
 * Tadbir: qidiruvda sana, vaqt va joyi bilan alohida kartochka bo'lib chiqadi.
 * Qatnashish bepul — joy qolmagan bo'lsa «SoldOut».
 */
export function eventSchema(event: Event) {
    const url = absoluteUrl(`/tadbirlar/${event.slug}`);
    return {
        "@context": "https://schema.org",
        "@type": "Event",
        name: event.title,
        description: shareText(event.description, 500),
        startDate: event.starts_at,
        ...(event.ends_at ? { endDate: event.ends_at } : {}),
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        location: {
            "@type": "Place",
            name: event.location,
            address: {
                "@type": "PostalAddress",
                streetAddress: event.location,
                addressLocality: "Samarqand",
                addressRegion: event.region_display || "Samarqand viloyati",
                addressCountry: "UZ",
            },
        },
        image: [event.image ?? DEFAULT_IMAGE_URL],
        organizer: PUBLISHER,
        performer: PUBLISHER,
        isAccessibleForFree: true,
        maximumAttendeeCapacity: event.capacity,
        remainingAttendeeCapacity: Math.max(0, event.seats_left),
        offers: {
            "@type": "Offer",
            price: 0,
            priceCurrency: "UZS",
            availability: event.is_full
                ? "https://schema.org/SoldOut"
                : "https://schema.org/InStock",
            url,
        },
        url,
        inLanguage: "uz",
    };
}
