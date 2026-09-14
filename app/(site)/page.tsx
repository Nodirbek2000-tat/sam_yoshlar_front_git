import {
    ArrowRight,
    ArrowUpRight,
    Briefcase,
    Building2,
    CalendarDays,
    Earth,
    MapPin,
    Megaphone,
    Newspaper,
    Plane,
    Rocket,
    Sparkles,
    type LucideIcon,
} from "lucide-react";
import Link from "next/link";

import { CategoryTile } from "@/components/category-tile";
import { BusinessCard, StartupCard } from "@/components/directory/cards";
import { DirectionMarquee } from "@/components/home/direction-marquee";
import { HeroStage } from "@/components/home/hero-stage";
import { HomeFx } from "@/components/home/home-fx";
import { MagneticLink, SpotlightCard } from "@/components/home/interactive";
import { CountUp } from "@/components/motion-primitives";
import { getDirections, getOverview } from "@/lib/api";
import { dayAndMonth, formatShortDate } from "@/lib/format";
import { toneClass, type Tone } from "@/lib/tone";
import type { Overview } from "@/lib/types";

const SECTIONS: {
    href: string;
    title: string;
    description: string;
    icon: LucideIcon;
    tone: Tone;
}[] = [
    {
        href: "/tashabbuslar/yoshlar",
        title: "Yoshlar tashabbuslari",
        description:
            "G'oyangizni bildiring va ovoz bering. Har bir yo'nalishning tirik ekotizimi siz bilan o'sadi.",
        icon: Sparkles,
        tone: "emerald",
    },
    {
        href: "/tashabbuslar/muammolar",
        title: "Tashkilotlar",
        description:
            "Tashkilotlar real muammolarini kiritadi, yoshlar esa ularga yechim taklif etadi.",
        icon: Building2,
        tone: "violet",
    },
    {
        href: "/tadbirlar",
        title: "Tadbirlar",
        description: "Trening, forum va uchrashuvlar. Bir bosishda joyingizni band qiling.",
        icon: CalendarDays,
        tone: "blue",
    },
    {
        href: "/tadbirkorlar",
        title: "Tadbirkorlar",
        description: "Kengash a'zolarining bizneslari — rasmlari, sohasi va aloqasi bilan.",
        icon: Briefcase,
        tone: "amber",
    },
    {
        href: "/startaplar",
        title: "Startaplar",
        description: "Yosh startupperlarning loyihalari: bosqichi, jamoasi, kerakli investitsiya.",
        icon: Rocket,
        tone: "orange",
    },
    {
        href: "/elonlar",
        title: "E'lonlar",
        description: "Grant, kredit, tanlov va vakansiyalar — muddati bilan birga.",
        icon: Megaphone,
        tone: "pink",
    },
    {
        href: "/tengdoshlar",
        title: "Chet eldagi tengdoshim",
        description: "Chet elda o'qiyotgan va ishlayotgan tengdoshlar bilan tanishing.",
        icon: Earth,
        tone: "cyan",
    },
    {
        href: "/yangiliklar",
        title: "Yangiliklar",
        description: "Kengash faoliyati, qarorlar va yosh tadbirkorlar hayotidan xabarlar.",
        icon: Newspaper,
        tone: "rose",
    },
];

/** Reyting o'rinlari uchun rang — birinchi uchtasi ajralib tursin. */
const RANK_TONES = ["amber", "slate", "orange"] as const;

