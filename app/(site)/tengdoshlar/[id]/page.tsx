import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CategoryIcon } from "@/components/category-icon";
import { Icon, type IconName } from "@/components/icon";
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
                    {/* Ta'lim — bir qarashda */}
                    <div className="grid gap-3 sm:grid-cols-3">
                        <Fact icon="bank" label="Universitet" value={peer.institution} />
                        <Fact
                            icon="spark"
                            label="Kurs"
                            value={peer.course ? `${peer.course}-kurs` : ""}
                        />
                        <Fact icon="doc" label="Yo'nalish" value={peer.field} />
                    </div>

                    {peer.achievements && (
                        <div className="mt-8 overflow-hidden rounded-2xl border border-line bg-raised">
                            <div className="tone-amber flex items-center gap-2.5 border-b border-line px-5 py-3.5">
                                <span className="grid size-7 place-items-center rounded-lg bg-tone-soft">
                                    <Icon name="spark" size={14} className="text-tone-text" />
                                </span>
                                <h2 className="text-[13px] font-semibold">Yutuqlari</h2>
                            </div>
                            <p className="whitespace-pre-line px-5 py-4 text-[15px] leading-[1.8] text-muted">
                                {peer.achievements}
                            </p>
                        </div>
                    )}

                    {peer.about && (
                        <>
                            <h2 className="mt-9 text-[12px] font-medium uppercase tracking-[0.1em] text-faint">
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
                        </>
                    )}

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
                    {(peer.phone || peer.telegram || peer.email) && (
                        <div className="mb-4 overflow-hidden rounded-2xl border border-line">
                            <p className="border-b border-line px-5 py-3 text-[12px] font-medium uppercase tracking-[0.1em] text-faint">
                                Bog&apos;lanish
                            </p>
                            <div className="grid gap-1 p-2">
                                {peer.telegram && (
                                    <Contact
                                        href={`https://t.me/${peer.telegram}`}
                                        icon="telegram"
                                        label={`@${peer.telegram}`}
                                    />
                                )}
                                {peer.phone && (
                                    <Contact
                                        href={`tel:${peer.phone.replace(/[^\d+]/g, "")}`}
                                        icon="phone"
                                        label={peer.phone}
                                    />
                                )}
                                {peer.email && (
                                    <Contact href={`mailto:${peer.email}`} icon="mail" label={peer.email} />
                                )}
                            </div>
                        </div>
                    )}

                    <dl className="divide-y divide-line overflow-hidden rounded-2xl border border-line">
                        {peer.institution && (
                            <Row label="Universitet" value={peer.institution} />
                        )}
                        {peer.field && <Row label="Yo'nalish" value={peer.field} />}
                        {peer.age && <Row label="Yoshi" value={`${peer.age} yosh`} />}
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

function Fact({ icon, label, value }: { icon: IconName; label: string; value: string }) {
    if (!value) return null;
    return (
        <div className="rounded-2xl border border-line bg-raised p-4 transition-colors hover:border-tone-line">
            <span className="grid size-8 place-items-center rounded-lg bg-tone-soft text-tone-text">
                <Icon name={icon} size={15} />
            </span>
            <p className="mt-3 text-[11.5px] text-faint">{label}</p>
            <p className="mt-0.5 text-[14.5px] font-medium leading-snug">{value}</p>
        </div>
    );
}

function Contact({ href, icon, label }: { href: string; icon: IconName; label: string }) {
    return (
        <a
            href={href}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel="noreferrer"
            className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] transition-colors hover:bg-surface"
        >
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-tone-soft text-tone-text transition-transform duration-300 group-hover:scale-110">
                <Icon name={icon} size={15} />
            </span>
            <span className="min-w-0 flex-1 truncate">{label}</span>
            <Icon
                name="arrowRight"
                size={14}
                className="shrink-0 text-faint transition-transform duration-300 group-hover:translate-x-0.5"
            />
        </a>
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
