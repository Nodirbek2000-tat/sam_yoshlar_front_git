import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Icon, type IconName } from "@/components/icon";
import {
    LAUREATE_LOGO,
    LaureateCard,
    LaureateCover,
    NationalBadge,
    YearPill,
} from "@/components/laureates/laureate-ui";
import { Reveal } from "@/components/motion-primitives";
import { FounderAvatar } from "@/components/office/office-ui";
import { ApiError, getLaureate } from "@/lib/api";
import { shareMetadata } from "@/lib/seo";

export const revalidate = 120;

export async function generateStaticParams() {
    return [];
}

async function load(id: string) {
    if (!/^\d+$/.test(id)) return null;
    try {
        return await getLaureate(id);
    } catch (error) {
        if (error instanceof ApiError && error.status === 404) return null;
        throw error;
    }
}

export async function generateMetadata({ params }: PageProps<"/mirzo-ulugbek-vorislari/[id]">): Promise<Metadata> {
    const item = await load((await params).id).catch(() => null);
    if (!item) return { title: "Mirzo Ulug'bek vorislari" };
    return shareMetadata({
        title: `${item.project_name} — Mirzo Ulug'bek vorislari`,
        description: item.about || `${item.full_name}, ${item.year}-yil g'olibi`,
        image: LAUREATE_LOGO.share,
        path: `/mirzo-ulugbek-vorislari/${item.id}`,
    });
}

export default async function LaureatePage({ params }: PageProps<"/mirzo-ulugbek-vorislari/[id]">) {
    const item = await load((await params).id);
    if (!item) notFound();

    const paragraphs = item.about
        .split(/\n+/)
        .map((line) => line.trim())
        .filter(Boolean);

    return (
        <article className="tone-blue">
            {/* ---------------------------------------------------- loyiha */}
            <header className="relative overflow-hidden border-b border-line">
                <div
                    aria-hidden
                    className="pointer-events-none absolute -right-40 -top-40 size-[34rem] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--tone)_18%,transparent),transparent_68%)]"
                />
                <div className="grid-lines absolute inset-0 opacity-[0.3] [mask-image:radial-gradient(70%_60%_at_50%_0%,#000,transparent)]" />

                <div className="container-page relative grid gap-10 py-10 md:py-14 lg:grid-cols-[1.1fr_1fr] lg:items-center">
                    <Reveal>
                        <Link
                            href="/mirzo-ulugbek-vorislari"
                            className="inline-flex items-center gap-1.5 text-[13px] text-muted transition-colors hover:text-text"
                        >
                            <Icon name="arrowLeft" size={14} />
                            Mirzo Ulug&apos;bek vorislari
                        </Link>

                        <div className="mt-5 flex flex-wrap items-center gap-2">
                            <YearPill year={item.year} className="border border-line" />
                            {item.is_national_winner && <NationalBadge />}
                        </div>

                        <h1 className="mt-4 text-[2.2rem] font-semibold leading-[1.06] tracking-tight sm:text-5xl">
                            {item.project_name}
                        </h1>

                        <div className="mt-5 space-y-3 text-[15.5px] leading-relaxed text-muted">
                            {paragraphs.length ? (
                                paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)
                            ) : (
                                <p>Loyiha haqida ma&apos;lumot hali kiritilmagan.</p>
                            )}
                        </div>

                        <p className="mt-6 text-[13px] text-faint">
                            «Mirzo Ulug&apos;bek vorislari» respublika tanlovi, Samarqand viloyati bosqichi — {item.year}-yil
                        </p>
                    </Reveal>

                    <Reveal delay={0.1}>
                        <div className="relative overflow-hidden rounded-[2rem] border border-line shadow-[0_30px_70px_-40px_var(--tone)]">
                            <LaureateCover shape="wide" priority className="aspect-[4/3]" />
                        </div>
                    </Reveal>
                </div>
            </header>

            {/* ---------------------------------------------------- g'olib */}
            <section className="container-page py-10 md:py-14">
                <Reveal>
                    <div className="relative overflow-hidden rounded-[2rem] border border-line bg-raised p-6 md:p-8">
                        <div
                            aria-hidden
                            className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--tone)_16%,transparent),transparent_70%)]"
                        />
                        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
                            <FounderAvatar item={item} size={112} className="ring-4 ring-tone-soft" />
                            <div className="min-w-0 flex-1">
                                <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-tone-text">
                                    Tanlov g&apos;olibi
                                </p>
                                <h2 className="mt-1.5 text-2xl font-semibold tracking-tight md:text-[1.75rem]">
                                    {item.full_name}
                                </h2>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {item.age ? <Fact icon="user" text={`${item.age} yosh`} /> : null}
                                    {item.district ? <Fact icon="pin" text={item.district} /> : null}
                                    {item.education_place ? (
                                        <Fact
                                            icon="graduation"
                                            text={item.course ? `${item.education_place}, ${item.course}` : item.education_place}
                                        />
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    </div>
                </Reveal>

                {item.related.length > 0 && (
                    <div className="mt-14">
                        <div className="flex items-end justify-between gap-4">
                            <h2 className="text-2xl font-semibold tracking-tight">
                                {item.year}-yilning boshqa g&apos;oliblari
                            </h2>
                            <Link
                                href={`/mirzo-ulugbek-vorislari?yil=${item.year}`}
                                className="hidden shrink-0 items-center gap-1.5 text-[13.5px] font-medium text-accent hover:underline sm:inline-flex"
                            >
                                Barchasi
                                <Icon name="arrowRight" size={13} />
                            </Link>
                        </div>
                        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            {item.related.map((related) => (
                                <LaureateCard key={related.id} item={related} />
                            ))}
                        </div>
                    </div>
                )}
            </section>
        </article>
    );
}

function Fact({ icon, text }: { icon: IconName; text: string }) {
    return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-[13px] text-muted">
            <Icon name={icon} size={14} />
            {text}
        </span>
    );
}
