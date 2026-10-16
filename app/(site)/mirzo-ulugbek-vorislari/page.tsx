import type { Metadata } from "next";
import Link from "next/link";

import { FilterChip, FilterRow } from "@/components/filter-chip";
import { Icon } from "@/components/icon";
import { LaureateCard } from "@/components/laureates/laureate-ui";
import { Stagger, StaggerItem } from "@/components/motion-primitives";
import { StartupTabs } from "@/components/office/startup-tabs";
import { PageHero } from "@/components/page-hero";
import { getLaureates } from "@/lib/api";
import { formatNumber } from "@/lib/format";

export const metadata: Metadata = {
    alternates: { canonical: "/mirzo-ulugbek-vorislari" },
    title: "Mirzo Ulug'bek vorislari",
    description:
        "«Mirzo Ulug'bek vorislari» respublika tanlovining Samarqand viloyati g'oliblari va ularning loyihalari — Samarqand viloyati Innovatsion rivojlanish bo'linmasi.",
};

type Filters = { yil?: string; q?: string };

function link(next: Filters) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(next)) if (value) query.set(key, value);
    const text = query.toString();
    return `/mirzo-ulugbek-vorislari${text ? `?${text}` : ""}`;
}

export default async function LaureatesPage({ searchParams }: PageProps<"/mirzo-ulugbek-vorislari">) {
    const params = await searchParams;
    const pick = (key: string) => (typeof params[key] === "string" ? (params[key] as string) : undefined);
    const filters: Filters = { yil: pick("yil"), q: pick("q") };
    const filtered = Boolean(filters.yil || filters.q);

    const data = await getLaureates(filters).catch(() => null);
    const items = data?.results ?? [];
    const years = data?.years ?? [];

    return (
        <>
            <PageHero
                eyebrow="Samarqand viloyati Innovatsion rivojlanish bo'linmasi"
                title={
                    <>
                        Mirzo Ulug&apos;bek <span className="text-accent">vorislari</span>
                    </>
                }
                lead="«Mirzo Ulug'bek vorislari» respublika tanlovining Samarqand viloyati g'oliblari — yosh ixtirochilar va ularning innovatsion loyihalari."
                action={
                    <div className="flex flex-wrap gap-2.5">
                        {[
                            { value: formatNumber(data?.total ?? 0), label: "g'olib" },
                            { value: formatNumber(data?.national ?? 0), label: "respublika g'olibi" },
                            { value: String(years.length), label: "yil" },
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
                <StartupTabs active="vorislar" />

                {/* Qidiruv */}
                <form action="/mirzo-ulugbek-vorislari" className="mb-5 flex flex-col gap-2.5 sm:flex-row">
                    {filters.yil && <input type="hidden" name="yil" value={filters.yil} />}
                    <label className="relative flex-1">
                        <Icon
                            name="search"
                            size={16}
                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-faint"
                        />
                        <input
                            name="q"
                            defaultValue={filters.q ?? ""}
                            placeholder="G'olib yoki loyiha nomi bo'yicha qidirish"
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

                {/* Tanlov yillari */}
                {years.length > 1 && (
                    <div className="pb-8">
                        <FilterRow>
                            <FilterChip
                                href={link({ ...filters, yil: undefined })}
                                active={!filters.yil}
                                label="Barcha yillar"
                                count={data?.total}
                            />
                            {years.map((year) => (
                                <FilterChip
                                    key={year.value}
                                    href={link({ ...filters, yil: String(year.value) })}
                                    active={filters.yil === String(year.value)}
                                    label={`${year.value}-yil`}
                                    icon={<Icon name="calendar" size={12} />}
                                    count={year.count}
                                />
                            ))}
                        </FilterRow>
                    </div>
                )}

                {filtered && (
                    <p className="mb-5 flex flex-wrap items-center gap-3 text-[13.5px] text-muted">
                        <span>
                            Topildi: <b className="text-text">{data?.count ?? 0}</b> ta g&apos;olib
                        </span>
                        <Link href="/mirzo-ulugbek-vorislari" className="font-medium text-accent hover:underline">
                            Filtrni tozalash
                        </Link>
                    </p>
                )}

                {items.length ? (
                    <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {items.map((item) => (
                            <StaggerItem key={item.id}>
                                <LaureateCard item={item} />
                            </StaggerItem>
                        ))}
                    </Stagger>
                ) : (
                    <div className="tone-blue rounded-3xl border border-dashed border-line py-20 text-center">
                        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-tone-soft">
                            <Icon name="trophy" size={24} className="text-tone-text" strokeWidth={1.5} />
                        </span>
                        <p className="mt-4 text-[14.5px] font-medium">
                            {filtered ? "Bu bo'yicha g'olib topilmadi" : "Hozircha g'oliblar qo'shilmagan"}
                        </p>
                        {filtered && (
                            <Link
                                href="/mirzo-ulugbek-vorislari"
                                className="mt-4 inline-flex items-center gap-1.5 text-[13.5px] font-medium text-accent hover:underline"
                            >
                                Barcha g&apos;oliblar
                                <Icon name="arrowRight" size={13} />
                            </Link>
                        )}
                    </div>
                )}
            </section>
        </>
    );
}
