import Link from "next/link";

import { CategoryTile } from "@/components/category-tile";
import { Icon, type IconName } from "@/components/icon";
import { CountUp, Reveal, Stagger, StaggerItem } from "@/components/motion-primitives";
import { getOverview } from "@/lib/api";
import { dayAndMonth, formatShortDate } from "@/lib/format";
import { toneClass, type Tone } from "@/lib/tone";
import type { Overview } from "@/lib/types";

const SECTIONS: {
    href: string;
    title: string;
    description: string;
    icon: IconName;
    tone: Tone;
}[] = [
    {
        href: "/tashabbuslar/yoshlar",
        title: "Yoshlar tashabbuslari",
        description:
            "G'oyangizni bildiring va ovoz bering. Har bir yo'nalishning tirik ekotizimi siz bilan o'sadi.",
        icon: "spark",
        tone: "emerald",
    },
    {
        href: "/tashabbuslar/muammolar",
        title: "Tashkilotlar",
        description:
            "Tashkilotlar real muammolarini kiritadi, yoshlar esa ularga yechim taklif etadi.",
        icon: "clipboard",
        tone: "violet",
    },
    {
        href: "/tadbirlar",
        title: "Tadbirlar",
        description: "Trening, forum va uchrashuvlar. Bir bosishda joyingizni band qiling.",
        icon: "calendar",
        tone: "blue",
    },
    {
        href: "/elonlar",
        title: "E'lonlar",
        description: "Grant, kredit, tanlov va vakansiyalar — muddati bilan birga.",
        icon: "megaphone",
        tone: "amber",
    },
    {
        href: "/tengdoshlar",
        title: "Chet eldagi tengdoshim",
        description: "Chet elda o'qiyotgan va ishlayotgan tengdoshlar bilan tanishing.",
        icon: "globe",
        tone: "cyan",
    },
    {
        href: "/yangiliklar",
        title: "Yangiliklar",
        description: "Kengash faoliyati, qarorlar va yosh tadbirkorlar hayotidan xabarlar.",
        icon: "news",
        tone: "rose",
    },
];

/** Reyting o'rinlari uchun rang — birinchi uchtasi ajralib tursin. */
const RANK_TONES = ["amber", "slate", "orange"] as const;

