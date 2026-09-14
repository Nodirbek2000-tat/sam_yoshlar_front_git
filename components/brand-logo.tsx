import { cn } from "@/lib/cn";

/**
 * «Samarqand yoshlari» logosi — kunduzgi va kechki rejim uchun alohida rasm.
 *
 * Asl logoda belgi baland, yozuv esa ingichka: butunligicha kichraytirilsa
 * yozuv o'qilmay qoladi. Shuning uchun belgi va yozuv alohida rasm bo'lib,
 * yozuv belgiga nisbatan kattaroq qo'yiladi.
 *
 * Ikkala rejim nusxasi ham sahifada turadi, CSS (`dark:`) keraklisini
 * ko'rsatadi — mavzu almashganda rasm darhol, qayta yuklanmasdan almashadi.
 *
 * `full` — belgi va yozuv, `mark` — faqat belgi (tor joylar uchun).
 */
const FILES = {
    mark: { light: "/logo/belgi-kun.webp", dark: "/logo/belgi-kech.webp", ratio: 1.2 },
    text: { light: "/logo/yozuv-kun.webp", dark: "/logo/yozuv-kech.webp", ratio: 7.4 },
} as const;

/** Yozuv balandligi belgiga nisbatan */
const TEXT_SCALE = 0.5;

export function BrandLogo({
    variant = "full",
    height = 32,
    className,
    priority = false,
    tone = "auto",
}: {
    variant?: "full" | "mark";
    /** Belgining piksel balandligi; qolgani shundan hisoblanadi */
    height?: number;
    className?: string;
    /** Sarlavhadagi logo — birinchi bo'lib yuklansin */
    priority?: boolean;
    /** `dark` — fon har doim to'q bo'lgan joylar uchun (masalan, kirish sahifasining o'ng paneli) */
    tone?: "auto" | "dark";
}) {
    const textHeight = Math.round(height * TEXT_SCALE);

    return (
        <span
            className={cn("inline-flex shrink-0 items-center", className)}
            style={{ gap: Math.round(height * 0.14) }}
        >
            <Pair file={FILES.mark} height={height} tone={tone} priority={priority} alt="Samarqand yoshlari" />
            {variant === "full" && (
                <Pair file={FILES.text} height={textHeight} tone={tone} priority={priority} alt="" />
            )}
        </span>
    );
}

function Pair({
    file,
    height,
    tone,
    priority,
    alt,
}: {
    file: (typeof FILES)[keyof typeof FILES];
    height: number;
    tone: "auto" | "dark";
    priority: boolean;
    alt: string;
}) {
    const common = {
        height,
        width: Math.round(height * file.ratio),
        decoding: "async" as const,
        fetchPriority: priority ? ("high" as const) : undefined,
        style: { height, width: "auto" },
    };

    if (tone === "dark") {
        /* eslint-disable-next-line @next/next/no-img-element */
        return <img src={file.dark} alt={alt} {...common} className="block" />;
    }

    return (
        <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={file.light} alt={alt} {...common} className="block dark:hidden" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={file.dark} alt="" aria-hidden {...common} className="hidden dark:block" />
        </>
    );
}
