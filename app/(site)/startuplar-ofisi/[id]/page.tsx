import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Icon } from "@/components/icon";
import { Img } from "@/components/img";
import { Reveal } from "@/components/motion-primitives";
import { FounderAvatar, OfficeCard, SpherePill, StagePill, sphereOf } from "@/components/office/office-ui";
import { ApiError, getOfficeStartup } from "@/lib/api";
import { cn } from "@/lib/cn";
import { shareMetadata } from "@/lib/seo";
import { toneClass } from "@/lib/tone";

export const revalidate = 120;

export async function generateStaticParams() {
    return [];
}

async function load(id: string) {
    if (!/^\d+$/.test(id)) return null;
    try {
        return await getOfficeStartup(id);
    } catch (error) {
        if (error instanceof ApiError && error.status === 404) return null;
        throw error;
    }
}

export async function generateMetadata({ params }: PageProps<"/startuplar-ofisi/[id]">): Promise<Metadata> {
    const item = await load((await params).id).catch(() => null);
    if (!item) return { title: "Startap" };
    return shareMetadata({
        title: `${item.name} — Samarqand startuplar ofisi`,
        description: item.about || `${item.full_name} loyihasi`,
        image: item.project_image ?? item.photo,
        path: `/startuplar-ofisi/${item.id}`,
    });
}

export default async function OfficeStartupPage({ params }: PageProps<"/startuplar-ofisi/[id]">) {
    const item = await load((await params).id);
    if (!item) notFound();

    const sphere = sphereOf(item.sphere);
    const paragraphs = item.about
        .split(/\n+/)
        .map((line) => line.trim())
        .filter(Boolean);

    return (
        <article className={toneClass(sphere.tone)}>
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
                            href="/startuplar-ofisi"
                            className="inline-flex items-center gap-1.5 text-[13px] text-muted transition-colors hover:text-text"
                        >
                            <Icon name="arrowLeft" size={14} />
                            Samarqand startuplar ofisi
                        </Link>

                        <div className="mt-5 flex flex-wrap items-center gap-2">
                            <SpherePill value={item.sphere} />
                            <StagePill value={item.stage} className="border border-line" />
                        </div>

                        <h1 className="mt-4 text-[2.2rem] font-semibold leading-[1.06] tracking-tight sm:text-5xl">
                            {item.name}
                        </h1>

                        <div className="mt-5 space-y-3 text-[15.5px] leading-relaxed text-muted">
                            {paragraphs.length ? (
                                paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)
                            ) : (
                                <p>Loyiha haqida ma&apos;lumot hali kiritilmagan.</p>
                            )}
                        </div>

                        {item.contact_url && (
                            <a
                                href={item.contact_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-8 inline-flex items-center gap-2.5 rounded-full bg-[#2AABEE] px-6 py-3.5 text-[15px] font-semibold text-white shadow-[0_14px_30px_-14px_#2AABEE] transition-transform hover:-translate-y-0.5"
                            >
                                <Icon name="telegram" size={18} />
                                Startap bilan bog&apos;lanish
                            </a>
                        )}
                    </Reveal>

                    <Reveal delay={0.1}>
                        <div className="relative overflow-hidden rounded-[2rem] border border-line bg-tone-soft shadow-[0_30px_70px_-40px_var(--tone)]">
                            {item.project_image ? (
                                // Rasm to'liq ko'rinadi (logo kesilmasin), ortida o'zining xira nusxasi
                                <div className="relative aspect-[4/3]">
                                    <Img
                                        src={item.project_image}
                                        alt=""
                                        sizes="(min-width: 1024px) 520px, 100vw"
                                        maxWidth={640}
                                        className="absolute inset-0 size-full scale-110 object-cover opacity-60 blur-2xl"
                                    />
                                    <Img
                                        src={item.project_image}
                                        alt={item.name}
                                        sizes="(min-width: 1024px) 520px, 100vw"
                                        maxWidth={1080}
                                        priority
                                        className="relative size-full object-contain"
                                    />
                                </div>
                            ) : (
                                <div className="grid aspect-[4/3] place-items-center text-8xl" aria-hidden>
                                    {sphere.emoji}
                                </div>
                            )}
                        </div>
                    </Reveal>
                </div>
            </header>

            {/* ---------------------------------------------------- asoschi */}
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
                                    Loyiha asoschisi
                                </p>
                                <h2 className="mt-1.5 text-2xl font-semibold tracking-tight md:text-[1.75rem]">
                                    {item.full_name}
                                </h2>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {item.age ? <Fact icon="user" text={`${item.age} yosh`} /> : null}
                                    {item.district_display ? <Fact icon="pin" text={item.district_display} /> : null}
                                    <Fact icon="rocket" text={sphere.short} />
                                </div>
                            </div>
                            {item.contact_url && (
                                <a
                                    href={item.contact_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-line bg-page px-5 py-3 text-[14px] font-medium transition-colors hover:border-[#2AABEE] hover:text-[#2AABEE]"
                                >
                                    <Icon name="telegram" size={17} />
                                    Telegram&apos;da yozish
                                </a>
                            )}
                        </div>
                    </div>
                </Reveal>

                {/* Shu sohadagi boshqa loyihalar */}
                {item.related.length > 0 && (
                    <div className="mt-14">
                        <div className="flex items-end justify-between gap-4">
                            <h2 className="text-2xl font-semibold tracking-tight">
                                {sphere.emoji} {sphere.short} sohasidagi boshqa loyihalar
                            </h2>
                            <Link
                                href={`/startuplar-ofisi?soha=${item.sphere}`}
                                className="hidden shrink-0 items-center gap-1.5 text-[13.5px] font-medium text-accent hover:underline sm:inline-flex"
                            >
                                Barchasi
                                <Icon name="arrowRight" size={13} />
                            </Link>
                        </div>
                        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            {item.related.map((related) => (
                                <OfficeCard key={related.id} item={related} />
                            ))}
                        </div>
                    </div>
                )}
            </section>
        </article>
    );
}

function Fact({ icon, text }: { icon: "user" | "pin" | "rocket"; text: string }) {
    return (
        <span className={cn("inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-[13px] text-muted")}>
            <Icon name={icon} size={14} />
            {text}
        </span>
    );
}
