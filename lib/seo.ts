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
