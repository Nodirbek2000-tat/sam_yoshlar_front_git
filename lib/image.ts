/**
 * Yuklangan rasmlar Next optimizatori orqali beriladi (`/_next/image`).
 *
 * Asl rasm 1920 px bo'lsa ham, 300 px kartaga 384 px WebP yuboriladi —
 * trafik 10–20 marta kamayadi. Optimizator har bir o'lchamni bir marta
 * tayyorlab, 30 kun keshda saqlaydi.
 */

/** Ruxsat etilgan kengliklar — `next.config.ts` dagi `imageSizes` + `deviceSizes` dan */
const WIDTHS = [64, 96, 128, 256, 384, 640, 828, 1080, 1200, 1920];

/** Next 16 faqat shu sifatni qabul qiladi (`images.qualities`) */
const QUALITY = 75;

/**
 * Optimizatorga faqat serverdagi (API bergan to'liq manzilli) rasmlar yuboriladi.
 * `blob:` / `data:` (tanlangan faylning ko'rinishi) va saytning o'z
 * statik rasmlari o'zgarishsiz qoladi.
 */
export function isOptimizable(src: string | null | undefined): src is string {
    return typeof src === "string" && /^https?:\/\//.test(src);
}

export function optimizedUrl(src: string, width: number) {
    return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${QUALITY}`;
}

/** `srcset`: brauzer ekran va zichlikka qarab o'zi mosini tanlaydi. */
export function imageSrcSet(src: string, maxWidth: number) {
    return WIDTHS.filter((width) => width <= maxWidth)
        .map((width) => `${optimizedUrl(src, width)} ${width}w`)
        .join(", ");
}

/** `srcset` ni tushunmaydigan eski brauzer uchun o'rtacha o'lcham. */
export function fallbackWidth(maxWidth: number) {
    return WIDTHS.filter((width) => width <= Math.min(maxWidth, 1080)).at(-1) ?? WIDTHS[0];
}

/**
 * Rasm ekranda egallaydigan joy (`sizes`). Sayt konteyneri 72rem (1152 px).
 * Brauzer shunga qarab `srcset` dan eng kichik yetarlisini tanlaydi.
 */
export const IMAGE_SIZES = {
    /** 3 ustunli kartalar: yangiliklar, tadbirkorlar, e'lonlar */
    card: "(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw",
    /** 4 ustunli kartalar: bosh sahifadagi tengdoshlar */
    smallCard: "(min-width: 1024px) 270px, (min-width: 640px) 50vw, 100vw",
    /** Yarim kenglik: asosiy yangilik kartasi */
    half: "(min-width: 1152px) 576px, (min-width: 768px) 50vw, 100vw",
    /** To'liq kenglik: yangilik va tadbirkor muqovasi */
    full: "(min-width: 1152px) 1152px, 100vw",
    /** Yon ustun: tadbir sahifasidagi rasm */
    side: "(min-width: 1024px) 360px, 100vw",
} as const;

/** Kattalashtirilgan ko'rinish (galereya, rasmni bosganda) — to'liq sifat, ekranga mos. */
export function fullImage(src: string) {
    if (!isOptimizable(src)) return { src };
    return { src: optimizedUrl(src, 1920), srcSet: imageSrcSet(src, 1920), sizes: "92vw" };
}
