import type { Metadata } from "next";
import Link from "next/link";

import { StartupCard, STAGE_TONE } from "@/components/directory/cards";
import { FilterChip, FilterRow } from "@/components/filter-chip";
import { Icon } from "@/components/icon";
import { Stagger, StaggerItem } from "@/components/motion-primitives";
import { PageHero } from "@/components/page-hero";
import { getStartups } from "@/lib/api";
import { cn } from "@/lib/cn";
import type { PublicStartup } from "@/lib/types";

export const metadata: Metadata = {
    title: "Startaplar",
    description: "Yosh startupperlarning loyihalari: bosqichi, jamoasi va kerakli investitsiya.",
};

function tally(rows: PublicStartup[], key: "sphere" | "stage") {
    const map = new Map<string, { label: string; icon: string; count: number }>();
    for (const row of rows) {
        const found = map.get(row[key]);
        map.set(row[key], {
            label: key === "sphere" ? row.sphere_display : row.stage_display,
            icon: row.sphere_icon,
            count: (found?.count ?? 0) + 1,
        });
    }
    return [...map.entries()].sort((a, b) => b[1].count - a[1].count);
}

/** Bosqichlar tabiiy tartibda — g'oyadan kengayishgacha. */
const STAGE_ORDER = ["idea", "mvp", "launched", "scaling"];

export default async function StartupsPage({ searchParams }: PageProps<"/startaplar">) {
    const params = await searchParams;
    const soha = typeof params.soha === "string" ? params.soha : undefined;
    const bosqich = typeof params.bosqich === "string" ? params.bosqich : undefined;

    const [page, all] = await Promise.all([
        getStartups({ soha, bosqich }).catch(() => null),
        soha || bosqich ? getStartups({}).catch(() => null) : Promise.resolve(null),
    ]);

    const startups = page?.results ?? [];
    const source = all?.results ?? startups;
    const spheres = tally(source, "sphere");
    const stages = tally(source, "stage").sort(
        (a, b) => STAGE_ORDER.indexOf(a[0]) - STAGE_ORDER.indexOf(b[0]),
    );

    const link = (next: { soha?: string; bosqich?: string }) => {
        const query = new URLSearchParams();
        if (next.soha) query.set("soha", next.soha);
        if (next.bosqich) query.set("bosqich", next.bosqich);
        const text = query.toString();
        return `/startaplar${text ? `?${text}` : ""}`;
    };

    return (
        <>
            <PageHero
                eyebrow="Startaplar"
                title={
                    <>
                        G&apos;oyadan <span className="text-accent">bozorgacha</span>
                    </>
                }
                lead="Yosh startupperlarning loyihalari — qaysi bosqichda, jamoasi qancha va qancha investitsiya kerak. Investor, mentor yoki hamkor bo'lsangiz, to'g'ridan-to'g'ri bog'laning."
                action={
                    <Link
                        href="/royxatdan-otish"
                        className="inline-flex items-center gap-2 rounded-full bg-invert px-5 py-2.5 text-[14px] font-medium text-on-invert transition-opacity hover:opacity-90"
                    >
                        <Icon name="rocket" size={15} />
                        Startapimni qo&apos;shish
                    </Link>
                }
            />

            <section className="container-page py-12 md:py-16">
                {/* Bosqichlar — raqamli lenta, bosilsa filtrlaydi */}
                {stages.length > 0 && (
                    <div className="mb-8 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                        {STAGE_ORDER.map((value) => {
                            const found = stages.find(([key]) => key === value);
                            if (!found) return null;
                            const [, info] = found;
                            const active = bosqich === value;

                            return (
                                <Link
                                    key={value}
                                    href={active ? link({ soha }) : link({ soha, bosqich: value })}
                                    scroll={false}
                                    className={cn(
                                        STAGE_TONE[value],
                                        "rounded-2xl border p-4 transition-colors duration-200",
                                        active
                                            ? "border-tone bg-tone-soft"
                                            : "border-line hover:border-tone-line hover:bg-tone-soft",
                                    )}
                                >
                                    <span className="text-2xl font-semibold tabular-nums text-tone-text">
                                        {info.count}
                                    </span>
                                    <span className="mt-0.5 block text-[12.5px] text-muted">
                                        {info.label}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                )}

                {spheres.length > 1 && (
                    <div className="pb-8">
                        <FilterRow>
                            <FilterChip
                                href={link({ bosqich })}
                                active={!soha}
                                label="Barcha yo'nalish"
                                count={source.length}
                            />
                            {spheres.map(([value, info]) => (
                                <FilterChip
                                    key={value}
                                    href={link({ soha: value, bosqich })}
                                    active={soha === value}
                                    label={info.label}
                                    tone={info.icon}
                                    count={info.count}
                                />
                            ))}
                        </FilterRow>
                    </div>
                )}

                {startups.length ? (
                    <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {startups.map((startup) => (
                            <StaggerItem key={startup.id}>
                                <StartupCard startup={startup} />
                            </StaggerItem>
                        ))}
                    </Stagger>
                ) : (
                    <div className="tone-orange rounded-2xl border border-dashed border-line py-20 text-center">
                        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-tone-soft">
                            <Icon name="rocket" size={24} className="text-tone-text" strokeWidth={1.5} />
                        </span>
                        <p className="mt-4 text-[14.5px] font-medium">
                            {soha || bosqich
                                ? "Bu filtr bo'yicha startap topilmadi"
                                : "Hali startap qo'shilmagan"}
                        </p>
                        <Link
                            href={soha || bosqich ? "/startaplar" : "/royxatdan-otish"}
                            className="mt-4 inline-flex items-center gap-1.5 text-[13.5px] font-medium text-accent hover:underline"
                        >
                            {soha || bosqich ? "Barcha startaplar" : "Ro'yxatdan o'tish"}
                            <Icon name="arrowRight" size={13} />
                        </Link>
                    </div>
                )}
            </section>
        </>
    );
}
