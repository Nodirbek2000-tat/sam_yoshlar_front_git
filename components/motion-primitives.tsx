import type { CSSProperties, ReactNode } from "react";

/**
 * Chiqish animatsiyalari — kutubxonasiz.
 *
 * Bular server komponentlar: brauzerga hech qanday JS yubormaydi. Harakatni
 * CSS (`globals.css` → «Chiqish animatsiyalari») va sahifa boshidagi kichik
 * skript (`FxScript`) bajaradi. Kontent serverdan ko'rinib turgan holda
 * keladi — skript ishlamasa ham hech narsa yashirin qolmaydi.
 *
 * `suppressHydrationWarning` — skript React yuklanishidan oldin `data-shown`
 * qo'yadi; bu kutilgan farq, xato emas.
 */

type Vars = CSSProperties & Record<`--${string}`, string | number>;

/** Ekranga kirganda yumshoq chiqadigan blok. Bir marta ishlaydi. */
export function Reveal({
    children,
    delay = 0,
    y = 16,
    className,
}: {
    children: ReactNode;
    delay?: number;
    y?: number;
    className?: string;
}) {
    const style: Vars = {};
    if (delay) style["--reveal-delay"] = `${delay}s`;
    if (y !== 16) style["--reveal-y"] = `${y}px`;

    return (
        <div data-reveal className={className} style={style} suppressHydrationWarning>
            {children}
        </div>
    );
}

/** Bolalarini ketma-ket chiqaradi (har biri `StaggerItem`). */
export function Stagger({
    children,
    className,
    step = 0.07,
}: {
    children: ReactNode;
    className?: string;
    step?: number;
}) {
    const style: Vars = step !== 0.07 ? { "--stagger-step": `${step}s` } : {};

    return (
        <div data-stagger className={className} style={style} suppressHydrationWarning>
            {children}
        </div>
    );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
    return <div className={className}>{children}</div>;
}

export { CountUp } from "./count-up";
