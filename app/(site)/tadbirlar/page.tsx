import type { Metadata } from "next";
import Link from "next/link";

import { Icon } from "@/components/icon";
import { PageHero } from "@/components/page-hero";
import { Stagger, StaggerItem } from "@/components/motion-primitives";
import { getEvents } from "@/lib/api";
import { dayAndMonth, formatTime } from "@/lib/format";
import { toneClass } from "@/lib/tone";
import type { Event } from "@/lib/types";

export const metadata: Metadata = {
    title: "Tadbirlar",
    description: "Trening, forum va uchrashuvlar. Bir bosishda ro'yxatdan o'ting.",
};

const FILTERS = [
    { value: "kelgusi", label: "Yaqin kunlarda" },
    { value: "otgan", label: "O'tgan" },
    { value: "", label: "Barchasi" },
];

export default async function EventsPage({ searchParams }: PageProps<"/tadbirlar">) {
    const params = await searchParams;
    const holat = typeof params.holat === "string" ? params.holat : "kelgusi";

    const page = await getEvents({ holat: holat || undefined }).catch(() => null);
    const events = page?.results ?? [];

    const seats = events
        .filter((event) => !event.is_past)
        .reduce((total, event) => total + event.seats_left, 0);

    return (
        <>
            <PageHero
                eyebrow="Tadbirlar"
                title={
                    <>
                        Uchrashuv, trening, <span className="text-accent">forum</span>
                    </>
                }
                lead="Bir bosishda ro'yxatdan o'ting va joyingizni band qiling. Yozilgan tadbirlaringiz kabinetda saqlanadi."
            />

            <section className="container-page py-8 md:py-10">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-6">
                    <div className="flex gap-1 rounded-full border border-line p-1 text-[12.5px]">
                        {FILTERS.map((item) => (
                            <Link
                                key={item.label}
                                href={
                                    item.value
                                        ? `/tadbirlar?holat=${item.value}`
                                        : "/tadbirlar?holat="
                                }
                                scroll={false}
                                className={
                                    holat === item.value
                                        ? "rounded-full bg-invert px-4 py-1.5 font-medium text-on-invert"
                                        : "rounded-full px-4 py-1.5 text-muted transition-colors hover:text-text"
                                }
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    <span className="text-[13px] text-faint">{page?.count ?? 0} ta tadbir</span>
                </div>

                {events.length ? (
                    <Stagger className="grid gap-5 md:grid-cols-2">
                        {events.map((event) => (
                            <StaggerItem key={event.id}>
                                <EventCard event={event} />
                            </StaggerItem>
                        ))}
                    </Stagger>
                ) : (
                    <div className="rounded-2xl border border-dashed border-line py-20 text-center">
                        <span className="tone-blue mx-auto grid size-14 place-items-center rounded-2xl bg-tone-soft">
                            <Icon
                                name="calendar"
                                size={24}
                                className="text-tone-text"
                                strokeWidth={1.5}
                            />
                        </span>
                        <p className="mt-4 text-[14px] text-muted">
                            {holat === "otgan"
                                ? "O'tgan tadbir yo'q."
                                : "Rejalashtirilgan tadbir yo'q."}
                        </p>
                    </div>
                )}
            </section>
        </>
    );
}

function EventCard({ event }: { event: Event }) {
    const { day, month } = dayAndMonth(event.starts_at);
    const almostFull = !event.is_past && event.fill_percent >= 80;

    return (
        <Link
            href={`/tadbirlar/${event.slug}`}
            className={`${toneClass(event.slug)} group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-raised transition-all duration-300 hover:-translate-y-0.5 hover:border-tone-line hover:shadow-[0_16px_40px_-20px_var(--tone)]`}
        >
            {/* Rangli sarlavha maydoni: sana, nom va holat */}
            <div className="flex items-start gap-4 border-b border-tone-line bg-tone-soft p-5">
                <span className="grid size-16 shrink-0 place-content-center rounded-xl border border-tone-line bg-page text-center leading-none">
                    <span className="text-2xl font-semibold tabular-nums text-tone-text">
                        {day}
                    </span>
                    <span className="mt-1 text-[10.5px] uppercase tracking-wide text-muted">
                        {month}
                    </span>
                </span>

                <span className="min-w-0 flex-1">
                    <span className="block text-[16.5px] font-semibold leading-snug">
                        {event.title}
                    </span>
                    <span className="mt-2 flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[12.5px] text-muted">
                        <span className="inline-flex items-center gap-1.5">
                            <Icon name="clock" size={12} />
                            {formatTime(event.starts_at)}
                        </span>
                        <span className="inline-flex min-w-0 items-center gap-1.5">
                            <Icon name="pin" size={12} />
                            <span className="truncate">{event.location}</span>
                        </span>
                    </span>
                </span>

                {event.is_past ? (
                    <span className="shrink-0 rounded-full bg-page px-2.5 py-1 text-[11px] text-faint">
                        O&apos;tgan
                    </span>
                ) : (
                    almostFull && (
                        <span className="shrink-0 rounded-full bg-warn-soft px-2.5 py-1 text-[11px] font-medium text-warn-text">
                            Joy tugayapti
                        </span>
                    )
                )}
            </div>

            <div className="flex flex-1 flex-col p-5">
                {event.description && (
                    <p className="line-clamp-2 flex-1 text-[13.5px] leading-relaxed text-muted">
                        {event.description}
                    </p>
                )}

                {!event.is_past && (
                    <div className="mt-5">
                        <div className="flex items-baseline justify-between text-[12px]">
                            <span className="text-muted">
                                <span className="font-semibold tabular-nums text-text">
                                    {event.seats_left}
                                </span>{" "}
                                joy qoldi
                            </span>
                            <span className="tabular-nums text-faint">
                                {event.registered_count}/{event.capacity}
                            </span>
                        </div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface">
                            <div
                                className="h-full rounded-full bg-tone transition-[width] duration-700"
                                style={{ width: `${event.fill_percent}%` }}
                            />
                        </div>
                    </div>
                )}

                <span className="mt-5 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-tone-text">
                    {event.is_past ? "Tadbir haqida" : "Ro'yxatdan o'tish"}
                    <Icon
                        name="arrowRight"
                        size={13}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                </span>
            </div>
        </Link>
    );
}
