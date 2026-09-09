"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { Icon } from "@/components/icon";
import { cn } from "@/lib/cn";
import type { Direction } from "@/lib/types";

/**
 * Yo'nalishlar lentasi.
 *
 * 14 ta yo'nalish ekranga sig'maydi, shuning uchun gorizontal aylanadi.
 * Aylanishi bilinib turishi uchun uch narsa bor:
 *   - chetlarda o'chib boruvchi soya — orqada yana bor degani,
 *   - o'q tugmalari (sichqoncha bilan ham surish mumkin),
 *   - g'ildirakni tik burasa ham yon tomonga suriladi.
 *
 * Tanlangan yo'nalish ochilganda o'zi ko'rinadigan joyga suriladi.
 */
export function DirectionRail({ directions }: { directions: Direction[] }) {
    const params = useSearchParams();
    const active = params.get("yonalish");

    const scroller = useRef<HTMLDivElement>(null);
    const [edges, setEdges] = useState({ left: false, right: false });

    const total = directions.reduce((sum, item) => sum + item.ideas, 0);

    /** Chetlarda yana kontent bor-yo'qligini hisoblaydi. */
    const measure = useCallback(() => {
        const node = scroller.current;
        if (!node) return;

        const max = node.scrollWidth - node.clientWidth;
        setEdges({
            left: node.scrollLeft > 4,
            right: node.scrollLeft < max - 4,
        });
    }, []);

    useEffect(() => {
        const node = scroller.current;
        if (!node) return;

        measure();

        const observer = new ResizeObserver(measure);
        observer.observe(node);
        window.addEventListener("resize", measure);

        return () => {
            observer.disconnect();
            window.removeEventListener("resize", measure);
        };
    }, [measure, directions.length]);

    // Tanlangan chip ko'rinadigan joyga sursin
    useEffect(() => {
        const node = scroller.current;
        if (!node) return;

        const chip = node.querySelector<HTMLElement>("[data-active='true']");
        if (chip) {
            node.scrollTo({
                left: chip.offsetLeft - node.clientWidth / 2 + chip.clientWidth / 2,
                behavior: "smooth",
            });
        }
    }, [active]);

    function nudge(direction: -1 | 1) {
        const node = scroller.current;
        if (!node) return;
        node.scrollBy({ left: direction * node.clientWidth * 0.7, behavior: "smooth" });
    }

    return (
        <div className="relative -mx-5 md:-mx-8">
            {/* Chap chekka */}
            <Edge side="left" show={edges.left} onClick={() => nudge(-1)} />

            <div
                ref={scroller}
                onScroll={measure}
                onWheel={(event) => {
                    // Sichqoncha g'ildiragi tik buraladi — biz uni yonga o'giramiz
                    if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
                        scroller.current?.scrollBy({ left: event.deltaY });
                    }
                }}
                className="overflow-x-auto scroll-smooth px-5 [scrollbar-width:none] md:px-8 [&::-webkit-scrollbar]:hidden"
            >
                <div className="flex w-max gap-1.5 pb-1">
                    <Chip
                        href="/tashabbuslar/yoshlar"
                        active={!active}
                        label="Barchasi"
                        count={total}
                    />

                    {directions.map((item) => (
                        <Chip
                            key={item.id}
                            href={`/tashabbuslar/yoshlar?yonalish=${item.id}`}
                            active={active === item.id}
                            label={item.name}
                            count={item.ideas}
                            color={item.color}
                        />
                    ))}
                </div>
            </div>

            {/* O'ng chekka */}
            <Edge side="right" show={edges.right} onClick={() => nudge(1)} />
        </div>
    );
}

/** Chetdagi soya va o'q tugmasi — faqat surish mumkin bo'lganda ko'rinadi. */
function Edge({
    side,
    show,
    onClick,
}: {
    side: "left" | "right";
    show: boolean;
    onClick: () => void;
}) {
    const left = side === "left";

    return (
        <div
            aria-hidden={!show}
            className={cn(
                "pointer-events-none absolute inset-y-0 z-10 flex w-20 items-center transition-opacity duration-200",
                left ? "left-0 justify-start pl-1.5" : "right-0 justify-end pr-1.5",
                show ? "opacity-100" : "opacity-0",
            )}
            style={{
                background: `linear-gradient(to ${left ? "right" : "left"}, var(--page) 35%, transparent)`,
            }}
        >
            <button
                type="button"
                tabIndex={show ? 0 : -1}
                onClick={onClick}
                aria-label={left ? "Chapga surish" : "O'ngga surish"}
                className={cn(
                    "grid size-8 place-items-center rounded-full border border-line bg-page text-muted shadow-sm transition-colors hover:text-text",
                    show ? "pointer-events-auto" : "pointer-events-none",
                )}
            >
                <Icon name={left ? "arrowLeft" : "arrowRight"} size={15} />
            </button>
        </div>
    );
}

function Chip({
    href,
    active,
    label,
    count,
    color,
}: {
    href: string;
    active: boolean;
    label: string;
    count: number;
    color?: string;
}) {
    return (
        <Link
            href={href}
            scroll={false}
            data-active={active}
            className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-[13px] transition-colors duration-150",
                active
                    ? "border-transparent bg-invert text-on-invert"
                    : "border-line text-muted hover:border-ink-300 hover:text-text",
            )}
        >
            {color && (
                <span
                    className="size-1.5 rounded-full"
                    style={{ background: active ? "currentColor" : color }}
                />
            )}
            {label}
            <span className={cn("tabular-nums", active ? "opacity-60" : "text-faint")}>
                {count}
            </span>
        </Link>
    );
}
