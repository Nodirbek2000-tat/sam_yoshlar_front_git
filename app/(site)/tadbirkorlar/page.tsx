import type { Metadata } from "next";
import Link from "next/link";

import { BusinessCard } from "@/components/directory/cards";
import { FilterChip, FilterRow } from "@/components/filter-chip";
import { Icon } from "@/components/icon";
import { Stagger, StaggerItem } from "@/components/motion-primitives";
import { PageHero } from "@/components/page-hero";
import { getBusinesses } from "@/lib/api";
import type { PublicBusiness } from "@/lib/types";

export const metadata: Metadata = {
    title: "Tadbirkorlar",
    description: "Kengash a'zosi bo'lgan yosh tadbirkorlar: biznesi, rasmlari va aloqasi.",
};

/** Filtr qatori uchun: qiymat -> nomi va nechta. */
function tally(rows: PublicBusiness[], key: "sphere" | "region") {
    const map = new Map<string, { label: string; icon: string; count: number }>();
    for (const row of rows) {
        const value = row[key];
        if (!value) continue;
        const found = map.get(value);
        map.set(value, {
            label: key === "sphere" ? row.sphere_display : row.region_display,
            icon: row.sphere_icon,
            count: (found?.count ?? 0) + 1,
        });
    }
    return [...map.entries()].sort((a, b) => b[1].count - a[1].count);
}

export default async function BusinessesPage({ searchParams }: PageProps<"/tadbirkorlar">) {
    const params = await searchParams;
    const soha = typeof params.soha === "string" ? params.soha : undefined;
    const hudud = typeof params.hudud === "string" ? params.hudud : undefined;

    // Kartalar — filtrlangan, filtr qatorlari — to'liq ro'yxatdan
    const [page, all] = await Promise.all([
        getBusinesses({ soha, hudud }).catch(() => null),
        soha || hudud ? getBusinesses({}).catch(() => null) : Promise.resolve(null),
    ]);

    const businesses = page?.results ?? [];
    const source = all?.results ?? businesses;
    const spheres = tally(source, "sphere");
    const regions = tally(source, "region");

    const link = (next: { soha?: string; hudud?: string }) => {
        const query = new URLSearchParams();
        if (next.soha) query.set("soha", next.soha);
        if (next.hudud) query.set("hudud", next.hudud);
        const text = query.toString();
        return `/tadbirkorlar${text ? `?${text}` : ""}`;
    };

    return (
        <>
            <PageHero
                eyebrow="Tadbirkorlar"
                title={
                    <>
                        Yosh tadbirkorlar — <span className="text-accent">bir joyda</span>
                    </>
                }
                lead="Kengash tasdiqlagan bizneslar: nima qilishadi, qayerda, qanday bog'lanish mumkin. Hamkor, yetkazib beruvchi yoki mijoz izlayotgan bo'lsangiz — shu yerdan boshlang."
                action={
                    <Link
                        href="/royxatdan-otish"
                        className="inline-flex items-center gap-2 rounded-full bg-invert px-5 py-2.5 text-[14px] font-medium text-on-invert transition-opacity hover:opacity-90"
                    >
                        <Icon name="plus" size={15} />
                        Biznesimni qo&apos;shish
                    </Link>
                }
            />

            <section className="container-page py-12 md:py-16">
                {source.length > 0 && (
                    <div className="space-y-3 pb-8">
                        {spheres.length > 1 && (
                            <FilterRow>
                                <FilterChip
                                    href={link({ hudud })}
                                    active={!soha}
                                    label="Barcha soha"
                                    count={source.length}
                                />
                                {spheres.map(([value, info]) => (
                                    <FilterChip
                                        key={value}
                                        href={link({ soha: value, hudud })}
                                        active={soha === value}
                                        label={info.label}
                                        tone={info.icon}
                                        count={info.count}
                                    />
                                ))}
                            </FilterRow>
                        )}

                        {regions.length > 1 && (
                            <FilterRow>
                                <FilterChip
                                    href={link({ soha })}
                                    active={!hudud}
                                    label="Barcha hudud"
                                />
                                {regions.map(([value, info]) => (
                                    <FilterChip
                                        key={value}
                                        href={link({ soha, hudud: value })}
                                        active={hudud === value}
                                        label={info.label}
                                        icon={<Icon name="pin" size={12} />}
                                        count={info.count}
                                    />
                                ))}
                            </FilterRow>
                        )}
                    </div>
                )}

                {businesses.length ? (
                    <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {businesses.map((business) => (
                            <StaggerItem key={business.id}>
                                <BusinessCard business={business} />
                            </StaggerItem>
                        ))}
                    </Stagger>
                ) : (
                    <Empty filtered={Boolean(soha || hudud)} />
                )}
            </section>
        </>
    );
}

function Empty({ filtered }: { filtered: boolean }) {
    return (
        <div className="tone-amber rounded-2xl border border-dashed border-line py-20 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-tone-soft">
                <Icon name="briefcase" size={24} className="text-tone-text" strokeWidth={1.5} />
            </span>
            <p className="mt-4 text-[14.5px] font-medium">
                {filtered ? "Bu filtr bo'yicha tadbirkor topilmadi" : "Hali tadbirkor qo'shilmagan"}
            </p>
            <p className="mt-1.5 text-[13.5px] text-muted">
                {filtered
                    ? "Boshqa soha yoki hududni tanlab ko'ring."
                    : "Birinchi bo'ling — ro'yxatdan o'ting va biznesingizni tanishtiring."}
            </p>
            <Link
                href={filtered ? "/tadbirkorlar" : "/royxatdan-otish"}
                className="mt-5 inline-flex items-center gap-1.5 text-[13.5px] font-medium text-accent hover:underline"
            >
                {filtered ? "Barcha tadbirkorlar" : "Ro'yxatdan o'tish"}
                <Icon name="arrowRight" size={13} />
            </Link>
        </div>
    );
}