export default async function HomePage() {
    let data: Overview | null = null;

    try {
        data = await getOverview();
    } catch {
        data = null;
    }

    const stats = data?.stats;

    return (
        <>
            {/* ================= HERO ================= */}
            <section className="relative overflow-hidden border-b border-line">
                <div aria-hidden className="aurora" />
                <div
                    aria-hidden
                    className="grid-lines pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000,transparent)]"
                />

                <div className="container-page relative py-16 md:py-24">
                    <Reveal className="max-w-3xl">
                        <span className="inline-flex items-center gap-2 rounded-full border border-line bg-page/70 px-3 py-1 text-[12px] font-medium text-muted backdrop-blur">
                            <span className="size-1.5 rounded-full bg-accent" />
                            Yosh Tadbirkorlar Kengashi
                        </span>

                        <h1 className="mt-8 text-[2.75rem] font-semibold leading-[1.05] tracking-[-0.03em] sm:text-6xl md:text-7xl">
                            Yoshlar tashabbusi
                            <br />
                            <span className="bg-gradient-to-r from-accent via-accent to-text bg-clip-text text-transparent">
                                kuchga aylanadigan joy
                            </span>
                        </h1>

                        <p className="mt-7 max-w-xl text-[17px] leading-relaxed text-text">
                            Yoshlarni birlashtiruvchi, qo&apos;llab-quvvatlovchi va
                            rivojlantirishga xizmat qiluvchi yagona axborot platformasi.
                        </p>

                        <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-muted">
                            Muammoni ayting, g&apos;oyani bildiring, ovoz bering. Har bir ovoz
                            yo&apos;nalishning tirik ekotizimini bir qadam o&apos;stiradi.
                        </p>

                        <div className="mt-10 flex flex-wrap items-center gap-3">
                            <Link
                                href="/tashabbuslar"
                                className="group inline-flex items-center gap-2 rounded-full bg-invert px-5 py-2.5 text-[14px] font-medium text-on-invert transition-opacity hover:opacity-90"
                            >
                                Tashabbuslarni ko&apos;rish
                                <Icon
                                    name="arrowRight"
                                    size={15}
                                    className="transition-transform duration-300 group-hover:translate-x-0.5"
                                />
                            </Link>

                            <Link
                                href="/royxatdan-otish"
                                className="inline-flex items-center gap-2 rounded-full border border-line bg-page/60 px-5 py-2.5 text-[14px] font-medium text-text backdrop-blur transition-colors hover:bg-surface"
                            >
                                Ro&apos;yxatdan o&apos;tish
                            </Link>
                        </div>
                    </Reveal>
                </div>

                {/* Raqamlar — har biri o'z rangida */}
                {stats && (
                    <div className="relative border-t border-line bg-page/60 backdrop-blur">
                        <div className="container-page">
                            <dl className="grid grid-cols-2 divide-line md:grid-cols-4 md:divide-x">
                                {(
                                    [
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
                                        className={`tone-${item.tone} px-1 py-8 md:px-8 ${index < 2 ? "border-b border-line md:border-b-0" : ""} ${index % 2 === 1 ? "border-l border-line md:border-l-0" : ""} ${index === 0 ? "md:pl-0" : ""}`}
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
            </section>

            {/* ================= BO'LIMLAR ================= */}
            <section className="border-b border-line">
                <div className="container-page py-14 md:py-16">
                    <Reveal>
                        <SectionLabel>Bo&apos;limlar</SectionLabel>
                        <h2 className="mt-3 max-w-lg text-3xl font-semibold tracking-tight sm:text-4xl">
                            Nima qila olasiz
                        </h2>
                    </Reveal>

                    <Stagger className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {SECTIONS.map((item) => (
                            <StaggerItem key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`tone-${item.tone} group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-raised p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-tone-line hover:shadow-[0_16px_40px_-20px_var(--tone)]`}
                                >
                                    <span className="grid size-12 place-items-center rounded-xl border border-tone-line bg-tone-soft">
                                        <Icon
                                            name={item.icon}
                                            size={22}
                                            strokeWidth={1.6}
                                            className="text-tone-text"
                                        />
                                    </span>

                                    <h3 className="mt-5 text-[17px] font-semibold tracking-tight">
                                        {item.title}
                                    </h3>
                                    <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-muted">
                                        {item.description}
                                    </p>

                                    <span className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-tone-text">
                                        Ochish
                                        <Icon
                                            name="arrowRight"
                                            size={13}
                                            className="transition-transform duration-300 group-hover:translate-x-1"
                                        />
                                    </span>
                                </Link>
                            </StaggerItem>
                        ))}
                    </Stagger>
                </div>
            </section>

            {/* ================= REYTING ================= */}
            {data?.top_initiatives?.length ? (
                <section className="border-b border-line">
                    <div className="container-page py-14 md:py-16">
                        <Reveal className="flex flex-wrap items-end justify-between gap-4">
                            <div>
                                <SectionLabel>Reyting</SectionLabel>
                                <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                                    Eng ko&apos;p ovoz olganlar
                                </h2>
                            </div>
                            <ViewAll href="/tashabbuslar/yoshlar" />
                        </Reveal>

                        <Stagger className="mt-10 space-y-2.5">
                            {data.top_initiatives.map((idea, index) => (
                                <StaggerItem key={idea.id}>
                                    <Link
                                        href={`/tashabbuslar/${idea.id}`}
                                        className={`tone-${RANK_TONES[index] ?? "slate"} group flex items-center gap-4 rounded-2xl border border-line bg-raised p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-tone-line md:gap-6 md:p-5`}
                                    >
                                        <span
                                            className={
                                                index < 3
                                                    ? "grid size-10 shrink-0 place-items-center rounded-xl border border-tone-line bg-tone-soft text-[14px] font-semibold tabular-nums text-tone-text"
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

                                        <Icon
                                            name="arrowRight"
                                            size={16}
                                            className="hidden shrink-0 text-faint transition-all duration-300 group-hover:translate-x-1 group-hover:text-tone-text sm:block"
                                        />
                                    </Link>
                                </StaggerItem>
                            ))}
                        </Stagger>
                    </div>
                </section>
            ) : null}

            {/* ================= YANGILIKLAR + TADBIRLAR ================= */}
            <section className="border-b border-line">
                <div className="container-page grid gap-12 py-14 md:py-16 lg:grid-cols-2 lg:gap-16">
                    <div>
                        <Reveal className="flex items-end justify-between gap-4">
                            <div>
                                <SectionLabel>Yangiliklar</SectionLabel>
                                <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                                    So&apos;nggi xabarlar
                                </h2>
                            </div>
                            <ViewAll href="/yangiliklar" />
                        </Reveal>

                        <Stagger className="mt-8 space-y-2.5">
                            {data?.latest_news?.length ? (
                                data.latest_news.map((item) => (
                                    <StaggerItem key={item.id}>
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
                                                    <Icon name="news" size={19} />
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
                                    </StaggerItem>
                                ))
                            ) : (
                                <Empty text="Hozircha yangilik yo'q." />
                            )}
                        </Stagger>
                    </div>

                    <div>
                        <Reveal className="flex items-end justify-between gap-4">
                            <div>
                                <SectionLabel>Tadbirlar</SectionLabel>
                                <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                                    Yaqin kunlarda
                                </h2>
                            </div>
                            <ViewAll href="/tadbirlar" />
                        </Reveal>

                        <Stagger className="mt-8 space-y-2.5">
                            {data?.upcoming_events?.length ? (
                                data.upcoming_events.map((event) => {
                                    const { day, month } = dayAndMonth(event.starts_at);
                                    return (
                                        <StaggerItem key={event.id}>
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
                                                        <Icon name="pin" size={12} />
                                                        <span className="truncate">
                                                            {event.location}
                                                        </span>
                                                    </span>
                                                </span>
                                            </Link>
                                        </StaggerItem>
                                    );
                                })
                            ) : (
                                <Empty text="Rejalashtirilgan tadbir yo'q." />
                            )}
                        </Stagger>
                    </div>
                </div>
            </section>

            {/* ================= E'LONLAR + TENGDOSHLAR ================= */}
            <section className="border-b border-line">
                <div className="container-page grid gap-12 py-14 md:py-16 lg:grid-cols-2 lg:gap-16">
                    <div>
                        <Reveal className="flex items-end justify-between gap-4">
                            <div>
                                <SectionLabel>E&apos;lonlar</SectionLabel>
                                <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                                    Grant va imkoniyatlar
                                </h2>
                            </div>
                            <ViewAll href="/elonlar" />
                        </Reveal>

                        <Stagger className="mt-8 space-y-2.5">
                            {data?.announcements?.length ? (
                                data.announcements.map((item) => (
                                    <StaggerItem key={item.id}>
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
                                    </StaggerItem>
                                ))
                            ) : (
                                <Empty text="Faol e'lon yo'q." />
                            )}
                        </Stagger>
                    </div>

                    <div>
                        <Reveal className="flex items-end justify-between gap-4">
                            <div>
                                <SectionLabel>Tengdoshlar</SectionLabel>
                                <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                                    Chet elda o&apos;qiyotganlar
                                </h2>
                            </div>
                            <ViewAll href="/tengdoshlar" />
                        </Reveal>

                        <Stagger className="mt-8 space-y-2.5">
                            {data?.peers?.length ? (
                                data.peers.map((peer) => (
                                    <StaggerItem key={peer.id}>
                                        <Link
                                            href={`/tengdoshlar/${peer.id}`}
                                            className={`${toneClass(peer.purpose)} group flex items-center gap-4 rounded-xl border border-line bg-raised p-3.5 transition-colors duration-300 hover:border-tone-line hover:bg-tone-soft`}
                                        >
                                            <span
                                                className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-full text-[12.5px] font-semibold text-white"
                                                style={{ background: peer.country_color }}
                                            >
                                                {peer.photo ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        src={peer.photo}
                                                        alt=""
                                                        className="size-full object-cover"
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    peer.initials
                                                )}
                                            </span>
                                            <span className="min-w-0 flex-1">
                                                <span className="block truncate text-[14.5px] font-medium">
                                                    {peer.full_name}
                                                </span>
                                                <span className="mt-1 flex items-center gap-2 text-[12.5px]">
                                                    <span
                                                        className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold text-white"
                                                        style={{ background: peer.country_color }}
                                                    >
                                                        {peer.country_short}
                                                    </span>
                                                    <span className="truncate text-muted">
                                                        {peer.purpose_display}
                                                    </span>
                                                </span>
                                            </span>
                                        </Link>
                                    </StaggerItem>
                                ))
                            ) : (
                                <Empty text="Hozircha tengdosh qo'shilmagan." />
                            )}
                        </Stagger>
                    </div>
                </div>
            </section>

            {/* ================= CTA ================= */}
            <section className="relative overflow-hidden">
                <div aria-hidden className="aurora" />
                <div className="container-page relative py-16 md:py-20">
                    <Reveal className="mx-auto max-w-lg text-center">
                        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                            Ovoz berish uchun qo&apos;shiling
                        </h2>
                        <p className="mt-4 text-[15px] leading-relaxed text-muted">
                            Sahifalarni ko&apos;rish hamma uchun ochiq. Ovoz berish va taklif
                            yozish uchun Telegram bot orqali bir daqiqada ro&apos;yxatdan
                            o&apos;ting.
                        </p>
                        <Link
                            href="/royxatdan-otish"
                            className="group mt-8 inline-flex items-center gap-2 rounded-full bg-invert px-6 py-3 text-[14.5px] font-medium text-on-invert transition-opacity hover:opacity-90"
                        >
                            Ro&apos;yxatdan o&apos;tish
                            <Icon
                                name="arrowRight"
                                size={15}
                                className="transition-transform duration-300 group-hover:translate-x-0.5"
                            />
                        </Link>
                    </Reveal>
                </div>
            </section>
        </>
    );
}

/* ------------------------------------------------------------------ */

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <span className="text-[12px] font-medium uppercase tracking-[0.1em] text-accent">
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
            <Icon
                name="arrowRight"
                size={13}
                className="transition-transform duration-300 group-hover:translate-x-0.5"
            />
        </Link>
    );
}

function Empty({ text }: { text: string }) {
    return (
        <p className="rounded-xl border border-dashed border-line py-10 text-center text-[13.5px] text-faint">
            {text}
        </p>
    );
}