export default async function HomePage() {
    const [data, directions] = await Promise.all([
        getOverview().catch((): Overview | null => null),
        getDirections().catch(() => []),
    ]);

    const stats = data?.stats;

    return (
        <HomeFx>
            {/* ================= HERO ================= */}
            <HeroStage>
                {/* Raqamlar — har biri o'z rangida */}
                {stats && (
                    <div className="relative border-t border-line bg-page/60 backdrop-blur">
                        <div aria-hidden className="line-sweep absolute inset-x-0 top-[-1px] h-px" />
                        <div className="container-page">
                            <dl className="grid grid-cols-2 divide-line md:grid-cols-5 md:divide-x">
                                {(
                                    [
                                        {
                                            value: stats.users ?? 0,
                                            label: "Foydalanuvchi",
                                            tone: "cyan",
                                        },
                                        {
                                            value: stats.initiatives,
                                            label: "Tashabbus",
                                            tone: "emerald",
                                        },
                                        { value: stats.votes, label: "Berilgan ovoz", tone: "blue" },
                                        {
                                            value: stats.problems,
                                            label: "Tashkilot muammosi",
                                            tone: "violet",
                                        },
                                        {
                                            value: stats.solutions,
                                            label: "Taklif etilgan yechim",
                                            tone: "amber",
                                        },
                                    ] as const
                                ).map((item, index) => (
                                    <div
                                        key={item.label}
                                        className={`tone-${item.tone} px-1 py-8 md:px-5 lg:px-8 ${index < 4 ? "border-b border-line md:border-b-0" : ""} ${index % 2 === 1 ? "border-l border-line md:border-l-0" : ""} ${index === 0 ? "md:pl-0" : ""}`}
                                    >
                                        <dd className="text-[2rem] font-semibold tabular-nums tracking-tight text-tone-text md:text-[2.5rem]">
                                            <CountUp value={item.value} />
                                        </dd>
                                        <dt className="mt-1 text-[12.5px] text-muted">
                                            {item.label}
                                        </dt>
                                    </div>
                                ))}
                            </dl>
                        </div>
                    </div>
                )}
            </HeroStage>

            {/* ================= YO'NALISHLAR LENTASI ================= */}
            <DirectionMarquee directions={directions} />

            {/* ================= BO'LIMLAR ================= */}
            <section className="border-b border-line">
                <div className="container-page py-14 md:py-16">
                    <div>
                        <SectionLabel>Bo&apos;limlar</SectionLabel>
                        <h2 data-fx="heading" className="mt-3 max-w-lg text-3xl font-semibold tracking-tight sm:text-4xl">
                            Nima qila olasiz
                        </h2>
                    </div>

                    <div data-fx="cards" className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {SECTIONS.map((item) => (
                            <div key={item.href}>
                                <SpotlightCard className={`tone-${item.tone} hover:shadow-[0_22px_50px_-24px_var(--tone)]`}>
                                <Link
                                    href={item.href}
                                    className="spotlight group flex h-full flex-col overflow-hidden rounded-[15px] bg-raised p-6"
                                >
                                    <span className="relative grid size-12 place-items-center rounded-xl border border-tone-line bg-tone-soft transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
                                        <item.icon className="size-[22px] text-tone-text" strokeWidth={1.6} />
                                    </span>

                                    <h3 className="relative mt-5 text-[17px] font-semibold tracking-tight">
                                        {item.title}
                                    </h3>
                                    <p className="relative mt-2 flex-1 text-[13.5px] leading-relaxed text-muted">
                                        {item.description}
                                    </p>

                                    <span className="relative mt-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-tone-text">
                                        Ochish
                                        <ArrowRight
                                            className="size-3.5 transition-transform duration-300 group-hover:translate-x-1"
                                            strokeWidth={2}
                                        />
                                    </span>
                                </Link>
                                </SpotlightCard>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ================= REYTING ================= */}
            {data?.top_initiatives?.length ? (
                <section className="border-b border-line">
                    <div className="container-page py-14 md:py-16">
                        <div className="flex flex-wrap items-end justify-between gap-4">
                            <div>
                                <SectionLabel>Reyting</SectionLabel>
                                <h2 data-fx="heading" className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                                    Eng ko&apos;p ovoz olganlar
                                </h2>
                            </div>
                            <ViewAll href="/tashabbuslar/yoshlar" />
                        </div>

                        <div data-fx="rows" className="mt-10 space-y-2.5">
                            {data.top_initiatives.map((idea, index) => (
                                <div key={idea.id}>
                                    <Link
                                        href={`/tashabbuslar/${idea.id}`}
                                        className={`tone-${RANK_TONES[index] ?? "slate"} group flex items-center gap-4 rounded-2xl border border-line bg-raised p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-tone-line md:gap-6 md:p-5`}
                                    >
                                        <span
                                            className={
                                                index < 3
                                                    ? "pulse-glow grid size-10 shrink-0 place-items-center rounded-xl border border-tone-line bg-tone-soft text-[14px] font-semibold tabular-nums text-tone-text"
                                                    : "grid size-10 shrink-0 place-items-center rounded-xl border border-line text-[14px] font-semibold tabular-nums text-faint"
                                            }
                                        >
                                            {index + 1}
                                        </span>

                                        <span className="min-w-0 flex-1">
                                            <span className="line-clamp-2 block text-[15.5px] font-medium leading-snug">
                                                {idea.title}
                                            </span>
                                            <span className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-muted">
                                                <span
                                                    className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5"
                                                    style={{
                                                        color: idea.direction_info.color,
                                                        background: `color-mix(in oklab, ${idea.direction_info.color} 12%, transparent)`,
                                                    }}
                                                >
                                                    <span className="size-1.5 rounded-full bg-current" />
                                                    {idea.direction_info.name}
                                                </span>
                                                <span className="text-faint">
                                                    {idea.author_label}
                                                </span>
                                            </span>
                                        </span>

                                        <span className="shrink-0 text-right">
                                            <span className="block text-[18px] font-semibold tabular-nums">
                                                {idea.vote_count}
                                            </span>
                                            <span className="text-[11.5px] text-faint">ovoz</span>
                                        </span>

                                        <ArrowUpRight
                                            className="hidden size-4 shrink-0 text-faint transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-tone-text sm:block"
                                            strokeWidth={2}
                                        />
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            ) : null}

            {/* ================= YANGILIKLAR + TADBIRLAR ================= */}
            <section className="border-b border-line">
                <div className="container-page grid gap-12 py-14 md:py-16 lg:grid-cols-2 lg:gap-16">
                    <div>
                        <div className="flex items-end justify-between gap-4">
                            <div>
                                <SectionLabel>Yangiliklar</SectionLabel>
                                <h2 data-fx="heading" className="mt-3 text-2xl font-semibold tracking-tight">
                                    So&apos;nggi xabarlar
                                </h2>
                            </div>
                            <ViewAll href="/yangiliklar" />
                        </div>

                        <div data-fx="rows" className="mt-8 space-y-2.5">
                            {data?.latest_news?.length ? (
                                data.latest_news.map((item) => (
                                    <div key={item.id}>
                                        <Link
                                            href={`/yangiliklar/${item.slug}`}
                                            className="tone-rose group flex gap-4 rounded-xl border border-line bg-raised p-3.5 transition-colors duration-300 hover:border-tone-line hover:bg-tone-soft"
                                        >
                                            <span className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-lg border border-tone-line bg-tone-soft text-tone-text">
                                                {item.image ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        src={item.image}
                                                        alt=""
                                                        className="size-full object-cover"
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <Newspaper className="size-[19px]" strokeWidth={1.8} />
                                                )}
                                            </span>
                                            <span className="min-w-0 flex-1 self-center">
                                                <span className="line-clamp-2 block text-[14.5px] font-medium leading-snug">
                                                    {item.title}
                                                </span>
                                                <span className="mt-1.5 block text-[12.5px] text-muted">
                                                    {formatShortDate(item.published_at)}
                                                </span>
                                            </span>
                                        </Link>
                                    </div>
                                ))
                            ) : (
                                <Empty text="Hozircha yangilik yo'q." />
                            )}
                        </div>
                    </div>

                    <div>
                        <div className="flex items-end justify-between gap-4">
                            <div>
                                <SectionLabel>Tadbirlar</SectionLabel>
                                <h2 data-fx="heading" className="mt-3 text-2xl font-semibold tracking-tight">
                                    Yaqin kunlarda
                                </h2>
                            </div>
                            <ViewAll href="/tadbirlar" />
                        </div>

                        <div data-fx="rows" className="mt-8 space-y-2.5">
                            {data?.upcoming_events?.length ? (
                                data.upcoming_events.map((event) => {
                                    const { day, month } = dayAndMonth(event.starts_at);
                                    return (
                                        <div key={event.id}>
                                            <Link
                                                href={`/tadbirlar/${event.slug}`}
                                                className={`${toneClass(event.slug)} group flex gap-4 rounded-xl border border-line bg-raised p-3.5 transition-colors duration-300 hover:border-tone-line hover:bg-tone-soft`}
                                            >
                                                <span className="grid size-14 shrink-0 place-content-center rounded-lg border border-tone-line bg-tone-soft text-center leading-none">
                                                    <span className="text-[17px] font-semibold tabular-nums text-tone-text">
                                                        {day}
                                                    </span>
                                                    <span className="mt-1 text-[10px] uppercase tracking-wide text-muted">
                                                        {month}
                                                    </span>
                                                </span>
                                                <span className="min-w-0 flex-1 self-center">
                                                    <span className="line-clamp-2 block text-[14.5px] font-medium leading-snug">
                                                        {event.title}
                                                    </span>
                                                    <span className="mt-1.5 flex items-center gap-1.5 text-[12.5px] text-muted">
                                                        <MapPin className="size-3" strokeWidth={2} />
                                                        <span className="truncate">
                                                            {event.location}
                                                        </span>
                                                    </span>
                                                </span>
                                            </Link>
                                        </div>
                                    );
                                })
                            ) : (
                                <Empty text="Rejalashtirilgan tadbir yo'q." />
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= E'LONLAR ================= */}
            <section className="border-b border-line">
                <div className="container-page py-14 md:py-16">
                    <div className="flex items-end justify-between gap-4">
                        <div>
                            <SectionLabel>E&apos;lonlar</SectionLabel>
                            <h2 data-fx="heading" className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                                Grant va imkoniyatlar
                            </h2>
                        </div>
                        <ViewAll href="/elonlar" />
                    </div>

                    <div data-fx="rows" className="mt-8 grid gap-2.5 md:grid-cols-2">
                            {data?.announcements?.length ? (
                                data.announcements.map((item) => (
                                    <div key={item.id}>
                                        <Link
                                            href={`/elonlar/${item.slug}`}
                                            className={`${toneClass(item.icon)} group flex items-center gap-4 rounded-xl border border-line bg-raised p-3.5 transition-colors duration-300 hover:border-tone-line hover:bg-tone-soft`}
                                        >
                                            <CategoryTile slug={item.icon} size="lg" />

                                            <span className="min-w-0 flex-1">
                                                <span className="line-clamp-2 block text-[14.5px] font-medium leading-snug">
                                                    {item.title}
                                                </span>
                                                <span className="mt-1.5 flex flex-wrap items-center gap-x-3 text-[12.5px]">
                                                    <span className="font-medium text-tone-text">
                                                        {item.type_display}
                                                    </span>
                                                    {item.deadline && !item.is_expired && (
                                                        <span className="text-muted">
                                                            {formatShortDate(item.deadline)} gacha
                                                        </span>
                                                    )}
                                                </span>
                                            </span>
                                        </Link>
                                    </div>
                                ))
                            ) : (
                                <Empty text="Faol e'lon yo'q." />
                            )}
                    </div>
                </div>
            </section>

            {/* ================= CHET ELDAGI TENGDOSHLAR ================= */}
            <section className="relative overflow-hidden border-b border-line">
                {/* Orqada sekin suzuvchi yog'dular */}
                <div aria-hidden className="pointer-events-none absolute inset-0">
                    <div className="blob -right-32 top-6 size-[26rem] bg-[oklch(65%_0.14_230/0.14)]" />
                    <div
                        className="blob -left-40 bottom-0 size-[22rem] bg-[color-mix(in_oklab,var(--accent)_14%,transparent)]"
                        style={{ animationDelay: "-7s" }}
                    />
                </div>

                <div className="container-page relative py-14 md:py-20">
                    <div className="flex items-end justify-between gap-4">
                        <div>
                            <SectionLabel>Chet eldagi tengdoshlar</SectionLabel>
                            <h2 data-fx="heading" className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
                                Dunyo universitetlarida o&apos;qiyotgan yoshlarimiz
                            </h2>
                            <p data-fx="rise" className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted">
                                Ular bilan bog&apos;laning, tajriba so&apos;rang — grant, qabul va hayot haqida
                                birinchi qo&apos;ldan bilib oling.
                            </p>
                        </div>
                        <ViewAll href="/tengdoshlar" />
                    </div>

                    {data?.peers?.length ? (
                        <div data-fx="cards" className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {data.peers.map((peer) => (
                                <div key={peer.id}>
                                    <PeerTile peer={peer} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="mt-10">
                            <Empty text="Hozircha tengdosh qo'shilmagan." />
                        </div>
                    )}

                    <div
                        data-fx="rise"
                        className="mt-8 flex flex-col items-start gap-4 rounded-2xl border border-line bg-raised/70 p-5 backdrop-blur sm:flex-row sm:items-center"
                    >
                        <span className="float-slow tone-blue grid size-12 shrink-0 place-items-center rounded-2xl border border-tone-line bg-tone-soft text-tone-text">
                            <Plane className="size-6" strokeWidth={1.7} />
                        </span>
                        <p className="flex-1 text-[14.5px] leading-relaxed text-muted">
                            <span className="font-semibold text-text">Chet elda o&apos;qiysizmi?</span>{" "}
                            Ro&apos;yxatdan o&apos;ting — profilingiz shu yerda chiqadi va yurtdoshlaringiz
                            siz bilan bog&apos;lana oladi.
                        </p>
                        <MagneticLink
                            href="/royxatdan-otish"
                            className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-invert px-5 py-2.5 text-[14px] font-medium text-on-invert"
                        >
                            Qo&apos;shilish
                            <ArrowRight
                                className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                                strokeWidth={2}
                            />
                        </MagneticLink>
                    </div>
                </div>
            </section>

            {/* ================= TADBIRKORLAR ================= */}
            <section className="border-b border-line">
                <div className="container-page py-14 md:py-16">
                    <div className="flex items-end justify-between gap-4">
                        <div>
                            <SectionLabel>Tadbirkorlar</SectionLabel>
                            <h2 data-fx="heading" className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                                Kengash a&apos;zolarining bizneslari
                            </h2>
                        </div>
                        <ViewAll href="/tadbirkorlar" />
                    </div>

                    {data?.businesses?.length ? (
                        <div data-fx="cards" className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {data.businesses.map((business) => (
                                <div key={business.id}>
                                    <BusinessCard business={business} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <JoinCard
                            href="/royxatdan-otish"
                            tone="tone-amber"
                            icon={Briefcase}
                            title="Biznesingizni shu yerda ko'rsating"
                            text="Ro'yxatdan o'ting, biznesingizni rasmlari bilan tanishtiring — kengash tasdiqlagach shu yerda chiqadi."
                        />
                    )}
                </div>
            </section>

            {/* ================= STARTAPLAR ================= */}
            <section className="border-b border-line">
                <div className="container-page py-14 md:py-16">
                    <div className="flex items-end justify-between gap-4">
                        <div>
                            <SectionLabel>Startaplar</SectionLabel>
                            <h2 data-fx="heading" className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                                G&apos;oyadan bozorgacha
                            </h2>
                        </div>
                        <ViewAll href="/startaplar" />
                    </div>

                    {data?.startups?.length ? (
                        <div data-fx="cards" className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            {data.startups.map((startup) => (
                                <div key={startup.id}>
                                    <StartupCard startup={startup} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <JoinCard
                            href="/royxatdan-otish"
                            tone="tone-orange"
                            icon={Rocket}
                            title="Startapingizni investorlarga ko'rsating"
                            text="Anketa to'ldiring — bosqichi, jamoasi va kerakli investitsiya bilan startaplar ro'yxatiga tushadi."
                        />
                    )}
                </div>
            </section>

            {/* ================= CTA ================= */}
            <section className="relative overflow-hidden">
                <div aria-hidden className="aurora" />
                {/* Orqadagi yog'du — sahifadan sekinroq siljiydi */}
                <div
                    aria-hidden
                    data-speed="0.6"
                    className="pointer-events-none absolute left-1/2 top-1/2 size-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--accent)_22%,transparent),transparent_65%)] blur-2xl"
                />

                <div className="container-page relative py-20 md:py-28">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2
                            data-fx="heading"
                            className="text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl"
                        >
                            Ovoz berish uchun qo&apos;shiling
                        </h2>
                        {/* O'qilgan sari so'zlar to'ladi */}
                        <p
                            data-fx="fill"
                            className="mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-text md:text-[19px]"
                        >
                            Sahifalarni ko&apos;rish hamma uchun ochiq. Ovoz berish va taklif
                            yozish uchun Telegram bot orqali bir daqiqada ro&apos;yxatdan
                            o&apos;ting.
                        </p>
                        <div data-fx="rise" className="mt-10">
                            <MagneticLink
                                href="/royxatdan-otish"
                                className="glow-ring group inline-flex items-center gap-2 rounded-full bg-invert px-7 py-3.5 text-[15px] font-medium text-on-invert"
                            >
                                Ro&apos;yxatdan o&apos;tish
                                <ArrowRight
                                    className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                                    strokeWidth={2}
                                />
                            </MagneticLink>
                        </div>
                    </div>
                </div>
            </section>
        </HomeFx>
    );
}

/* ------------------------------------------------------------------ */

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <span className="inline-flex items-center gap-2.5 text-[12px] font-medium uppercase tracking-[0.1em] text-accent">
            {/* Chiziq bo'ylab nur yugurib o'tadi */}
            <span aria-hidden className="line-sweep block h-px w-8 bg-line" />
            {children}
        </span>
    );
}

function ViewAll({ href }: { href: string }) {
    return (
        <Link
            href={href}
            className="group inline-flex shrink-0 items-center gap-1.5 text-[13px] text-muted transition-colors hover:text-text"
        >
            Barchasi
            <ArrowUpRight
                className="size-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                strokeWidth={2}
            />
        </Link>
    );
}

/** Bo'lim hali bo'sh bo'lsa — bo'sh joy emas, qo'shilishga taklif. */
function JoinCard({
    href,
    tone,
    icon,
    title,
    text,
}: {
    href: string;
    tone: string;
    icon: LucideIcon;
    title: string;
    text: string;
}) {
    const Glyph = icon;

    return (
        <Link
            href={href}
            className={`${tone} group mt-8 flex flex-col items-start gap-5 rounded-2xl border border-dashed border-tone-line bg-tone-soft p-6 transition-colors sm:flex-row sm:items-center sm:p-8`}
        >
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-page text-tone-text">
                <Glyph className="size-6" strokeWidth={1.6} />
            </span>
            <span className="min-w-0 flex-1">
                <span className="block text-[16.5px] font-semibold">{title}</span>
                <span className="mt-1 block max-w-xl text-[13.5px] leading-relaxed text-muted">
                    {text}
                </span>
            </span>
            <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-invert px-5 py-2.5 text-[13.5px] font-medium text-on-invert transition-opacity group-hover:opacity-90">
                Ro&apos;yxatdan o&apos;tish
                <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={2} />
            </span>
        </Link>
    );
}

/** Tengdosh — rasmi katta, davlati rangida, universiteti va kursi bilan. */
function PeerTile({ peer }: { peer: Overview["peers"][number] }) {
    return (
        <SpotlightCard className="h-full hover:shadow-[0_22px_50px_-26px_rgba(0,0,0,0.35)]">
            <Link
                href={`/tengdoshlar/${peer.id}`}
                className="spotlight group flex h-full flex-col overflow-hidden rounded-[15px] bg-raised"
            >
                <span
                    className="relative block aspect-[4/3] overflow-hidden"
                    style={{ background: peer.country_color }}
                >
                    {peer.photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={peer.photo}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                        />
                    ) : (
                        <span className="grid size-full place-items-center text-4xl font-semibold text-white">
                            {peer.initials}
                        </span>
                    )}
                    <span className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.62),transparent_55%)]" />
                    <span
                        className="absolute left-3 top-3 rounded-md px-2 py-1 text-[11px] font-bold tracking-wide text-white shadow-lg"
                        style={{ background: peer.country_color }}
                    >
                        {peer.country_short}
                    </span>
                    <span className="absolute inset-x-3 bottom-3 flex items-center gap-1.5 truncate text-[12.5px] font-medium text-white">
                        <MapPin className="size-3.5 shrink-0" strokeWidth={2} />
                        {peer.city ? `${peer.city}, ` : ""}
                        {peer.country_name}
                    </span>
                </span>

                <span className="relative flex flex-1 flex-col p-4">
                    <span className="truncate text-[15.5px] font-semibold tracking-tight">
                        {peer.full_name}
                    </span>
                    {peer.institution && (
                        <span className="mt-1 line-clamp-2 text-[13px] leading-snug text-muted">
                            {peer.institution}
                        </span>
                    )}
                    <span className="mt-auto flex flex-wrap gap-1.5 pt-3 text-[11.5px]">
                        {peer.course && (
                            <span className="rounded-full bg-surface px-2.5 py-1 font-medium text-text">
                                {peer.course}-kurs
                            </span>
                        )}
                        {peer.field && (
                            <span className="max-w-full truncate rounded-full bg-surface px-2.5 py-1 text-muted">
                                {peer.field}
                            </span>
                        )}
                    </span>
                </span>
            </Link>
        </SpotlightCard>
    );
}

function Empty({ text }: { text: string }) {
    return (
        <p className="rounded-xl border border-dashed border-line py-10 text-center text-[13.5px] text-faint">
            {text}
        </p>
    );
}
