import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CategoryIcon } from "@/components/category-icon";
import { Icon } from "@/components/icon";
import { Reveal } from "@/components/motion-primitives";
import { ApiError, getPeer } from "@/lib/api";
import { toneClass } from "@/lib/tone";

export async function generateMetadata({
    params,
}: PageProps<"/tengdoshlar/[id]">): Promise<Metadata> {
    try {
        const peer = await getPeer((await params).id);
        return {
            title: `${peer.full_name} — ${peer.country_name}`,
            description: peer.about.slice(0, 150),
        };
    } catch {
        return { title: "Tengdosh" };
    }
}

export default async function PeerPage({ params }: PageProps<"/tengdoshlar/[id]">) {
    const { id } = await params;

    let peer;
    try {
        peer = await getPeer(id);
    } catch (error) {
        if (error instanceof ApiError) notFound();
        throw error;
    }

    return (
        <article className={toneClass(peer.purpose)}>
            <header className="relative overflow-hidden border-b border-line">
                {/* Davlat rangidagi yog'du */}
                <div
                    className="pointer-events-none absolute inset-0 opacity-20"
                    style={{
                        background: `radial-gradient(40rem 20rem at 18% -25%, ${peer.country_color}, transparent 62%)`,
                    }}
                />

                <div className="container-page relative py-9 md:py-11">
                    <Link
                        href="/tengdoshlar"
                        className="group inline-flex items-center gap-1.5 text-[13px] text-muted transition-colors hover:text-text"
                    >
                        <Icon
                            name="arrowLeft"
                            size={14}
                            className="transition-transform duration-200 group-hover:-translate-x-0.5"
                        />
                        Tengdoshlar
                    </Link>

                    <Reveal className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-center">
                        <span
                            className="grid size-24 shrink-0 place-items-center overflow-hidden rounded-2xl text-2xl font-semibold text-white sm:size-28"
                            style={{ background: peer.country_color }}
                        >
                            {peer.photo ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img src={peer.photo} alt="" className="size-full object-cover" />
                            ) : (
                                peer.initials
                            )}
                        </span>

                        <div className="min-w-0">
                            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                                {peer.full_name}
                            </h1>

                            <div className="mt-4 flex flex-wrap items-center gap-2">
                                <span
                                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-medium text-white"
                                    style={{ background: peer.country_color }}
                                >
                                    <Icon name="pin" size={12} />
                                    {peer.city ? `${peer.city}, ` : ""}
                                    {peer.country_name}
                                </span>

                                <span className="inline-flex items-center gap-1.5 rounded-full bg-tone-soft px-3 py-1.5 text-[12.5px] font-medium text-tone-text">
                                    <CategoryIcon slug={peer.purpose_icon} size={13} />
                                    {peer.purpose_display}
                                </span>

                                {peer.since_year && (
                                    <span className="rounded-full border border-line px-3 py-1.5 text-[12.5px] text-muted">
                                        {peer.since_year}-yildan beri
                                    </span>
                                )}
                            </div>
                        </div>
                    </Reveal>
                </div>
            </header>

            <div className="container-page grid gap-10 py-10 md:py-12 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-14">
                <Reveal className="min-w-0">
                    <h2 className="text-[12px] font-medium uppercase tracking-[0.1em] text-faint">
                        O&apos;zi haqida
                    </h2>
                    <div className="mt-4 space-y-4 text-[15.5px] leading-[1.8] text-muted">
                        {peer.about
                            .split("\n")
                            .filter(Boolean)
                            .map((line, index) => (
                                <p key={index}>{line}</p>
                            ))}
                    </div>

                    {peer.can_help && (
                        <div className="mt-9 overflow-hidden rounded-2xl border border-tone-line bg-tone-soft">
                            <div className="flex items-center gap-2.5 border-b border-tone-line px-5 py-3.5">
                                <span className="grid size-7 place-items-center rounded-lg bg-page">
                                    <Icon name="spark" size={14} className="text-tone-text" />
                                </span>
                                <h2 className="text-[13px] font-semibold text-tone-text">
                                    Nimada yordam bera oladi
                                </h2>
                            </div>
                            <p className="px-5 py-4 text-[14.5px] leading-relaxed">
                                {peer.can_help}
                            </p>
                        </div>
                    )}
                </Reveal>

                <Reveal delay={0.1} className="lg:sticky lg:top-24 lg:self-start">
                    <dl className="divide-y divide-line overflow-hidden rounded-2xl border border-line">
                        {peer.institution && (
                            <Row label="Universitet / kompaniya" value={peer.institution} />
                        )}
                        {peer.field && <Row label="Yo'nalish" value={peer.field} />}
                        {peer.home_region_display && (
                            <Row label="Vatanidagi hudud" value={peer.home_region_display} />
                        )}
                        <Row label="Davlat" value={peer.country_name} />
                    </dl>

                    <Link
                        href="/tengdoshlar"
                        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-line px-5 py-2.5 text-[13.5px] font-medium transition-colors hover:bg-surface"
                    >
                        <Icon name="users" size={15} />
                        Boshqa tengdoshlar
                    </Link>
                </Reveal>
            </div>
        </article>
    );
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="px-5 py-3.5">
            <dt className="text-[11.5px] text-faint">{label}</dt>
            <dd className="mt-0.5 text-[14px]">{value}</dd>
        </div>
    );
}
