import type { Metadata } from "next";
import Link from "next/link";

import { Icon, type IconName } from "@/components/icon";
import { CountUp, Reveal, Stagger, StaggerItem } from "@/components/motion-primitives";
import { getDirections, getProblems } from "@/lib/api";

export const metadata: Metadata = {
    alternates: { canonical: "/tashabbuslar" },
    title: "Tashabbuslar",
    description:
        "Yoshlar tashabbuslari va tashkilotlar muammolari — ikki yo'nalish, bitta maqsad.",
};

/** Kartaning ichidagi qatorcha. */
function Point({ icon, children }: { icon: IconName; children: React.ReactNode }) {
    return (
        <li className="flex items-start gap-2.5 text-[13.5px] leading-relaxed text-muted">
            <Icon name={icon} size={15} className="mt-0.5 shrink-0 text-tone-text" />
            {children}
        </li>
    );
}

export default async function InitiativesHubPage() {
    const [directions, problems] = await Promise.all([
        getDirections().catch(() => []),
        getProblems().catch(() => null),
    ]);

    const ideas = directions.reduce((sum, item) => sum + item.ideas, 0);
    const votes = directions.reduce((sum, item) => sum + item.votes, 0);
    const problemCount = problems?.count ?? 0;
    const solutionCount =
        problems?.results.reduce((sum, item) => sum + item.solution_count, 0) ?? 0;

    return (
        <>
            <section className="relative overflow-hidden border-b border-line">
                <div aria-hidden className="aurora" />
                <div
                    aria-hidden
                    className="grid-lines pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(70%_60%_at_50%_0%,#000,transparent)]"
                />

                <div className="container-page relative py-14 md:py-20">
                    <Reveal className="max-w-2xl">
                        <span className="inline-flex items-center gap-2 rounded-full border border-line bg-page/70 px-3 py-1 text-[11.5px] font-medium uppercase tracking-[0.12em] text-muted backdrop-blur">
                            <span className="size-1.5 rounded-full bg-accent" />
                            Tashabbuslar
                        </span>

                        <h1 className="mt-5 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
                            Ikki tomondan{" "}
                            <span className="bg-gradient-to-r from-accent to-text bg-clip-text text-transparent">
                                bitta yechim
                            </span>
                        </h1>

                        <p className="mt-5 text-[16px] leading-relaxed text-muted">
                            Bir tomonda yoshlarning g&apos;oyasi, ikkinchi tomonda tashkilotlarning
                            haqiqiy muammosi. Qaysi biri sizniki — o&apos;shanisini tanlang.
                        </p>
                    </Reveal>
                </div>
            </section>

            <section className="container-page py-10 md:py-14">
                <Stagger className="grid gap-5 lg:grid-cols-2">
                    {/* ---------- Yoshlar tashabbuslari ---------- */}
                    <StaggerItem>
                        <Link
                            href="/tashabbuslar/yoshlar"
                            className="tone-emerald group relative flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-raised p-7 transition-all duration-300 hover:-translate-y-1 hover:border-tone-line hover:shadow-[0_30px_60px_-30px_var(--tone)] md:p-9"
                        >
                            <div
                                aria-hidden
                                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                                style={{
                                    background:
                                        "radial-gradient(28rem 16rem at 80% -10%, var(--tone), transparent 60%)",
                                }}
                            />

                            <div className="relative flex items-center justify-between gap-4">
                                <span className="grid size-14 place-items-center rounded-2xl border border-tone-line bg-tone-soft text-tone-text">
                                    <Icon name="spark" size={26} strokeWidth={1.6} />
                                </span>
                                <span className="rounded-full bg-tone-soft px-3 py-1 text-[11.5px] font-medium text-tone-text">
                                    Hamma uchun ochiq
                                </span>
                            </div>

                            <h2 className="relative mt-7 text-2xl font-semibold tracking-tight sm:text-3xl">
                                Yoshlar tashabbuslari
                            </h2>
                            <p className="relative mt-3 text-[14.5px] leading-relaxed text-muted">
                                14 yo&apos;nalish, har birining o&apos;z tirik ekotizimi bor.
                                G&apos;oyangizni bildiring, boshqalarnikiga ovoz bering — ovoz
                                yig&apos;ilgan sari sahna o&apos;sadi.
                            </p>

                            <ul className="relative mt-6 space-y-2.5">
                                <Point icon="bulb">G&apos;oya yoki loyiha bildirish</Point>
                                <Point icon="vote">Yoqqaniga ovoz berish</Point>
                                <Point icon="chat">Fikr yozish va muhokama</Point>
                            </ul>

                            <div className="relative mt-auto flex items-end justify-between gap-4 pt-8">
                                <dl className="flex gap-7">
                                    <div>
                                        <dd className="text-2xl font-semibold tabular-nums tracking-tight text-tone-text">
                                            <CountUp value={ideas} />
                                        </dd>
                                        <dt className="mt-0.5 text-[12px] text-muted">Tashabbus</dt>
                                    </div>
                                    <div>
                                        <dd className="text-2xl font-semibold tabular-nums tracking-tight text-tone-text">
                                            <CountUp value={votes} />
                                        </dd>
                                        <dt className="mt-0.5 text-[12px] text-muted">Ovoz</dt>
                                    </div>
                                </dl>

                                <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-tone-line bg-tone-soft text-tone-text transition-transform duration-300 group-hover:translate-x-1">
                                    <Icon name="arrowRight" size={18} />
                                </span>
                            </div>
                        </Link>
                    </StaggerItem>

                    {/* ---------- Tashkilotlar ---------- */}
                    <StaggerItem>
                        <Link
                            href="/tashabbuslar/muammolar"
                            className="tone-violet group relative flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-raised p-7 transition-all duration-300 hover:-translate-y-1 hover:border-tone-line hover:shadow-[0_30px_60px_-30px_var(--tone)] md:p-9"
                        >
                            <div
                                aria-hidden
                                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                                style={{
                                    background:
                                        "radial-gradient(28rem 16rem at 80% -10%, var(--tone), transparent 60%)",
                                }}
                            />

                            <div className="relative flex items-center justify-between gap-4">
                                <span className="grid size-14 place-items-center rounded-2xl border border-tone-line bg-tone-soft text-tone-text">
                                    <Icon name="building" size={26} strokeWidth={1.6} />
                                </span>
                                <span className="rounded-full bg-tone-soft px-3 py-1 text-[11.5px] font-medium text-tone-text">
                                    Haqiqiy muammolar
                                </span>
                            </div>

                            <h2 className="relative mt-7 text-2xl font-semibold tracking-tight sm:text-3xl">
                                Tashkilotlar
                            </h2>
                            <p className="relative mt-3 text-[14.5px] leading-relaxed text-muted">
                                Tashkilotlar o&apos;z muammosini yozadi, yoshlar esa yechim taklif
                                qiladi. Ko&apos;p layk yig&apos;gan taklif tepaga chiqadi va
                                tashkilotga yetib boradi.
                            </p>

                            <ul className="relative mt-6 space-y-2.5">
                                <Point icon="clipboard">Muammoni o&apos;qish</Point>
                                <Point icon="bulb">O&apos;z yechimingizni yozish</Point>
                                <Point icon="heart">Yoqqan taklifga layk berish</Point>
                            </ul>

                            <div className="relative mt-auto flex items-end justify-between gap-4 pt-8">
                                <dl className="flex gap-7">
                                    <div>
                                        <dd className="text-2xl font-semibold tabular-nums tracking-tight text-tone-text">
                                            <CountUp value={problemCount} />
                                        </dd>
                                        <dt className="mt-0.5 text-[12px] text-muted">Muammo</dt>
                                    </div>
                                    <div>
                                        <dd className="text-2xl font-semibold tabular-nums tracking-tight text-tone-text">
                                            <CountUp value={solutionCount} />
                                        </dd>
                                        <dt className="mt-0.5 text-[12px] text-muted">Taklif</dt>
                                    </div>
                                </dl>

                                <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-tone-line bg-tone-soft text-tone-text transition-transform duration-300 group-hover:translate-x-1">
                                    <Icon name="arrowRight" size={18} />
                                </span>
                            </div>
                        </Link>
                    </StaggerItem>
                </Stagger>

                <Reveal delay={0.15} className="mt-6 text-center">
                    <p className="text-[13.5px] text-muted">
                        Ko&apos;rish uchun ro&apos;yxatdan o&apos;tish shart emas. Ovoz berish,
                        taklif yozish va tashabbus bildirish uchungina kirish kerak.
                    </p>
                </Reveal>
            </section>
        </>
    );
}
