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
import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";

import { CategoryTile } from "@/components/category-tile";
import { BusinessCard, StartupCard } from "@/components/directory/cards";
import { HeroStage } from "@/components/home/hero-stage";
import { HomeFx } from "@/components/home/home-fx";
import { MagneticLink, SpotlightCard } from "@/components/home/interactive";
import { ParticleField, type ParticleShape } from "@/components/home/particle-field";
import { ScrollScenes } from "@/components/home/scroll-scenes";
import { Img } from "@/components/img";
import { CountUp } from "@/components/motion-primitives";
import { JsonLd } from "@/components/seo/json-ld";
import { Words } from "@/components/words";
import { getDirections, getOverview } from "@/lib/api";
import { dayAndMonth, formatNumber, formatShortDate } from "@/lib/format";
import { IMAGE_SIZES } from "@/lib/image";
import { organizationSchema, websiteSchema } from "@/lib/seo";
import { toneClass, type Tone } from "@/lib/tone";
import type { Overview } from "@/lib/types";

/**
 * Bosh sahifa — aylantirilganda «hikoya» bo'lib ochiladi.
 *
 *   Ochilish      nuqtalardan yig'iladigan Registon
 *   Maqsad        matn o'qilgan sari to'ladi, to'rt tamoyil
 *   Raqamlarda    bo'lim joyida turadi — raqam va nuqtalar shakli almashadi
 *   Yo'nalishlar  ro'yxat yurganda faol yo'nalish yonadi
 *   Yo'l          kartalar bir-birining ustiga taxlanadi
 *   Bo'limlar     pastga aylantirilsa kartalar yonga yuradi
 *   …keyin jonli ma'lumot: reyting, yangiliklar, e'lonlar, hamjamiyat.
 *
 * Sahifaning o'zi serverda chiziladi va keshlanadi. Harakatni `ScrollScenes`
 * (aylantirish holati -> CSS o'zgaruvchisi) va CSS bajaradi; «harakatni
 * kamaytirish» yoqilgan bo'lsa hammasi oddiy, qimirlamaydigan sahifa.
 */

type Vars = CSSProperties & Record<`--${string}`, string | number>;

const pad = (value: number) => String(value).padStart(2, "0");

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
        description: "Yoshlarning bizneslari — rasmlari, sohasi va aloqasi bilan.",
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
        description: "Samarqand yoshlari hayotidan xabarlar: tadbirlar, uchrashuvlar va yutuqlar.",
        icon: Newspaper,
        tone: "rose",
    },
];

/** Platformaning to'rt tamoyili — «Maqsad» bo'limidagi kartalar. */
const PRINCIPLES: { title: string; text: string; tone: Tone }[] = [
    {
        title: "G'oyangizni ayting",
        text: "Muammo yoki taklifingizni yo'nalishini tanlab yozing — u darhol hammaga ko'rinadi.",
        tone: "emerald",
    },
    {
        title: "Ovoz bering",
        text: "Har bir ovoz tashabbusni reytingda yuqoriga ko'taradi. Eng kuchlilari birinchi o'rinda turadi.",
        tone: "blue",
    },
    {
        title: "Yechim taklif qiling",
        text: "Tashkilotlar real muammosini kiritadi. Siz yechim yozasiz — tashkilot o'zi bog'lanadi.",
        tone: "violet",
    },
    {
        title: "Imkoniyatni ushlang",
        text: "Grant, tanlov, tadbir va investor — hammasi muddati bilan bir joyda.",
        tone: "amber",
    },
];

/** «Qanday ishlaydi» — kartalar aylantirilganda bir-birining ustiga taxlanadi. */
const STEPS: { title: string; badge: string; text: string; tone: Tone }[] = [
    {
        title: "Ro'yxatdan o'ting",
        badge: "1 daqiqa",
        text: "Telegram bot raqamingizni tasdiqlaydi va kirish kodini beradi. Parol eslab qolish shart emas.",
        tone: "emerald",
    },
    {
        title: "Yozing",
        badge: "G'oya yoki muammo",
        text: "Yo'nalishni tanlang, fikringizni qisqa va aniq yozing. Tashabbus darhol hammaga ko'rinadi.",
        tone: "cyan",
    },
    {
        title: "Ovoz to'plang",
        badge: "Ochiq reyting",
        text: "Boshqalar ovoz beradi va o'z taklifini qo'shadi. Tashabbusingiz o'rni har bir ovoz bilan o'zgaradi.",
        tone: "blue",
    },
    {
        title: "Natijani kuzating",
        badge: "Shaxsiy kabinet",
        text: "Ovozlar, takliflar va javoblar kabinetingizda turadi. Yangilik bo'lsa — sayt va bot xabar beradi.",
        tone: "violet",
    },
];

