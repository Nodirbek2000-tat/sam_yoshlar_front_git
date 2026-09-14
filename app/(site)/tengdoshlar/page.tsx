import type { Metadata } from "next";
import Link from "next/link";

import { CategoryIcon } from "@/components/category-icon";
import { FilterChip, FilterRow } from "@/components/filter-chip";
import { Icon } from "@/components/icon";
import { PageHero } from "@/components/page-hero";
import { Stagger, StaggerItem } from "@/components/motion-primitives";
import { getPeers, getReference } from "@/lib/api";
import { toneClass } from "@/lib/tone";
import type { Peer } from "@/lib/types";

export const metadata: Metadata = {
    title: "Chet eldagi tengdoshim",
    description:
        "Chet elda o'qiyotgan va ishlayotgan tengdoshlar bilan tanishing, tajriba almashing.",
};

export default async function PeersPage({ searchParams }: PageProps<"/tengdoshlar">) {
    const params = await searchParams;
    const davlat = typeof params.davlat === "string" ? params.davlat : undefined;
    const maqsad = typeof params.maqsad === "string" ? params.maqsad : undefined;

    // Filtr qatorlari to'liq ro'yxatdan yig'iladi, kartalar esa filtrlangandan.
    const [page, all, reference] = await Promise.all([
        getPeers({ davlat, maqsad }).catch(() => null),
        davlat || maqsad ? getPeers({}).catch(() => null) : Promise.resolve(null),
        getReference().catch(() => null),
    ]);

    const peers = page?.results ?? [];
    const source = all?.results ?? peers;

    const countries = Array.from(
        source
            .reduce((map, peer) => {
                const found = map.get(peer.country);
                map.set(peer.country, {
                    name: peer.country_name,
                    color: peer.country_color,
                    count: (found?.count ?? 0) + 1,
                });
                return map;
            }, new Map<string, { name: string; color: string; count: number }>())
            .entries(),
    );

    return (
        <>
            <PageHero
                eyebrow="Chet eldagi tengdoshim"
                title={
                    <>
                        Dunyoning har <span className="text-accent">burchagida</span> bizniki bor
                    </>
                }
                lead="Chet elda o'qiyotgan va ishlayotgan tengdoshlar. Ular bilan bog'laning, tajriba so'rang, yo'l toping."
            />

            <section className="container-page py-8 md:py-10">
                <div className="space-y-2.5 pb-6">
                    {countries.length > 1 && (
                        <FilterRow>
                            <FilterChip
                                href={maqsad ? `/tengdoshlar?maqsad=${maqsad}` : "/tengdoshlar"}
                                active={!davlat}
                                label="Barcha davlat"
                                count={source.length}
                            />
                            {countries.map(([code, info]) => (
                                <FilterChip
                                    key={code}
                                    href={`/tengdoshlar?davlat=${code}${maqsad ? `&maqsad=${maqsad}` : ""}`}
                                    active={davlat === code}
                                    label={info.name}
                                    count={info.count}
                                    icon={
                                        <span
                                            className="size-2 rounded-full"
                                            style={{ background: info.color }}
                                        />
                                    }
                                />
                            ))}
                        </FilterRow>
                    )}

                    {reference && reference.peer_purposes.length > 0 && (
                        <FilterRow>
                            <FilterChip
                                href={davlat ? `/tengdoshlar?davlat=${davlat}` : "/tengdoshlar"}
                                active={!maqsad}
                                label="Barcha maqsad"
                            />
                            {reference.peer_purposes.map((item) => (
                                <FilterChip
                                    key={item.value}
                                    href={`/tengdoshlar?maqsad=${item.value}${davlat ? `&davlat=${davlat}` : ""}`}
                                    active={maqsad === item.value}
                                    label={item.label}
                                    tone={item.value}
                                />
                            ))}
                        </FilterRow>
                    )}
                </div>

                {peers.length ? (
                    <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {peers.map((peer) => (
                            <StaggerItem key={peer.id}>
                                <PeerCard peer={peer} />
                            </StaggerItem>
                        ))}
                    </Stagger>
                ) : (
                    <div className="rounded-2xl border border-dashed border-line py-20 text-center">
                        <span className="tone-blue mx-auto grid size-14 place-items-center rounded-2xl bg-tone-soft">
                            <Icon name="globe" size={24} className="text-tone-text" strokeWidth={1.5} />
                        </span>
                        <p className="mt-4 text-[14px] text-muted">
                            Bu filtr bo&apos;yicha tengdosh topilmadi.
                        </p>
                        <Link
                            href="/tengdoshlar"
                            className="mt-4 inline-block text-[13px] font-medium text-accent hover:underline"
                        >
                            Filtrni tozalash
                        </Link>
                    </div>
                )}
            </section>
        </>
    );
}

function PeerCard({ peer }: { peer: Peer }) {
    return (
        <Link
            href={`/tengdoshlar/${peer.id}`}
            className={`${toneClass(peer.purpose)} group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-raised transition-all duration-300 hover:-translate-y-0.5 hover:border-tone-line hover:shadow-[0_16px_40px_-20px_var(--tone)]`}
        >
            {/* Davlat rangidagi tepa chiziq */}
            <span
                className="absolute inset-x-0 top-0 h-1"
                style={{ background: peer.country_color }}
            />

            <div className="flex items-center gap-3.5 p-5 pb-4">
                <span className="relative grid size-13 shrink-0 place-items-center overflow-hidden rounded-full bg-tone-soft text-[14px] font-semibold text-tone-text">
                    {peer.photo ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={peer.photo} alt="" className="size-full object-cover" />
                    ) : (
                        peer.initials
                    )}
                </span>

                <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-semibold">
                        {peer.full_name}
                    </span>
                    <span className="mt-1 flex items-center gap-1.5 text-[12.5px] text-muted">
                        <span
                            className="inline-flex items-center rounded px-1.5 py-0.5 text-[10.5px] font-semibold text-white"
                            style={{ background: peer.country_color }}
                        >
                            {peer.country_short}
                        </span>
                        <span className="truncate">
                            {peer.city ? `${peer.city}, ` : ""}
                            {peer.country_name}
                        </span>
                    </span>
                </span>
            </div>

            <div className="flex flex-1 flex-col px-5 pb-5">
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-tone-soft px-2.5 py-1 text-[11.5px] font-medium text-tone-text">
                    <CategoryIcon slug={peer.purpose_icon} size={12} />
                    {peer.purpose_display}
                </span>

                {peer.institution && (
                    <p className="mt-3 truncate text-[13px] text-text">{peer.institution}</p>
                )}
                {(peer.course || peer.field) && (
                    <p className="mt-1 truncate text-[12.5px] text-muted">
                        {[peer.course ? `${peer.course}-kurs` : "", peer.field]
                            .filter(Boolean)
                            .join(" · ")}
                    </p>
                )}

                <p className="mt-2 line-clamp-3 flex-1 text-[13.5px] leading-relaxed text-muted">
                    {peer.achievements || peer.about}
                </p>

                <span className="mt-4 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-tone-text">
                    Tanishish
                    <Icon
                        name="arrowRight"
                        size={13}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                </span>
            </div>
        </Link>
    );
}
