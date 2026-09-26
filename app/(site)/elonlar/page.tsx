import type { Metadata } from "next";
import Link from "next/link";

import { CategoryTile } from "@/components/category-tile";
import { Icon } from "@/components/icon";
import { Img } from "@/components/img";
import { PageHero } from "@/components/page-hero";
import { Stagger, StaggerItem } from "@/components/motion-primitives";
import { getAnnouncements } from "@/lib/api";
import { daysUntil, formatShortDate, plainText } from "@/lib/format";
import { IMAGE_SIZES } from "@/lib/image";
import { toneClass } from "@/lib/tone";
import type { Announcement } from "@/lib/types";

export const metadata: Metadata = {
    alternates: { canonical: "/elonlar" },
    title: "E'lonlar",
    description: "Grant, kredit, tanlov, trening va vakansiyalar.",
};

/** Muddatgacha necha kun qolgani. Muddat yo'q bo'lsa `null`. */
const daysLeft = (deadline: string | null) => daysUntil(deadline);

/** E'lonlar oddiy ketma-ketlikda turadi — kategoriya bo'yicha ajratilmaydi. */
export default async function AnnouncementsPage() {
    const page = await getAnnouncements().catch(() => null);
    const items = page?.results ?? [];

    return (
        <>
            <PageHero
                eyebrow="E'lonlar"
                title={
                    <>
                        Imkoniyat{" "}
                        <span className="text-accent">e&apos;lon qilinganda</span> — birinchi
                        bo&apos;lib biling
                    </>
                }
                lead="Grant, kredit, tanlov, trening va vakansiyalar. Har birining muddati ko'rinib turadi."
            />

            <section className="container-page py-8 md:py-10">
                {items.length ? (
                    <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {items.map((item) => (
                            <StaggerItem key={item.id}>
                                <AnnouncementCard item={item} />
                            </StaggerItem>
                        ))}
                    </Stagger>
                ) : (
                    <Empty />
                )}
            </section>
        </>
    );
}

function AnnouncementCard({ item }: { item: Announcement }) {
    const left = daysLeft(item.deadline);
    const urgent = left !== null && left >= 0 && left <= 7;

    return (
        <Link
            href={`/elonlar/${item.slug}`}
            className={`${toneClass(item.icon)} group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-raised p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-tone-line hover:shadow-[0_12px_32px_-16px_var(--tone)]`}
        >
            {/* Yuqoridagi rangli chiziq — hover'da to'liq ochiladi */}
            <span className="tone-top absolute inset-x-0 top-0 z-10 h-0.5 origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100" />

            {/* Rasm yuklangan bo'lsa — ikonka o'rniga muqova */}
            {item.image && (
                <div className="-mx-5 -mt-5 mb-5 aspect-[16/9] overflow-hidden border-b border-line bg-surface">
                    <Img
                        src={item.image}
                        sizes={IMAGE_SIZES.card}
                        maxWidth={828}
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                </div>
            )}

            <div className="flex items-start justify-between gap-3">
                {item.image ? <span /> : <CategoryTile slug={item.icon} size="md" />}

                {item.deadline && (
                    <span
                        className={
                            item.is_expired
                                ? "shrink-0 rounded-full bg-surface px-2.5 py-1 text-[11.5px] text-faint"
                                : urgent
                                  ? "shrink-0 rounded-full bg-warn-soft px-2.5 py-1 text-[11.5px] font-medium text-warn-text"
                                  : "shrink-0 rounded-full bg-tone-soft px-2.5 py-1 text-[11.5px] font-medium text-tone-text"
                        }
                    >
                        {item.is_expired
                            ? "Tugagan"
                            : urgent
                              ? left === 0
                                  ? "Bugun oxirgi kun"
                                  : `${left} kun qoldi`
                              : `${formatShortDate(item.deadline)} gacha`}
                    </span>
                )}
            </div>

            <h2
                className={`${item.image && !item.deadline ? "" : "mt-4 "}text-[16px] font-semibold leading-snug`}
            >
                {item.title}
            </h2>

            <p className="mt-2 line-clamp-2 flex-1 text-[13.5px] leading-relaxed text-muted">
                {plainText(item.body)}
            </p>

            <span className="mt-5 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-tone-text">
                Batafsil
                <Icon
                    name="arrowRight"
                    size={13}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                />
            </span>
        </Link>
    );
}

function Empty() {
    return (
        <div className="rounded-2xl border border-dashed border-line py-20 text-center">
            <span className="tone-violet mx-auto grid size-14 place-items-center rounded-2xl bg-tone-soft">
                <Icon name="megaphone" size={24} className="text-tone-text" strokeWidth={1.5} />
            </span>
            <p className="mt-4 text-[14px] text-muted">
                Bu bo&apos;yicha hozircha e&apos;lon yo&apos;q.
            </p>
            <Link
                href="/elonlar"
                className="mt-4 inline-block text-[13px] font-medium text-accent hover:underline"
            >
                Barcha e&apos;lonlar
            </Link>
        </div>
    );
}
