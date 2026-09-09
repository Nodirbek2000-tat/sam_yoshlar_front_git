import Link from "next/link";

import { EmptyState, PageHead, RowList } from "@/components/cabinet/ui";
import { Icon } from "@/components/icon";
import { dayAndMonth, formatTime } from "@/lib/format";
import { meFetch } from "@/lib/me";
import type { Event } from "@/lib/types";

type MyEvent = Event & { registered_at: string; is_upcoming: boolean };

export default async function MyEventsPage() {
    const data = await meFetch<{ count: number; results: MyEvent[] }>(
        "/events/",
        "/kabinet/tadbirlarim",
    );

    const upcoming = data.results.filter((row) => row.is_upcoming);
    const past = data.results.filter((row) => !row.is_upcoming);

    return (
        <>
            <PageHead
                title="Tadbirlarim"
                subtitle={
                    data.count
                        ? `${upcoming.length} ta yaqin, ${past.length} ta o'tgan`
                        : "Hali tadbirga yozilmagansiz"
                }
            />

            {data.results.length ? (
                <div className="space-y-10">
                    {upcoming.length > 0 && (
                        <section>
                            <h3 className="pb-3 text-[12px] font-medium uppercase tracking-[0.1em] text-faint">
                                Yaqin kunlarda
                            </h3>
                            <RowList>
                                {upcoming.map((event) => (
                                    <EventRow key={event.id} event={event} />
                                ))}
                            </RowList>
                        </section>
                    )}

                    {past.length > 0 && (
                        <section>
                            <h3 className="pb-3 text-[12px] font-medium uppercase tracking-[0.1em] text-faint">
                                O&apos;tgan tadbirlar
                            </h3>
                            <RowList>
                                {past.map((event) => (
                                    <EventRow key={event.id} event={event} muted />
                                ))}
                            </RowList>
                        </section>
                    )}
                </div>
            ) : (
                <EmptyState
                    icon="calendar"
                    title="Tadbirga yozilmagansiz"
                    text="Trening, forum va uchrashuvlarga bir bosishda yozilib, joyingizni band qiling."
                    href="/tadbirlar"
                    action="Tadbirlarni ko'rish"
                />
            )}
        </>
    );
}

function EventRow({ event, muted }: { event: MyEvent; muted?: boolean }) {
    const { day, month } = dayAndMonth(event.starts_at);

    return (
        <Link
            href={`/tadbirlar/${event.slug}`}
            className={`flex items-center gap-4 py-4 transition-opacity hover:opacity-70 ${muted ? "opacity-60" : ""}`}
        >
            <span className="grid size-12 shrink-0 place-content-center rounded-lg border border-line text-center leading-none">
                <span className="text-[15px] font-semibold tabular-nums">{day}</span>
                <span className="mt-0.5 text-[10px] uppercase tracking-wide text-faint">
                    {month}
                </span>
            </span>

            <span className="min-w-0 flex-1">
                <span className="line-clamp-1 block text-[14.5px] font-medium">
                    {event.title}
                </span>
                <span className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-0.5 text-[12.5px] text-faint">
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

            <Icon name="arrowRight" size={15} className="hidden shrink-0 text-faint sm:block" />
        </Link>
    );
}
