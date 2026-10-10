import type { Metadata } from "next";
import Link from "next/link";

import { FilterChip, FilterRow } from "@/components/filter-chip";
import { Icon } from "@/components/icon";
import { Stagger, StaggerItem } from "@/components/motion-primitives";
import { OFFICE_STAGES, OfficeCard, sphereOf } from "@/components/office/office-ui";
import { PageHero } from "@/components/page-hero";
import { getOfficeStartups } from "@/lib/api";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";

export const metadata: Metadata = {
    alternates: { canonical: "/startuplar-ofisi" },
    title: "Samarqand startuplar ofisi",
    description:
        "Samarqand viloyati startuplar ofisi reestridagi yosh startaplar: loyiha, asoschi, soha va bosqich. Asoschi bilan Telegram orqali bog'laning.",
};

type Filters = { soha?: string; bosqich?: string; hudud?: string; q?: string };

function link(next: Filters) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(next)) if (value) query.set(key, value);
    const text = query.toString();
    return `/startuplar-ofisi${text ? `?${text}` : ""}`;
}

export default async function OfficePage({ searchParams }: PageProps<"/startuplar-ofisi">) {
    const params = await searchParams;
    const pick = (key: string) => (typeof params[key] === "string" ? (params[key] as string) : undefined);
    const filters: Filters = { soha: pick("soha"), bosqich: pick("bosqich"), hudud: pick("hudud"), q: pick("q") };
    const filtered = Boolean(filters.soha || filters.bosqich || filters.hudud || filters.q);

    const data = await getOfficeStartups(filters).catch(() => null);
    const items = data?.results ?? [];
    const facets = data?.facets;
    const total = data?.total ?? 0;
    const stageCount = (value: string) => facets?.stages.find((item) => item.value === value)?.count ?? 0;

    return (
        <>
            <PageHero
                eyebrow="Samarqand startuplar ofisi"
                title={
                    <>
                        Viloyatning <span className="text-accent">yosh startaplari</span> bir joyda
                    </>
                }
                lead="Startuplar ofisi reestridagi loyihalar va ularning asoschilari. Investor, mentor yoki hamkor bo'lsangiz — asoschiga to'g'ridan-to'g'ri Telegram'da yozing."
                action={
                    <div className="flex flex-wrap gap-2.5">
                        {[
                            { value: formatNumber(total), label: "loyiha" },
                            { value: String(facets?.spheres.length ?? 0), label: "soha" },
                            { value: String(facets?.districts.length ?? 0), label: "tuman va shahar" },
                        ].map((stat) => (
                            <span
                                key={stat.label}
                                className="inline-flex items-baseline gap-1.5 rounded-2xl border border-line bg-page/70 px-4 py-2.5 backdrop-blur"
                            >
                                <span className="text-xl font-semibold tabular-nums tracking-tight">{stat.value}</span>
                                <span className="text-[13px] text-muted">{stat.label}</span>
                            </span>
                        ))}
                    </div>
                }
            />

            <section className="container-page py-10 md:py-14">
                {/* Bosqichlar — raqamli lenta, bosilsa saralaydi */}
                <div className="mb-7 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                    {OFFICE_STAGES.map((stage) => {
                        const active = filters.bosqich === stage.value;
                        const count = stageCount(stage.value);
                        return (
                            <Link
                                key={stage.value}
                                href={link({ ...filters, bosqich: active ? undefined : stage.value })}
                                scroll={false}
                                className={cn(
                                    stage.tone,
                                    "rounded-2xl border p-4 transition-colors duration-200",
                                    active ? "border-tone bg-tone-soft" : "border-line hover:border-tone-line hover:bg-tone-soft",
                                    !count && "pointer-events-none opacity-50",
                                )}
                            >
                                <span className="text-2xl font-semibold tabular-nums text-tone-text">{count}</span>
                                <span className="mt-0.5 block text-[13px] font-medium">{stage.label}</span>
                                <span className="block text-[12px] text-muted">{stage.hint}</span>
                            </Link>
                        );
                    })}
                </div>

                {/* Qidiruv */}
                <form action="/startuplar-ofisi" className="mb-5 flex flex-col gap-2.5 sm:flex-row">
                    {filters.soha && <input type="hidden" name="soha" value={filters.soha} />}
                    {filters.bosqich && <input type="hidden" name="bosqich" value={filters.bosqich} />}
                    {filters.hudud && <input type="hidden" name="hudud" value={filters.hudud} />}
                    <label className="relative flex-1">
                        <Icon
                            name="search"
                            size={16}
                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-faint"
                        />
                        <input
                            name="q"
                            defaultValue={filters.q ?? ""}
                            placeholder="Loyiha, asoschi yoki g'oya bo'yicha qidirish"
                            className="w-full rounded-full border border-line bg-raised py-3 pl-11 pr-4 text-[14.5px] outline-none transition-colors placeholder:text-faint focus:border-accent"
                        />
                    </label>
                    <button
                        type="submit"
                        className="rounded-full bg-invert px-6 py-3 text-[14px] font-medium text-on-invert transition-opacity hover:opacity-90"
                    >
                        Qidirish
                    </button>
                </form>

                {/* Sohalar */}
                {facets && facets.spheres.length > 1 && (
                    <div className="pb-3">
                        <FilterRow>
                            <FilterChip
                                href={link({ ...filters, soha: undefined })}
                                active={!filters.soha}
                                label="Barcha sohalar"
                                count={total}
                            />
                            {facets.spheres.map((sphere) => {
                                const info = sphereOf(sphere.value);
                                return (
                                    <FilterChip
                                        key={sphere.value}
                                        href={link({ ...filters, soha: sphere.value })}
                                        active={filters.soha === sphere.value}
                                        label={info.short}
                                        tone={info.tone}
                                        count={sphere.count}
                                        icon={<span aria-hidden>{info.emoji}</span>}
                                    />
                                );
                            })}
                        </FilterRow>
                    </div>
                )}

                {/* Tumanlar */}
                {facets && facets.districts.length > 1 && (
                    <div className="pb-8">
                        <FilterRow>
                            <FilterChip
                                href={link({ ...filters, hudud: undefined })}
                                active={!filters.hudud}
                                label="Barcha hududlar"
                            />
                            {facets.districts.map((district) => (
                                <FilterChip
                                    key={district.value}
                                    href={link({ ...filters, hudud: district.value })}
                                    active={filters.hudud === district.value}
                                    label={district.label}
                                    tone="pin"
                                    count={district.count}
                                />
                            ))}
                        </FilterRow>
                    </div>
                )}

                {filtered && (
                    <p className="mb-5 flex flex-wrap items-center gap-3 text-[13.5px] text-muted">
                        <span>
                            Topildi: <b className="text-text">{data?.count ?? 0}</b> ta loyiha
                        </span>
                        <Link href="/startuplar-ofisi" className="font-medium text-accent hover:underline">
                            Filtrni tozalash
                        </Link>
                    </p>
                )}

                {items.length ? (
                    <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {items.map((item) => (
                            <StaggerItem key={item.id}>
                                <OfficeCard item={item} />
                            </StaggerItem>
                        ))}
                    </Stagger>
                ) : (
                    <div className="tone-orange rounded-3xl border border-dashed border-line py-20 text-center">
                        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-tone-soft">
                            <Icon name="rocket" size={24} className="text-tone-text" strokeWidth={1.5} />
                        </span>
                        <p className="mt-4 text-[14.5px] font-medium">
                            {filtered ? "Bu bo'yicha loyiha topilmadi" : "Hozircha loyiha qo'shilmagan"}
                        </p>
                        {filtered && (
                            <Link
                                href="/startuplar-ofisi"
                                className="mt-4 inline-flex items-center gap-1.5 text-[13.5px] font-medium text-accent hover:underline"
                            >
                                Barcha loyihalar
                                <Icon name="arrowRight" size={13} />
                            </Link>
                        )}
                    </div>
                )}
            </section>
        </>
    );
}
