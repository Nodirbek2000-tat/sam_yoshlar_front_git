import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BusinessCard, StartupCard } from "@/components/directory/cards";
import { Icon } from "@/components/icon";
import { PhotoZoom } from "@/components/photo-zoom";
import { Reveal } from "@/components/motion-primitives";
import { ApiError, getPublicProfile } from "@/lib/api";
import { formatDate } from "@/lib/format";

/**
 * Ommaviy profil — Instagramdagidek: rasm, ism, rollar va nimalari bor.
 *
 * Tashkilot taklif yozgan yoshning ismiga bosadi va shu sahifaga tushadi:
 * kimligini ko'radi va bog'lanadi.
 */

const ROLE_TONE: Record<string, string> = {
    Yosh: "indigo",
    Tadbirkor: "amber",
    Startupper: "orange",
    Tashkilot: "violet",
};

export async function generateMetadata({ params }: PageProps<"/insonlar/[id]">): Promise<Metadata> {
    try {
        const person = await getPublicProfile((await params).id);
        return {
            title: person.full_name,
            description: `${person.roles.join(", ")}${person.region_display ? ` · ${person.region_display}` : ""}`,
        };
    } catch {
        return { title: "Profil" };
    }
}

export default async function PersonPage({ params }: PageProps<"/insonlar/[id]">) {
    const { id } = await params;

    let person;
    try {
        person = await getPublicProfile(id);
    } catch (error) {
        if (error instanceof ApiError) notFound();
        throw error;
    }

    const facts = [
        person.region_display,
        person.age ? `${person.age} yosh` : "",
        person.study_location === "abroad" ? "Chet elda o'qiydi" : person.study_location_display,
    ].filter(Boolean);

    return (
        <article>
            <header className="relative overflow-hidden border-b border-line">
                <div aria-hidden className="aurora" />

                <div className="container-page relative py-9 md:py-12">
                    <Reveal className="flex flex-col gap-6 sm:flex-row sm:items-center">
                        <PhotoZoom
                            src={person.avatar}
                            alt={person.full_name}
                            fallback={person.initials}
                            className="size-24 rounded-full bg-invert text-on-invert sm:size-28"
                        />

                        <div className="min-w-0 flex-1">
                            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                                {person.full_name}
                            </h1>

                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                {person.roles.map((role) => (
                                    <span
                                        key={role}
                                        className={`tone-${ROLE_TONE[role] ?? "slate"} rounded-full border border-tone-line bg-tone-soft px-3 py-1 text-[12.5px] font-medium text-tone-text`}
                                    >
                                        {role}
                                    </span>
                                ))}
                                {facts.map((fact) => (
                                    <span
                                        key={fact}
                                        className="rounded-full border border-line px-3 py-1 text-[12.5px] text-muted"
                                    >
                                        {fact}
                                    </span>
                                ))}
                            </div>

                            {person.bio && (
                                <p className="mt-4 max-w-xl text-[14.5px] leading-relaxed text-muted">
                                    {person.bio}
                                </p>
                            )}

                            {person.telegram_username && (
                                <a
                                    href={`https://t.me/${person.telegram_username}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-invert px-5 py-2.5 text-[13.5px] font-medium text-on-invert transition-opacity hover:opacity-90"
                                >
                                    <Icon name="telegram" size={15} />
                                    Telegramda yozish
                                </a>
                            )}
                        </div>
                    </Reveal>
                </div>
            </header>

            <div className="container-page py-8 md:py-10">
                {/* Faolligi */}
                <Reveal>
                    <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-line bg-line">
                        {(
                            [
                                { value: person.stats.initiatives, label: "Tashabbus" },
                                { value: person.stats.solutions, label: "Taklif" },
                                { value: person.stats.votes, label: "Bergan ovoz" },
                            ] as const
                        ).map((item) => (
                            <div key={item.label} className="bg-page p-4 text-center sm:p-5">
                                <dd className="text-[1.6rem] font-semibold tabular-nums tracking-tight">
                                    {item.value}
                                </dd>
                                <dt className="mt-0.5 text-[12px] text-faint">{item.label}</dt>
                            </div>
                        ))}
                    </dl>
                    <p className="mt-3 text-[12.5px] text-faint">
                        Saytda {formatDate(person.joined)} dan beri
                    </p>
                </Reveal>

                {/* Biznesi */}
                {person.business && (
                    <Reveal className="mt-10">
                        <h2 className="text-[15px] font-semibold tracking-tight">Biznesi</h2>
                        <div className="mt-4 sm:max-w-sm">
                            <BusinessCard business={person.business} />
                        </div>
                    </Reveal>
                )}

                {/* Startaplari */}
                {person.startups.length > 0 && (
                    <Reveal className="mt-10">
                        <h2 className="text-[15px] font-semibold tracking-tight">
                            Startaplari
                            <span className="ml-2 text-[13px] font-normal text-muted">
                                {person.startups.length} ta
                            </span>
                        </h2>
                        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {person.startups.map((startup) => (
                                <StartupCard key={startup.id} startup={startup} />
                            ))}
                        </div>
                    </Reveal>
                )}

                {/* Chet eldagi ta'limi */}
                {person.peer && (
                    <Reveal className="mt-10">
                        <h2 className="text-[15px] font-semibold tracking-tight">Chet elda</h2>
                        <Link
                            href={`/tengdoshlar/${person.peer.id}`}
                            className="group mt-4 flex items-center gap-4 rounded-2xl border border-line bg-raised p-4 transition-colors hover:border-accent sm:max-w-sm"
                        >
                            <span
                                className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl text-[13px] font-semibold text-white"
                                style={{ background: person.peer.country_color }}
                            >
                                {person.peer.country_short}
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="block truncate text-[14.5px] font-medium">
                                    {person.peer.institution || person.peer.country_name}
                                </span>
                                <span className="mt-0.5 block truncate text-[12.5px] text-muted">
                                    {[
                                        person.peer.course ? `${person.peer.course}-kurs` : "",
                                        person.peer.field,
                                    ]
                                        .filter(Boolean)
                                        .join(" · ")}
                                </span>
                            </span>
                            <Icon
                                name="arrowRight"
                                size={15}
                                className="shrink-0 text-faint transition-transform group-hover:translate-x-0.5"
                            />
                        </Link>
                    </Reveal>
                )}

                {!person.business && !person.startups.length && !person.peer && (
                    <p className="mt-10 rounded-2xl border border-dashed border-line py-12 text-center text-[13.5px] text-faint">
                        Bu foydalanuvchi hali anketa to&apos;ldirmagan.
                    </p>
                )}
            </div>
        </article>
    );
}