/** Bo'limlar orasidan o'tuvchi yirik so'zlar */
const BAND = ["G'oya", "Ovoz", "Yechim", "Imkoniyat"];

/** Reyting o'rinlari uchun rang — birinchi uchtasi ajralib tursin. */
const RANK_TONES = ["amber", "slate", "orange"] as const;

/** Bosh sahifaning asosiy manzili — `?utm=...` bilan ochilsa ham bitta sahifa. */
export const metadata: Metadata = {
    alternates: { canonical: "/" },
};

export default async function HomePage() {
    const [data, directions] = await Promise.all([
        getOverview().catch((): Overview | null => null),
        getDirections().catch(() => []),
    ]);

    const stats = data?.stats;
    const top = data?.top_initiatives ?? [];
    const topVotes = Math.max(1, ...top.map((idea) => idea.vote_count));

    /** «Raqamlarda» — har bir qadamda raqam va nuqtalar shakli almashadi. */
    const steps: { label: string; value: number; unit: string; text: string; shape: ParticleShape }[] =
        stats
            ? [
                  {
                      label: "Hamjamiyat",
                      value: stats.users ?? 0,
                      unit: "yosh ro'yxatdan o'tgan",
                      text: "Samarqand viloyatining shahar va tumanlaridan. Ro'yxatdan o'tish Telegram bot orqali bir daqiqa oladi.",
                      shape: "rings",
                  },
                  {
                      label: "Tashabbuslar",
                      value: stats.initiatives,
                      unit: "tashabbus bildirilgan",
                      text: `${directions.length || 14} yo'nalish bo'yicha — ekologiyadan sun'iy intellektgacha. Har biri ochiq muhokamada.`,
                      shape: "clusters",
                  },
                  {
                      label: "Ovozlar",
                      value: stats.votes,
                      unit: "ovoz berilgan",
                      text: "Ovoz — tashabbusning kuchi. Reytingni yoshlarning o'zi belgilaydi.",
                      shape: "check",
                  },
                  {
                      label: "Yechimlar",
                      value: stats.solutions,
                      unit: "yechim taklif etilgan",
                      text: `${stats.problems} ta tashkilot muammosiga yoshlar yozgan javoblar. Ma'qul kelgan muallif bilan tashkilot o'zi bog'lanadi.`,
                      shape: "bulb",
                  },
              ]
            : [];
    // Hali nol bo'lgan ko'rsatkich katta «0» bo'lib turmasin
    const story = steps.filter((step) => step.value > 0);

    // Bo'limlar tartib raqami: ma'lumoti yo'q bo'lim tushib qolsa, raqamlar uzilmaydi
    const order = [
        "about",
        story.length > 1 ? "numbers" : null,
        directions.length ? "directions" : null,
        "steps",
        "sections",
        top.length ? "rating" : null,
        "feed",
        "offers",
        "peers",
        "business",
        "startups",
    ].filter(Boolean);
    const no = (key: string) => order.indexOf(key) + 1;

    return (
        <HomeFx>
            {/* Google uchun: kim ekanimiz va sayt nomi */}
            <JsonLd data={organizationSchema()} />
            <JsonLd data={websiteSchema()} />

            <ScrollScenes />
            {/* Sahifa qancha o'qilgani — eng tepadagi ingichka chiziq */}
            <div aria-hidden data-scroll-bar className="lp-progress" />

            {/* ================= OCHILISH ================= */}
            <HeroStage>
                {stats && (
                    <div className="relative border-t border-line bg-page/60 backdrop-blur">
                        <div aria-hidden className="line-sweep absolute inset-x-0 top-[-1px] h-px" />
                        <div className="container-page">
                            <dl className="grid grid-cols-2 divide-line md:grid-cols-5 md:divide-x">
                                {(
                                    [
                                        { value: stats.users ?? 0, label: "Foydalanuvchi", tone: "cyan" },
                                        { value: stats.initiatives, label: "Tashabbus", tone: "emerald" },
                                        { value: stats.votes, label: "Berilgan ovoz", tone: "blue" },
                                        { value: stats.problems, label: "Tashkilot muammosi", tone: "violet" },
                                        { value: stats.solutions, label: "Taklif etilgan yechim", tone: "amber" },
                                    ] as const
                                ).map((item, index) => (
                                    <div
                                        key={item.label}
                                        className={`tone-${item.tone} px-1 py-6 md:px-5 lg:px-8 ${index < 4 ? "border-b border-line md:border-b-0" : ""} ${index % 2 === 1 ? "border-l border-line md:border-l-0" : ""} ${index === 0 ? "md:pl-0" : ""}`}
                                    >
                                        <dd className="text-[1.75rem] font-semibold tabular-nums tracking-tight text-tone-text md:text-[2.25rem]">
                                            <CountUp value={item.value} />
                                        </dd>
                                        <dt className="mt-1 text-[12.5px] text-muted">{item.label}</dt>
                                    </div>
                                ))}
                            </dl>
                        </div>
                    </div>
                )}
            </HeroStage>

            {/* ================= YIRIK SO'ZLAR — aylantirilganda yonga siljiydi ================= */}
            <div data-scene="view" aria-hidden className="lp-band border-b border-line">
                <div className="lp-band-track">
                    {[...BAND, ...BAND, ...BAND].map((word, index) => (
                        <span key={index} className={index % 2 ? "lp-band-fill" : undefined}>
                            {word}
                        </span>
                    ))}
                </div>
            </div>

            {/* ================= MAQSAD ================= */}
            <section className="relative border-b border-line">
                <div className="container-page grid gap-10 py-20 md:py-28 lg:grid-cols-[5fr_7fr] lg:gap-16">
                    <div className="lg:sticky lg:top-28 lg:self-start">
                        <Label n={no("about")}>Maqsad</Label>
                        <h2
                            data-fx="heading"
                            className="mt-5 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl"
                        >
                            <Words text="Samarqand yoshlari nima?" />
                        </h2>
                    </div>

                    <div>
                        {/* O'qilgan sari so'zlar to'ladi */}
                        <p
                            data-fx="fill"
                            className="text-[1.3rem] font-medium leading-[1.5] tracking-tight md:text-[1.6rem]"
                        >
                            <Words
                                mask={false}
                                text="Samarqand yoshlari — viloyat yoshlarining g'oyasi, ovozi va imkoniyatlari bir joyga jamlangan ochiq maydon. Bu yerda tashabbus bildiriladi, ovoz bilan saralanadi, tashkilotlar muammosiga yechim taklif qilinadi, startap va bizneslar esa o'z hamkorini topadi."
                            />
                        </p>

                        <div data-fx="cards" className="mt-12 grid gap-4 sm:grid-cols-2">
                            {PRINCIPLES.map((item, index) => (
                                <div key={item.title}>
                                    <SpotlightCard
                                        tilt={5}
                                        className={`tone-${item.tone} hover:shadow-[0_22px_50px_-26px_var(--tone)]`}
                                    >
                                        <div className="spotlight relative h-full overflow-hidden rounded-[15px] bg-raised p-6 md:p-7">
                                            <span
                                                aria-hidden
                                                className="lp-dots absolute inset-y-0 right-0 w-1/2 [mask-image:linear-gradient(225deg,#000,transparent_60%)]"
                                            />
                                            <p className="lp-index relative text-tone-text">{pad(index + 1)}</p>
                                            <h3 className="relative mt-5 text-[19px] font-semibold tracking-tight">
                                                {item.title}
                                            </h3>
                                            <p className="relative mt-2 text-[14px] leading-relaxed text-muted">
                                                {item.text}
                                            </p>
                                        </div>
                                    </SpotlightCard>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= RAQAMLARDA — bo'lim joyida turadi, ichi almashadi ================= */}
            {story.length > 1 && (
                <section
                    data-scene="pin"
                    data-steps={story.length}
                    className="lp-story border-b border-line"
                    style={{ "--steps": story.length } as Vars}
                >
                    <div className="lp-story-pin">
                        <div className="container-page grid h-full content-center items-center gap-4 lg:grid-cols-2 lg:gap-10">
                            <div className="relative z-10 order-2 lg:order-1">
                                <Label n={no("numbers")}>Raqamlarda</Label>

                                <div className="lp-steps mt-7 lg:mt-9">
                                    {story.map((step, index) => (
                                        <article key={step.label} className="lp-step" style={{ "--i": index } as Vars}>
                                            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-accent-text">
                                                {step.label}
                                            </p>
                                            <p className="lp-number mt-2">{formatNumber(step.value)}</p>
                                            <p className="mt-3 text-[12.5px] font-semibold uppercase tracking-[0.14em]">
                                                {step.unit}
                                            </p>
                                            <p className="mt-4 max-w-md text-[15.5px] leading-relaxed text-muted md:text-[17px]">
                                                {step.text}
                                            </p>
                                        </article>
                                    ))}
                                </div>

                                <div aria-hidden className="lp-ticks mt-8">
                                    {story.map((step, index) => (
                                        <span key={step.label} style={{ "--i": index } as Vars} />
                                    ))}
                                </div>
                            </div>

                            <div className="lp-story-art order-1 lg:order-2">
                                <ParticleField
                                    shapes={story.map((step) => step.shape)}
                                    className="absolute inset-0 size-full"
                                />
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* ================= YO'NALISHLAR — yurganda faol band yonadi ================= */}
            {directions.length > 0 && (
                <section data-scene="spy" className="relative border-b border-line">
                    <div className="container-page grid gap-10 py-20 md:py-28 lg:grid-cols-[5fr_7fr] lg:gap-16">
                        <div className="lg:sticky lg:top-28 lg:self-start">
                            <Label n={no("directions")}>Yo&apos;nalishlar</Label>
                            <h2
                                data-fx="heading"
                                className="mt-5 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl"
                            >
                                <Words text={`${directions.length} yo'nalish, bitta maydon`} />
                            </h2>
                            <p data-fx="rise" className="mt-5 max-w-md text-[15.5px] leading-relaxed text-muted">
                                Har bir yo&apos;nalish — alohida ekotizim: tashabbus va ovozlar bilan birga
                                o&apos;sadi. O&apos;zingizga yaqinini tanlang.
                            </p>

                            {/* Faol yo'nalish — ro'yxat yurganda shu yerda almashadi */}
                            <div aria-hidden className="lp-panels mt-10 hidden lg:grid">
                                {directions.map((direction, index) => (
                                    <div
                                        key={direction.id}
                                        className="lp-panel"
                                        style={{ "--i": index, "--dir": direction.color } as Vars}
                                    >
                                        <p className="lp-panel-n">
                                            {pad(index + 1)}
                                            <span>/ {pad(directions.length)}</span>
                                        </p>
                                        <p className="mt-4 text-[17px] font-semibold tracking-tight">
                                            {direction.name}
                                        </p>
                                        <p className="mt-3 flex gap-6 text-[13px] text-muted">
                                            <span>
                                                <b className="text-[17px] font-semibold tabular-nums text-text">
                                                    {formatNumber(direction.ideas)}
                                                </b>{" "}
                                                tashabbus
                                            </span>
                                            <span>
                                                <b className="text-[17px] font-semibold tabular-nums text-text">
                                                    {formatNumber(direction.votes)}
                                                </b>{" "}
                                                ovoz
                                            </span>
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <ol className="lp-dirs">
                            {directions.map((direction, index) => (
                                <li
                                    key={direction.id}
                                    data-spy-item
                                    style={{ "--dir": direction.color } as Vars}
                                >
                                    <Link
                                        href={`/tashabbuslar/yoshlar?yonalish=${direction.id}`}
                                        className="lp-dir group"
                                    >
                                        <span className="lp-dir-n">{pad(index + 1)}</span>
                                        <span className="min-w-0 flex-1">
                                            <span className="lp-dir-name">{direction.name}</span>
                                            {direction.tagline && (
                                                <span className="lp-dir-text">{direction.tagline}</span>
                                            )}
                                        </span>
                                        <ArrowUpRight
                                            className="lp-dir-arrow size-5 shrink-0"
                                            strokeWidth={1.8}
                                        />
                                    </Link>
                                </li>
                            ))}
                        </ol>
                    </div>
                </section>
            )}

            {/* ================= YO'L — kartalar taxlanadi ================= */}
            <section className="relative border-b border-line">
                <div className="container-page py-20 md:py-28">
                    <div className="flex flex-wrap items-end justify-between gap-6">
                        <div>
                            <Label n={no("steps")}>Yo&apos;l</Label>
                            <h2
                                data-fx="heading"
                                className="mt-5 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl"
                            >
                                <Words text="Qanday ishlaydi" />
                            </h2>
                        </div>
                        <p data-fx="rise" className="max-w-xs text-[15.5px] leading-relaxed text-muted">
                            Ro&apos;yxatdan o&apos;tishdan natijagacha — to&apos;rt qadam.
                        </p>
                    </div>

                    <ol className="lp-stack mt-12">
                        {STEPS.map((step, index) => (
                            <li
                                key={step.title}
                                className={`lp-stack-card tone-${step.tone}`}
                                style={{ "--i": index } as Vars}
                            >
                                <span
                                    aria-hidden
                                    className="lp-dots absolute inset-y-0 right-0 w-2/5 [mask-image:linear-gradient(250deg,#000,transparent_70%)]"
                                />
                                <p className="lp-stack-n text-tone-text">{pad(index + 1)}</p>
                                <div className="relative">
                                    <p className="inline-flex rounded-full border border-tone-line bg-tone-soft px-3 py-1 text-[11.5px] font-semibold uppercase tracking-[0.1em] text-tone-text">
                                        {step.badge}
                                    </p>
                                    <h3 className="mt-4 text-2xl font-semibold tracking-tight sm:text-[2rem]">
                                        {step.title}
                                    </h3>
                                    <p className="mt-3 max-w-xl text-[15.5px] leading-relaxed text-muted md:text-[17px]">
                                        {step.text}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            {/* ================= BO'LIMLAR — pastga aylantirilsa kartalar yonga yuradi ================= */}
            {/* `dark` — yorug' rejimda ham to'q «sahna»: ichidagi ranglar o'zi moslashadi */}
            <section
                data-scene="pin"
                className="dark lp-rail bg-page text-text"
                style={{ "--count": SECTIONS.length } as Vars}
            >
                <div className="lp-rail-pin">
                    <div aria-hidden className="pointer-events-none absolute inset-0">
                        <div className="grid-lines absolute inset-0 opacity-30 [mask-image:radial-gradient(ellipse_80%_70%_at_50%_0%,#000,transparent)]" />
                        <div className="blob -left-32 top-10 size-[26rem] bg-[color-mix(in_oklab,var(--accent)_16%,transparent)]" />
                        <div
                            className="blob -right-32 bottom-0 size-[24rem] bg-[oklch(65%_0.14_255/0.14)]"
                            style={{ animationDelay: "-8s" }}
                        />
                    </div>

                    <div className="container-page relative">
                        <Label n={no("sections")}>Bo&apos;limlar</Label>
                        <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
                            <h2
                                data-fx="heading"
                                className="text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl"
                            >
                                <Words text="Platformada nima bor" />
                            </h2>
                            <p className="max-w-xs text-[15px] leading-relaxed text-muted">
                                Sakkizta bo&apos;lim — hammasi ochiq. Ko&apos;rish uchun ro&apos;yxatdan
                                o&apos;tish shart emas.
                            </p>
                        </div>
                        {/* Yo'l chizig'i — qancha yurilgani */}
                        <div aria-hidden className="lp-rail-line mt-8">
                            <span />
                        </div>
                    </div>

                    <div className="lp-rail-view relative mt-8">
                        <ul className="lp-rail-track">
                            {SECTIONS.map((item, index) => (
                                <li key={item.href}>
                                    <Link href={item.href} className={`lp-rail-card group tone-${item.tone}`}>
                                        <span
                                            aria-hidden
                                            className="lp-dots absolute inset-y-0 right-0 w-1/2 [mask-image:linear-gradient(225deg,#000,transparent_60%)]"
                                        />
                                        <span className="relative flex items-start justify-between">
                                            <span className="lp-index text-tone-text">{pad(index + 1)}</span>
                                            <span className="grid size-11 place-items-center rounded-xl border border-tone-line bg-tone-soft transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
                                                <item.icon className="size-5 text-tone-text" strokeWidth={1.6} />
                                            </span>
                                        </span>
                                        <span className="relative mt-auto block pt-10">
                                            <span className="block text-[20px] font-semibold tracking-tight">
                                                {item.title}
                                            </span>
                                            <span className="mt-2 block text-[14px] leading-relaxed text-muted">
                                                {item.description}
                                            </span>
                                            <span className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-tone-text">
                                                Ochish
                                                <ArrowRight
                                                    className="size-3.5 transition-transform duration-300 group-hover:translate-x-1"
                                                    strokeWidth={2}
                                                />
                                            </span>
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* ================= REYTING ================= */}
            {top.length > 0 && (
                <section className="overflow-x-clip border-b border-line">
                    <div className="container-page py-20 md:py-24">
                        <SectionHead
                            n={no("rating")}
                            label="Reyting"
                            title="Eng ko'p ovoz olganlar"
                            href="/tashabbuslar/yoshlar"
                        />

                        {/* Qatorlar navbat bilan ikki yondan kiradi */}
                        <div data-fx="zip" className="mt-10 space-y-2.5">
                            {top.map((idea, index) => (
                                <div key={idea.id} style={{ "--i": index } as Vars}>
                                    <Link
                                        href={`/tashabbuslar/${idea.id}`}
                                        className={`tone-${RANK_TONES[index] ?? "slate"} group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-line bg-raised p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-tone-line md:gap-6 md:p-5`}
                                    >
                                        {/* Ovozlar ulushi — qator ko'ringanda to'ladi */}
                                        <span
                                            aria-hidden
                                            className="lp-bar"
                                            style={{ "--w": idea.vote_count / topVotes } as Vars}
                                        />

                                        <span
                                            className={
                                                index < 3
                                                    ? "pulse-glow relative grid size-10 shrink-0 place-items-center rounded-xl border border-tone-line bg-tone-soft text-[14px] font-semibold tabular-nums text-tone-text"
                                                    : "relative grid size-10 shrink-0 place-items-center rounded-xl border border-line text-[14px] font-semibold tabular-nums text-faint"
                                            }
                                        >
                                            {index + 1}
                                        </span>

                                        <span className="relative min-w-0 flex-1">
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
                                                <span className="text-faint">{idea.author_label}</span>
                                            </span>
                                        </span>

                                        <span className="relative shrink-0 text-right">
                                            <span className="block text-[18px] font-semibold tabular-nums">
                                                {idea.vote_count}
                                            </span>
                                            <span className="text-[11.5px] text-faint">ovoz</span>
                                        </span>

                                        <ArrowUpRight
                                            className="relative hidden size-4 shrink-0 text-faint transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-tone-text sm:block"
                                            strokeWidth={2}
                                        />
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ================= YANGILIKLAR + TADBIRLAR ================= */}
            <section className="overflow-x-clip border-b border-line">
                <div className="container-page grid gap-14 py-20 md:py-24 lg:grid-cols-2 lg:gap-16">
                    <div>
                        <SectionHead
                            n={no("feed")}
                            label="Yangiliklar"
                            title="So'nggi xabarlar"
                            href="/yangiliklar"
                            compact
                        />

                        {/* Yangiliklar chapdan, tadbirlar o'ngdan kiradi */}
                        <div data-fx="left" className="mt-8 space-y-2.5">
                            {data?.latest_news?.length ? (
                                data.latest_news.map((item, index) => (
                                    <div key={item.id} style={{ "--i": index } as Vars}>
                                        <Link
                                            href={`/yangiliklar/${item.slug}`}
                                            className="tone-rose group flex gap-4 rounded-xl border border-line bg-raised p-3.5 transition-colors duration-300 hover:border-tone-line hover:bg-tone-soft"
                                        >
                                            <span className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-lg border border-tone-line bg-tone-soft text-tone-text">
                                                {item.image ? (
                                                    <Img
                                                        src={item.image}
                                                        sizes="56px"
                                                        maxWidth={256}
                                                        className="size-full object-cover"
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
                        <SectionHead label="Tadbirlar" title="Yaqin kunlarda" href="/tadbirlar" compact />

                        <div data-fx="right" className="mt-8 space-y-2.5">
                            {data?.upcoming_events?.length ? (
                                data.upcoming_events.map((event, index) => {
                                    const { day, month } = dayAndMonth(event.starts_at);
                                    return (
                                        <div key={event.id} style={{ "--i": index } as Vars}>
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
                                                        <span className="truncate">{event.location}</span>
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
            <section className="overflow-x-clip border-b border-line">
                <div className="container-page py-20 md:py-24">
                    <SectionHead
                        n={no("offers")}
                        label="E'lonlar"
                        title="Grant va imkoniyatlar"
                        href="/elonlar"
                    />

                    {/* Chap ustun chapdan, o'ng ustun o'ngdan */}
                    <div data-fx="zip" className="mt-10 grid gap-2.5 md:grid-cols-2">
                        {data?.announcements?.length ? (
                            data.announcements.map((item, index) => (
                                <div key={item.id} style={{ "--i": index } as Vars}>
                                    <Link
                                        href={`/elonlar/${item.slug}`}
                                        className={`${toneClass(item.icon)} group flex items-center gap-4 rounded-xl border border-line bg-raised p-3.5 transition-colors duration-300 hover:border-tone-line hover:bg-tone-soft`}
                                    >
                                        {item.image ? (
                                            <Img
                                                src={item.image}
                                                sizes="56px"
                                                maxWidth={256}
                                                className="size-14 shrink-0 rounded-2xl border border-line object-cover"
                                            />
                                        ) : (
                                            <CategoryTile slug={item.icon} size="lg" />
                                        )}

                                        <span className="min-w-0 flex-1">
                                            <span className="line-clamp-2 block text-[14.5px] font-medium leading-snug">
                                                {item.title}
                                            </span>
                                            <span className="mt-1.5 flex flex-wrap items-center gap-x-3 text-[12.5px]">
                                                <span className="font-medium text-tone-text">
                                                    {formatShortDate(item.posted_at)}
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
                <div aria-hidden className="pointer-events-none absolute inset-0">
                    <div className="blob -right-32 top-6 size-[26rem] bg-[oklch(65%_0.14_230/0.14)]" />
                    <div
                        className="blob -left-40 bottom-0 size-[22rem] bg-[color-mix(in_oklab,var(--accent)_14%,transparent)]"
                        style={{ animationDelay: "-7s" }}
                    />
                </div>

                <div className="container-page relative py-20 md:py-24">
                    <SectionHead
                        n={no("peers")}
                        label="Chet eldagi tengdoshlar"
                        title="Dunyo universitetlarida o'qiyotgan yoshlarimiz"
                        lead="Ular bilan bog'laning, tajriba so'rang — grant, qabul va hayot haqida birinchi qo'ldan bilib oling."
                        href="/tengdoshlar"
                    />

                    {data?.peers?.length ? (
                        // Kartalar yelpig'ich bo'lib ochiladi
                        <div
                            data-fx="deck"
                            className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
                            style={{ "--mid": (data.peers.length - 1) / 2 } as Vars}
                        >
                            {data.peers.map((peer, index) => (
                                <div key={peer.id} style={{ "--i": index } as Vars}>
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
            <section className="overflow-x-clip border-b border-line">
                <div className="container-page py-20 md:py-24">
                    <SectionHead
                        n={no("business")}
                        label="Tadbirkorlar"
                        title="Yoshlarning bizneslari"
                        href="/tadbirkorlar"
                    />

                    {data?.businesses?.length ? (
                        <div
                            data-fx="deck"
                            className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
                            style={{ "--mid": (data.businesses.length - 1) / 2 } as Vars}
                        >
                            {data.businesses.map((business, index) => (
                                <div key={business.id} style={{ "--i": index } as Vars}>
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
                            text="Ro'yxatdan o'ting, biznesingizni rasmlari bilan tanishtiring — tasdiqlangach shu yerda chiqadi."
                        />
                    )}
                </div>
            </section>

            {/* ================= STARTAPLAR ================= */}
            <section className="overflow-x-clip border-b border-line">
                <div className="container-page py-20 md:py-24">
                    <SectionHead
                        n={no("startups")}
                        label="Startaplar"
                        title="G'oyadan bozorgacha"
                        href="/startaplar"
                    />

                    {data?.startups?.length ? (
                        <div
                            data-fx="deck"
                            className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
                            style={{ "--mid": (data.startups.length - 1) / 2 } as Vars}
                        >
                            {data.startups.map((startup, index) => (
                                <div key={startup.id} style={{ "--i": index } as Vars}>
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

            {/* ================= CHAQIRIQ ================= */}
            <section className="relative overflow-hidden">
                <div aria-hidden className="aurora" />
                <div aria-hidden className="lp-dots absolute inset-0 [mask-image:radial-gradient(ellipse_60%_70%_at_50%_100%,#000,transparent)]" />
                {/* Orqadagi yog'du — sahifadan sekinroq siljiydi */}
                <div
                    aria-hidden
                    data-speed="0.6"
                    style={{ "--speed": 0.6 } as Vars}
                    className="pointer-events-none absolute left-1/2 top-1/2 size-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--accent)_22%,transparent),transparent_65%)] blur-2xl"
                />

                <div className="container-page relative py-24 md:py-36">
                    <div className="mx-auto max-w-3xl text-center">
                        <h2
                            data-fx="heading"
                            className="text-5xl font-semibold leading-[1.02] tracking-[-0.035em] sm:text-6xl md:text-7xl"
                        >
                            <Words text="Ovoz berish uchun qo'shiling" />
                        </h2>
                        {/* O'qilgan sari so'zlar to'ladi */}
                        <p
                            data-fx="fill"
                            className="mx-auto mt-7 max-w-xl text-[17px] leading-relaxed text-text md:text-[19px]"
                        >
                            <Words
                                text="Sahifalarni ko'rish hamma uchun ochiq. Ovoz berish va taklif yozish uchun Telegram bot orqali bir daqiqada ro'yxatdan o'ting."
                                mask={false}
                            />
                        </p>
                        <div data-fx="rise" className="mt-10">
                            <MagneticLink
                                href="/royxatdan-otish"
                                className="glow-ring group inline-flex items-center gap-2 rounded-full bg-invert px-8 py-4 text-[15.5px] font-medium text-on-invert"
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

/** Bo'lim belgisi: tartib raqami, chiziq va nom. */
function Label({ n, children }: { n?: number; children: ReactNode }) {
    return (
        <p className="flex items-center gap-3 text-[12px] font-medium uppercase leading-5 tracking-[0.14em] text-muted">
            {n ? <span className="font-semibold tabular-nums text-accent-text">{pad(n)}</span> : null}
            {/* Chiziq bo'ylab nur yugurib o'tadi */}
            <span aria-hidden className="line-sweep block h-px w-8 bg-line" />
            {children}
        </p>
    );
}

/**
 * Pastki bo'limlar sarlavhasi: belgi, sarlavha, «Barchasi» va chizilib chiqadigan chiziq.
 * Orqada yirik tartib raqami turadi — sahifa aylantirilganda yonga siljiydi.
 */
function SectionHead({
    n,
    label,
    title,
    lead,
    href,
    compact = false,
}: {
    n?: number;
    label: string;
    title: string;
    lead?: string;
    href: string;
    /** Yarim kenglikdagi ustun uchun — sarlavha kichikroq */
    compact?: boolean;
}) {
    return (
        <header className="relative">
            {n ? (
                <span aria-hidden data-scene="view" className="lp-ghost">
                    {pad(n)}
                </span>
            ) : null}

            <div className="relative flex flex-wrap items-end justify-between gap-4">
                <div>
                    <Label n={n}>{label}</Label>
                    <h2
                        data-fx="heading"
                        className={
                            compact
                                ? "mt-4 text-3xl font-semibold tracking-tight sm:text-[2.1rem]"
                                : "mt-5 max-w-2xl text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl"
                        }
                    >
                        <Words text={title} />
                    </h2>
                    {lead && (
                        <p data-fx="rise" className="mt-4 max-w-xl text-[15.5px] leading-relaxed text-muted">
                            {lead}
                        </p>
                    )}
                </div>
                {/* Havola o'ngdan sirg'alib kiradi */}
                <div data-fx="from-right">
                    <ViewAll href={href} />
                </div>
            </div>

            {/* Chiziq chapdan o'ngga chiziladi */}
            <div aria-hidden data-fx="line" className="lp-rule mt-7" />
        </header>
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
            data-fx="rise"
            className={`${tone} group mt-10 flex flex-col items-start gap-5 rounded-2xl border border-dashed border-tone-line bg-tone-soft p-6 sm:flex-row sm:items-center sm:p-8`}
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
                        <Img
                            src={peer.photo}
                            sizes={IMAGE_SIZES.smallCard}
                            maxWidth={640}
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
