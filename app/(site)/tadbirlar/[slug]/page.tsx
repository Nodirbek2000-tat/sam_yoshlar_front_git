import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { RegisterButton } from "@/components/events/register-button";
import { Icon, type IconName } from "@/components/icon";
import { Reveal } from "@/components/motion-primitives";
import { ApiError, apiFetch } from "@/lib/api";
import { formatDate, formatTime } from "@/lib/format";
import { getAccessToken, getCurrentUser } from "@/lib/session";
import { toneClass } from "@/lib/tone";
import type { Event } from "@/lib/types";

/** Tafsilotni token bilan olamiz — `is_registered` shunda to'g'ri keladi. */
async function loadEvent(slug: string) {
    const token = await getAccessToken();
    return apiFetch<Event>(`/events/${slug}/`, { token, revalidate: 0 });
}

export async function generateMetadata({
    params,
}: PageProps<"/tadbirlar/[slug]">): Promise<Metadata> {
    try {
        const event = await loadEvent((await params).slug);
        return { title: event.title, description: event.description?.slice(0, 150) };
    } catch {
        return { title: "Tadbir" };
    }
}

export default async function EventPage({ params }: PageProps<"/tadbirlar/[slug]">) {
    const { slug } = await params;

    let event: Event;
    try {
        event = await loadEvent(slug);
    } catch (error) {
        if (error instanceof ApiError) notFound();
        throw error;
    }

    const user = await getCurrentUser();

    return (
        <article className={toneClass(event.slug)}>
            <header className="relative overflow-hidden border-b border-line">
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.16]"
                    style={{
                        background:
                            "radial-gradient(44rem 22rem at 20% -25%, var(--tone), transparent 65%)",
                    }}
                />

                <div className="container-page relative py-9 md:py-11">
                    <Link
                        href="/tadbirlar"
                        className="group inline-flex items-center gap-1.5 text-[13px] text-muted transition-colors hover:text-text"
                    >
                        <Icon
                            name="arrowLeft"
                            size={14}
                            className="transition-transform duration-200 group-hover:-translate-x-0.5"
                        />
                        Tadbirlar
                    </Link>

                    <Reveal className="mt-7 grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
                        <div className="max-w-2xl">
                            <div className="flex flex-wrap items-center gap-2">
                                {event.is_past ? (
                                    <span className="rounded-full border border-line px-3 py-1 text-[11.5px] text-faint">
                                        O&apos;tgan tadbir
                                    </span>
                                ) : (
                                    <span className="rounded-full bg-tone-soft px-3 py-1 text-[11.5px] font-medium text-tone-text">
                                        Ochiq ro&apos;yxat
                                    </span>
                                )}
                                {event.region_display && (
                                    <span className="rounded-full border border-line px-3 py-1 text-[11.5px] text-muted">
                                        {event.region_display}
                                    </span>
                                )}
                            </div>

                            <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl md:text-5xl">
                                {event.title}
                            </h1>

                            <dl className="mt-8 grid gap-3 sm:grid-cols-2">
                                <Fact icon="calendar" label="Sana">
                                    {formatDate(event.starts_at)}
                                </Fact>
                                <Fact icon="clock" label="Vaqt">
                                    {formatTime(event.starts_at)}
                                    {event.ends_at && ` — ${formatTime(event.ends_at)}`}
                                </Fact>
                                <Fact icon="pin" label="Manzil">
                                    {event.location}
                                </Fact>
                                <Fact icon="users" label="Ishtirokchilar">
                                    {event.registered_count} / {event.capacity}
                                </Fact>
                            </dl>
                        </div>

                        {/* Yon panel: ro'yxat holati va tugma */}
                        <div className="lg:w-80">
                            {event.image && (
                                <div className="mb-5 overflow-hidden rounded-2xl border border-line">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={event.image}
                                        alt=""
                                        className="aspect-[4/3] w-full object-cover"
                                    />
                                </div>
                            )}

                            <div className="rounded-2xl border border-tone-line bg-tone-soft p-5">
                                {!event.is_past && (
                                    <>
                                        <div className="flex items-baseline justify-between">
                                            <span className="text-[13px] text-muted">
                                                Joylar band
                                            </span>
                                            <span className="text-[15px] font-semibold tabular-nums text-tone-text">
                                                {event.fill_percent}%
                                            </span>
                                        </div>
                                        <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-page">
                                            <div
                                                className="h-full rounded-full bg-tone transition-[width] duration-700"
                                                style={{ width: `${event.fill_percent}%` }}
                                            />
                                        </div>
                                        <p className="mt-2.5 text-[12.5px] text-muted">
                                            {event.seats_left} joy qoldi
                                        </p>
                                    </>
                                )}

                                <div className={event.is_past ? "" : "mt-5"}>
                                    <RegisterButton
                                        slug={event.slug}
                                        registered={Boolean(event.is_registered)}
                                        seatsLeft={event.seats_left}
                                        isFull={event.is_full}
                                        isPast={event.is_past}
                                        canRegister={Boolean(user)}
                                    />
                                </div>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </header>

            {event.description && (
                <div className="container-page py-8 md:py-10">
                    <Reveal className="max-w-2xl space-y-4 text-[15.5px] leading-[1.8] text-muted">
                        {event.description
                            .split("\n")
                            .filter(Boolean)
                            .map((line, index) => (
                                <p key={index}>{line}</p>
                            ))}
                    </Reveal>
                </div>
            )}
        </article>
    );
}

function Fact({
    icon,
    label,
    children,
}: {
    icon: IconName;
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex gap-3 rounded-xl border border-line bg-raised px-4 py-3">
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-tone-soft">
                <Icon name={icon} size={15} className="text-tone-text" />
            </span>
            <div className="min-w-0">
                <dt className="text-[11.5px] text-faint">{label}</dt>
                <dd className="mt-0.5 text-[14px]">{children}</dd>
            </div>
        </div>
    );
}
