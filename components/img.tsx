import type { ImgHTMLAttributes } from "react";

import { fallbackWidth, imageSrcSet, isOptimizable, optimizedUrl } from "@/lib/image";

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet" | "sizes"> & {
    src: string;
    /**
     * Rasm ekranda qancha joy egallaydi. Masalan: `"(min-width: 1024px) 33vw, 100vw"`
     * yoki avatar uchun `"56px"`. Brauzer shunga qarab kerakli o'lchamni oladi.
     */
    sizes: string;
    /** Eng katta variant (px) — kichik joydagi rasmga katta fayl yuklanmasin */
    maxWidth?: number;
    /** Birinchi ekrandagi asosiy rasm — darhol, yuqori ustuvorlik bilan yuklanadi */
    priority?: boolean;
};

/**
 * Yuklangan rasm: ekran kengligiga mos o'lchamda, WebP formatida va
 * ko'rinmaguncha yuklanmaydi (`loading="lazy"`).
 *
 * Oddiy `<img>` o'rniga ishlatiladi — dizayn (className) o'zgarmaydi.
 * Serverdan kelmagan rasm (`blob:`, statik fayl) oddiy `<img>` bo'lib chiqadi.
 */
export function Img({ src, sizes, maxWidth = 1920, priority = false, alt = "", ...rest }: Props) {
    const lazy = {
        loading: priority ? ("eager" as const) : ("lazy" as const),
        decoding: "async" as const,
        ...(priority ? { fetchPriority: "high" as const } : {}),
    };

    if (!isOptimizable(src)) {
        // eslint-disable-next-line @next/next/no-img-element
        return <img src={src} alt={alt} {...lazy} {...rest} />;
    }

    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={optimizedUrl(src, fallbackWidth(maxWidth))}
            srcSet={imageSrcSet(src, maxWidth)}
            sizes={sizes}
            alt={alt}
            {...lazy}
            {...rest}
        />
    );
}
