import Link from "next/link";

import type { Direction } from "@/lib/types";

/**
 * Hero ostidagi cheksiz lenta: 14 yo'nalish 3D rasmi va nomi bilan.
 *
 * Faqat CSS bilan harakatlanadi (JS kerak emas). Ro'yxat ikki marta
 * chiziladi — birinchisi chiqib ketganda ikkinchisi uning o'rnida
 * turadi, shuning uchun uzilish sezilmaydi. Ustiga kelinsa to'xtaydi.
 */
export function DirectionMarquee({ directions }: { directions: Direction[] }) {
    if (!directions.length) return null;

    const items = [...directions, ...directions];

    return (
        <section
            aria-label="Yo'nalishlar"
            className="marquee relative overflow-hidden border-b border-line py-6 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]"
        >
            <ul className="marquee-track gap-3">
                {items.map((direction, index) => (
                    <li key={`${direction.id}-${index}`} aria-hidden={index >= directions.length}>
                        <Link
                            href={`/tashabbuslar/yoshlar?yonalish=${direction.id}`}
                            tabIndex={index >= directions.length ? -1 : undefined}
                            className="group flex items-center gap-3 rounded-full border border-line bg-raised py-1.5 pl-1.5 pr-5 transition-colors duration-300 hover:border-current"
                            style={{ color: direction.color }}
                        >
                            <span
                                className="grid size-11 place-items-center rounded-full"
                                style={{
                                    background: `color-mix(in oklab, ${direction.color} 14%, transparent)`,
                                }}
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={`/yonalish/sm/${direction.id}.webp`}
                                    alt=""
                                    width={40}
                                    height={40}
                                    loading="lazy"
                                    className="size-9 object-contain transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6"
                                />
                            </span>
                            <span className="whitespace-nowrap text-[14px] font-medium text-text">
                                {direction.name}
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>
        </section>
    );
}
