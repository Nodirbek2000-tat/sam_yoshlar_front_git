import type { Metadata } from "next";
import Link from "next/link";

import { CategoryTile } from "@/components/category-tile";
import { FilterChip, FilterRow } from "@/components/filter-chip";
import { Icon } from "@/components/icon";
import { SectionTabs } from "@/components/initiatives/section-tabs";
import { Reveal, Stagger, StaggerItem } from "@/components/motion-primitives";
import { getProblems } from "@/lib/api";
import { getCurrentUser } from "@/lib/session";
import { toneClass } from "@/lib/tone";
import type { Problem } from "@/lib/types";

export const metadata: Metadata = {
    alternates: { canonical: "/tashabbuslar/muammolar" },
    title: "Tashkilotlar muammolari",
    description:
        "Tashkilotlar real muammolarini yozadi, yoshlar esa ularga yechim taklif etadi.",
};

export default async function ProblemsPage({
    searchParams,
}: PageProps<"/tashabbuslar/muammolar">) {
    const params = await searchParams;
    const soha = typeof params.soha === "string" ? params.soha : undefined;

    const [page, user] = await Promise.all([getProblems().catch(() => null), getCurrentUser()]);
    const all = page?.results ?? [];
    const isOrganization = user?.role === "organization";

    // Kategoriya bo'yicha filtr — ro'yxat kichik, shuning uchun shu yerda saralaymiz
    const problems = soha ? all.filter((item) => item.category === soha) : all;

    const categories = Array.from(
        all
            .reduce((map, item) => {
                const found = map.get(item.category);
                map.set(item.category, {
                    label: item.category_display,
                    icon: item.icon,
                    count: (found?.count ?? 0) + 1,
                });
                return map;
            }, new Map<string, { label: string; icon: string; count: number }>())
            .entries(),
    );

    return (
        <>
            <section className="relative overflow-hidden border-b border-line">
                <div aria-hidden className="aurora" />
                <div
                    aria-hidden
                    className="grid-lines pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(70%_60%_at_50%_0%,#000,transparent)]"
                />

                <div className="container-page relative py-10 md:py-12">
                    <SectionTabs />

                    <Reveal className="mt-8 max-w-xl">
                        <span className="tone-violet inline-flex items-center gap-2 rounded-full border border-tone-line bg-tone-soft px-3 py-1 text-[11.5px] font-medium uppercase tracking-[0.12em] text-tone-text">
                            <span className="size-1.5 rounded-full bg-tone" />
                            Tashkilotlar
                        </span>

                        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
                            Muammo bor — yechim sizdan
                        </h1>

                        <p className="mt-3.5 text-[15.5px] leading-relaxed text-muted">
                            Muammoni tashkilotning o&apos;zi yozadi. Har kim kirib taklifini
                            qoldirishi mumkin — ko&apos;p layk yig&apos;gan taklif tepaga
                            chiqadi va tashkilotga yetib boradi.
                        </p>

                        {isOrganization ? (
                            <Link
                                href="/tashabbuslar/muammolar/yozish"
                                className="mt-7 inline-flex items-center gap-2 rounded-full bg-invert px-5 py-2.5 text-[14px] font-medium text-on-invert transition-opacity hover:opacity-90"
                            >
                                <Icon name="plus" size={15} />
                                Muammo yozish
                            </Link>
                        ) : (
                            <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-[12.5px] text-muted">
                                <Icon name="building" size={13} />
                                Muammo yozish tashkilot hisobiga ochiq
                            </p>
                        )}
                    </Reveal>
                </div>
            </section>

            <section className="container-page py-8 md:py-10">
                {categories.length > 1 && (
                    <div className="pb-6">
                        <FilterRow>
                            <FilterChip
                                href="/tashabbuslar/muammolar"
                                active={!soha}
                                label="Barchasi"
                                count={all.length}
                            />
                            {categories.map(([value, info]) => (
                                <FilterChip
                                    key={value}
                                    href={`/tashabbuslar/muammolar?soha=${value}`}
                                    active={soha === value}
                                    label={info.label}
                                    tone={info.icon}
                                    count={info.count}
                                />
                            ))}
                        </FilterRow>
                    </div>
                )}

                {problems.length ? (
                    <Stagger className="grid gap-4 md:grid-cols-2">
                        {problems.map((problem) => (
                            <StaggerItem key={problem.id}>
                                <ProblemCard problem={problem} />
                            </StaggerItem>
                        ))}
                    </Stagger>
                ) : (
                    <div className="rounded-2xl border border-dashed border-line py-20 text-center">
                        <span className="tone-violet mx-auto grid size-14 place-items-center rounded-2xl bg-tone-soft">
                            <Icon
                                name="clipboard"
                                size={24}
                                className="text-tone-text"
                                strokeWidth={1.5}
                            />
                        </span>
                        <p className="mt-4 text-[14px] text-muted">
                            Hozircha ochiq muammo yo&apos;q.
                        </p>
                    </div>
                )}
            </section>
        </>
    );
}

function ProblemCard({ problem }: { problem: Problem }) {
    return (
        <Link
            href={`/tashabbuslar/muammolar/${problem.id}`}
            className={`${toneClass(problem.icon)} group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-raised transition-all duration-300 hover:-translate-y-0.5 hover:border-tone-line hover:shadow-[0_16px_40px_-20px_var(--tone)]`}
        >
            <div className="flex items-start gap-4 border-b border-tone-line bg-tone-soft p-5">
                <CategoryTile slug={problem.icon} size="md" className="border-tone-line bg-page" />

                <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14.5px] font-semibold">
                        {problem.organization.name}
                    </span>
                    <span className="mt-1 flex flex-wrap items-center gap-x-3 text-[12px] text-muted">
                        <span>{problem.organization.sphere_display}</span>
                        {problem.organization.region_display && (
                            <span>{problem.organization.region_display}</span>
                        )}
                    </span>
                </span>
            </div>

            <div className="flex flex-1 flex-col p-5">
                <span className="text-[11.5px] font-medium uppercase tracking-[0.08em] text-tone-text">
                    {problem.category_display}
                </span>

                <h2 className="mt-1.5 line-clamp-2 text-[15.5px] font-semibold leading-snug">
                    {problem.question}
                </h2>

                <p className="mt-2 line-clamp-3 flex-1 text-[13.5px] leading-relaxed text-muted">
                    {problem.description}
                </p>

                <div className="mt-5 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-[12.5px] text-muted">
                        <Icon name="bulb" size={14} className="text-tone-text" />
                        <span className="font-semibold tabular-nums text-text">
                            {problem.solution_count}
                        </span>
                        taklif
                    </span>

                    <span className="inline-flex items-center gap-1.5 rounded-full bg-tone-soft px-3 py-1.5 text-[12.5px] font-medium text-tone-text">
                        Taklif berish
                        <Icon
                            name="arrowRight"
                            size={12}
                            className="transition-transform duration-300 group-hover:translate-x-1"
                        />
                    </span>
                </div>
            </div>
        </Link>
    );
}
