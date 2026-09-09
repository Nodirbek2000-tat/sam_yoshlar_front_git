import type { Metadata } from "next";
import Link from "next/link";

import { FilterChip, FilterRow } from "@/components/filter-chip";
import { Icon } from "@/components/icon";
import { PageHero } from "@/components/page-hero";
import { Stagger, StaggerItem } from "@/components/motion-primitives";
import { getNewsList } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { toneClass } from "@/lib/tone";
import type { News } from "@/lib/types";

export const metadata: Metadata = {
    title: "Yangiliklar",
    description: "Kengash faoliyati, qarorlar va yosh tadbirkorlar hayotidan xabarlar.",
};

export default async function NewsPage({ searchParams }: PageProps<"/yangiliklar">) {
    const params = await searchParams;
    const kategoriya = typeof params.kategoriya === "string" ? params.kategoriya : undefined;

    const [page, all] = await Promise.all([
        getNewsList({ kategoriya }).catch(() => null),
        kategoriya ? getNewsList({}).catch(() => null) : Promise.resolve(null),
    ]);

    const items = page?.results ?? [];
    const source = all?.results ?? items;

    const categories = Array.from(
        source
            .reduce((map, item) => {
                const found = map.get(item.category);
                map.set(item.category, {
                    label: item.category_display,
                    count: (found?.count ?? 0) + 1,
                });
                return map;
            }, new Map<string, { label: string; count: number }>())
            .entries(),
    );

    // Birinchi xabar katta karta bo'lib chiqadi
    const [lead, ...rest] = items;

    return (
        <>
            <PageHero
                eyebrow="Yangiliklar"
                title={
                    <>
                        Kengash <span className="text-accent">hayotidan</span> xabarlar
                    </>
                }
                lead="Qarorlar, uchrashuvlar, natijalar va yosh tadbirkorlar muvaffaqiyati — bir joyda."
            />

            <section className="container-page py-8 md:py-10">
                {categories.length > 0 && (
                    <div className="pb-6">
                        <FilterRow>
                            <FilterChip
                                href="/yangiliklar"
                                active={!kategoriya}
                                label="Barchasi"
                                count={source.length}
                            />
                            {categories.map(([value, info]) => (
                                <FilterChip
                                    key={value}
                                    href={`/yangiliklar?kategoriya=${value}`}
                                    active={kategoriya === value}
                                    label={info.label}
                                    tone={value}
                                    count={info.count}
                                />
                            ))}
                        </FilterRow>
                    </div>
                )}

                {items.length ? (
                    <>
                        {lead && <LeadCard item={lead} />}

                        {rest.length > 0 && (
                            <Stagger className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                {rest.map((item) => (
                                    <StaggerItem key={item.id}>
                                        <NewsCard item={item} />
                                    </StaggerItem>
                                ))}
                            </Stagger>
                        )}
                    </>
                ) : (
                    <div className="rounded-2xl border border-dashed border-line py-20 text-center">
                        <span className="tone-rose mx-auto grid size-14 place-items-center rounded-2xl bg-tone-soft">
                            <Icon name="news" size={24} className="text-tone-text" strokeWidth={1.5} />
                        </span>
                        <p className="mt-4 text-[14px] text-muted">
                            Bu bo&apos;lim bo&apos;yicha xabar yo&apos;q.
                        </p>
                    </div>
                )}
            </section>
        </>
    );
}

/** Eng so'nggi xabar — kengaytirilgan karta. */
function LeadCard({ item }: { item: News }) {
    return (
        <Link
            href={`/yangiliklar/${item.slug}`}
            className={`${toneClass(item.category)} group grid overflow-hidden rounded-2xl border border-line bg-raised transition-all duration-300 hover:border-tone-line hover:shadow-[0_20px_50px_-24px_var(--tone)] md:grid-cols-2`}
        >
            <span className="relative block aspect-[16/10] overflow-hidden bg-tone-soft md:aspect-auto md:min-h-64">
                {item.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                        src={item.image}
                        alt=""
                        className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                ) : (
                    <span className="grid size-full place-items-center">
                        <Icon name="news" size={40} className="text-tone-text opacity-50" strokeWidth={1.2} />
                    </span>
                )}
            </span>

            <span className="flex flex-col justify-center p-6 md:p-9">
                <span className="flex flex-wrap items-center gap-2.5">
                    <span className="rounded-full bg-tone-soft px-2.5 py-1 text-[11.5px] font-medium text-tone-text">
                        {item.category_display}
                    </span>
                    <span className="text-[12.5px] text-muted">{formatDate(item.published_at)}</span>
                </span>

                <span className="mt-4 block text-2xl font-semibold leading-tight tracking-tight md:text-3xl">
                    {item.title}
                </span>

                <span className="mt-3 line-clamp-3 text-[14.5px] leading-relaxed text-muted">
                    {item.excerpt}
                </span>

                <span className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-tone-text">
                    To&apos;liq o&apos;qish
                    <Icon
                        name="arrowRight"
                        size={14}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                </span>
            </span>
        </Link>
    );
}

function NewsCard({ item }: { item: News }) {
    return (
        <Link
            href={`/yangiliklar/${item.slug}`}
            className={`${toneClass(item.category)} group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-raised transition-all duration-300 hover:-translate-y-0.5 hover:border-tone-line hover:shadow-[0_16px_40px_-20px_var(--tone)]`}
        >
            <span className="relative block aspect-[16/9] overflow-hidden bg-tone-soft">
                {item.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                        src={item.image}
                        alt=""
                        className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <span className="grid size-full place-items-center">
                        <Icon name="news" size={26} className="text-tone-text opacity-45" strokeWidth={1.3} />
                    </span>
                )}

                <span className="absolute left-3 top-3 rounded-full bg-page/90 px-2.5 py-1 text-[11px] font-medium text-tone-text backdrop-blur">
                    {item.category_display}
                </span>
            </span>

            <span className="flex flex-1 flex-col p-5">
                <span className="text-[12.5px] text-muted">{formatDate(item.published_at)}</span>

                <span className="mt-1.5 line-clamp-2 block text-[15.5px] font-semibold leading-snug">
                    {item.title}
                </span>

                <span className="mt-2 line-clamp-2 flex-1 text-[13.5px] leading-relaxed text-muted">
                    {item.excerpt}
                </span>

                <span className="mt-4 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-tone-text">
                    O&apos;qish
                    <Icon
                        name="arrowRight"
                        size={13}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                </span>
            </span>
        </Link>
    );
}
