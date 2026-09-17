import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { Icon } from "@/components/icon";
import { DirectionRail } from "@/components/initiatives/direction-rail";
import { HeroOrbit } from "@/components/initiatives/hero-orbit";
import { IdeaBoard } from "@/components/initiatives/idea-board";
import { SectionTabs } from "@/components/initiatives/section-tabs";
import { CountUp, Reveal } from "@/components/motion-primitives";
import { getDirections, getInitiatives } from "@/lib/api";
import { getCurrentUser } from "@/lib/session";
import type { Direction, Initiative } from "@/lib/types";

export const metadata: Metadata = {
    alternates: { canonical: "/tashabbuslar/yoshlar" },
    title: "Yoshlar tashabbuslari",
    description:
        "14 yo'nalish, tirik ekotizim. G'oyangizni bildiring va ovoz bering — har bir ovoz sahnani o'stiradi.",
};

export default async function InitiativesPage({
    searchParams,
}: PageProps<"/tashabbuslar/yoshlar">) {
    const params = await searchParams;
    const direction = typeof params.yonalish === "string" ? params.yonalish : undefined;
    const order = typeof params.tartib === "string" ? params.tartib : undefined;

    const [directions, page, user] = await Promise.all([
        getDirections().catch(() => [] as Direction[]),
        getInitiatives({ yonalish: direction, tartib: order }).catch(() => null),
        getCurrentUser(),
    ]);

    const active = directions.find((item) => item.id === direction);
    const items: Initiative[] = page?.results ?? [];

    // Sarlavhada sahna doim turadi: yo'nalish tanlanmagan bo'lsa —
    // eng ko'p ovoz yig'gani ko'rsatiladi.
    const featured =
        active ?? [...directions].sort((a, b) => b.votes - a.votes)[0] ?? null;

    const totalIdeas = directions.reduce((sum, item) => sum + item.ideas, 0);
    const totalVotes = directions.reduce((sum, item) => sum + item.votes, 0);

    const scene = featured?.color ?? "var(--accent)";

    return (
        <>
            {/* ---------- Sarlavha ---------- */}
            <section
                className="relative overflow-hidden border-b border-line"
                style={{ ["--scene" as string]: scene }}
            >
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-[0.18]"
                    style={{
                        background: `radial-gradient(50rem 26rem at 78% -20%, ${scene}, transparent 62%)`,
                    }}
                />
                <div aria-hidden className="aurora opacity-60" />
                <div
                    aria-hidden
                    className="grid-lines pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(75%_65%_at_50%_0%,#000,transparent)]"
                />

                <div className="container-page relative py-10 md:py-12">
                    <SectionTabs />

                    <div className="mt-9 grid gap-10 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                        <Reveal className="max-w-xl">
                            <span
                                className="inline-flex items-center gap-2 rounded-full border border-line bg-page/70 px-3 py-1 text-[11.5px] font-medium uppercase tracking-[0.12em] backdrop-blur"
                                style={{ color: active ? active.color : undefined }}
                            >
                                <span
                                    className="size-1.5 rounded-full"
                                    style={{ background: active ? active.color : "var(--accent)" }}
                                />
                                {active ? active.name : "14 yo'nalish"}
                            </span>

                            <h1 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-[3.5rem]">
                                {active ? (
                                    active.title
                                ) : (
                                    <>
                                        Har bir ovoz —{" "}
                                        <span
                                            className="bg-clip-text text-transparent"
                                            style={{
                                                backgroundImage: `linear-gradient(100deg, ${scene}, var(--text))`,
                                            }}
                                        >
                                            bir qadam o&apos;sish
                                        </span>
                                    </>
                                )}
                            </h1>

                            <p className="mt-4 max-w-lg text-[15.5px] leading-relaxed text-muted">
                                {active
                                    ? active.tagline
                                    : "Har bir yo'nalishning o'z tirik ekotizimi bor. Ovoz berilgan sari u to'ladi, o'sadi va shakl oladi."}
                            </p>

                            {/* Jonli raqamlar — kartasiz, faqat chiziq bilan */}
                            <dl className="mt-7 flex flex-wrap items-center gap-x-8 gap-y-4">
                                <Metric
                                    value={active ? active.ideas : totalIdeas}
                                    label="Tashabbus"
                                />
                                <Metric value={active ? active.votes : totalVotes} label="Ovoz" />
                                {active && (
                                    <div className="min-w-40 flex-1">
                                        <div className="flex items-baseline justify-between text-[12px] text-muted">
                                            <span>Sahna to&apos;lishi</span>
                                            <span className="tabular-nums">
                                                {Math.min(
                                                    Math.round(
                                                        (active.votes / (active.max * 8)) * 100,
                                                    ),
                                                    100,
                                                )}
                                                %
                                            </span>
                                        </div>
                                        <div className="energy mt-2 h-1.5 rounded-full">
                                            <span
                                                style={{
                                                    width: `${Math.min(
                                                        (active.votes / (active.max * 8)) * 100,
                                                        100,
                                                    )}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </dl>

                            <Link
                                href="/tashabbuslar/bildirish"
                                className="group mt-8 inline-flex items-center gap-2 rounded-full bg-invert px-5 py-2.5 text-[14px] font-medium text-on-invert transition-opacity hover:opacity-90"
                            >
                                <Icon name="plus" size={15} />
                                Tashabbus bildirish
                            </Link>
                        </Reveal>

                        {featured && (
                            <div className="justify-self-center md:justify-self-end">
                                <HeroOrbit direction={featured} />
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* ---------- Yo'nalishlar lentasi ---------- */}
            <section className="sticky top-15 z-30 border-b border-line bg-page/85 backdrop-blur-xl">
                <div className="container-page py-3">
                    <Suspense fallback={<div className="h-9" />}>
                        <DirectionRail directions={directions} />
                    </Suspense>
                </div>
            </section>

            {/* ---------- Ro'yxat ---------- */}
            <section className="container-page py-8 md:py-10">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-5">
                    <h2 className="text-[15px] font-semibold">
                        {page?.count ?? 0} ta tashabbus
                    </h2>

                    <div className="flex gap-1 rounded-full border border-line p-0.5 text-[12.5px]">
                        <SortLink
                            href={
                                direction
                                    ? `/tashabbuslar/yoshlar?yonalish=${direction}`
                                    : "/tashabbuslar/yoshlar"
                            }
                            active={order !== "yangi"}
                            label="Ko'p ovozli"
                        />
                        <SortLink
                            href={
                                direction
                                    ? `/tashabbuslar/yoshlar?yonalish=${direction}&tartib=yangi`
                                    : "/tashabbuslar/yoshlar?tartib=yangi"
                            }
                            active={order === "yangi"}
                            label="Yangi"
                        />
                    </div>
                </div>

                {items.length ? (
                    <IdeaBoard items={items} canVote={Boolean(user)} order={order} />
                ) : (
                    <div className="rounded-2xl border border-dashed border-line py-16 text-center">
                        <span
                            className="mx-auto grid size-14 place-items-center rounded-2xl"
                            style={{
                                background: `color-mix(in oklab, ${scene} 12%, transparent)`,
                                color: scene,
                            }}
                        >
                            <Icon name="bulb" size={24} strokeWidth={1.5} />
                        </span>
                        <p className="mt-4 text-[14px] text-muted">
                            Bu yo&apos;nalishda hali tashabbus yo&apos;q.
                        </p>
                        <Link
                            href="/tashabbuslar/bildirish"
                            className="mt-4 inline-flex items-center gap-2 rounded-full bg-invert px-5 py-2.5 text-[13.5px] font-medium text-on-invert"
                        >
                            Birinchi bo&apos;ling
                        </Link>
                    </div>
                )}
            </section>
        </>
    );
}

/* ------------------------------------------------------------------ */

function Metric({ value, label }: { value: number; label: string }) {
    return (
        <div>
            <dd className="text-[1.75rem] font-semibold tabular-nums tracking-tight">
                <CountUp value={value} />
            </dd>
            <dt className="mt-0.5 text-[12px] text-muted">{label}</dt>
        </div>
    );
}

function SortLink({
    href,
    active,
    label,
}: {
    href: string;
    active: boolean;
    label: string;
}) {
    return (
        <Link
            href={href}
            scroll={false}
            className={
                active
                    ? "rounded-full bg-invert px-3 py-1.5 font-medium text-on-invert"
                    : "rounded-full px-3 py-1.5 text-muted hover:text-text"
            }
        >
            {label}
        </Link>
    );
}
