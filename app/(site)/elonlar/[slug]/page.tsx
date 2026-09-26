import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CategoryTile } from "@/components/category-tile";
import { Icon } from "@/components/icon";
import { Reveal } from "@/components/motion-primitives";
import { PhotoZoom } from "@/components/photo-zoom";
import { RichText } from "@/components/rich-text";
import { ApiError, getAnnouncement } from "@/lib/api";
import { daysUntil, formatDate } from "@/lib/format";
import { shareMetadata } from "@/lib/seo";
import { toneClass } from "@/lib/tone";

export async function generateMetadata({
    params,
}: PageProps<"/elonlar/[slug]">): Promise<Metadata> {
    try {
        const item = await getAnnouncement((await params).slug);
        return shareMetadata({ title: item.title, description: item.body, image: item.image });
    } catch {
        return { title: "E'lon" };
    }
}

export default async function AnnouncementPage({ params }: PageProps<"/elonlar/[slug]">) {
    const { slug } = await params;

    let item;
    try {
        item = await getAnnouncement(slug);
    } catch (error) {
        if (error instanceof ApiError) notFound();
        throw error;
    }

    // Toshkent kalendari bo'yicha: 0 — bugun oxirgi kun
    const left = daysUntil(item.deadline);

    return (
        <article className={toneClass(item.icon)}>
            <header className="relative overflow-hidden border-b border-line">
                {/* Kategoriya rangidagi yumshoq yog'du */}
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.14]"
                    style={{
                        background:
                            "radial-gradient(40rem 20rem at 15% -20%, var(--tone), transparent 65%)",
                    }}
                />

                <div className="container-page relative py-9 md:py-11">
                    <Link
                        href="/elonlar"
                        className="group inline-flex items-center gap-1.5 text-[13px] text-muted transition-colors hover:text-text"
                    >
                        <Icon
                            name="arrowLeft"
                            size={14}
                            className="transition-transform duration-200 group-hover:-translate-x-0.5"
                        />
                        E&apos;lonlar
                    </Link>

                    <Reveal className="mt-7 flex flex-col gap-6 sm:flex-row sm:items-start">
                        {item.image ? (
                            <PhotoZoom
                                src={item.image}
                                alt={item.title}
                                fallback=""
                                className="size-28 shrink-0 rounded-2xl border border-line bg-surface sm:size-36"
                            />
                        ) : (
                            <CategoryTile slug={item.icon} size="xl" />
                        )}

                        <div className="min-w-0 flex-1">
                            <h1 className="max-w-2xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                                {item.title}
                            </h1>

                            <div className="mt-5 flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-[12.5px] text-muted">
                                    <Icon name="calendar" size={13} />
                                    {formatDate(item.posted_at)}
                                </span>

                                {item.deadline && (
                                    <span
                                        className={
                                            item.is_expired
                                                ? "inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-[12.5px] text-faint"
                                                : left !== null && left <= 7
                                                  ? "inline-flex items-center gap-1.5 rounded-full bg-warn-soft px-3 py-1.5 text-[12.5px] font-medium text-warn-text"
                                                  : "inline-flex items-center gap-1.5 rounded-full bg-tone-soft px-3 py-1.5 text-[12.5px] font-medium text-tone-text"
                                        }
                                    >
                                        <Icon name="clock" size={13} />
                                        {item.is_expired
                                            ? `Muddati tugagan — ${formatDate(item.deadline)}`
                                            : `${formatDate(item.deadline)} gacha`}
                                        {!item.is_expired && left !== null && left <= 7 && (
                                            <span className="opacity-80">
                                                · {left === 0 ? "bugun" : `${left} kun`}
                                            </span>
                                        )}
                                    </span>
                                )}
                            </div>
                        </div>
                    </Reveal>
                </div>
            </header>

            <div className="container-page grid gap-10 py-10 md:py-12 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-14">
                <Reveal className="min-w-0">
                    <RichText
                        text={item.body}
                        className="max-w-2xl text-[15.5px] leading-[1.8] text-muted"
                    />
                </Reveal>

                {(item.apply_url || item.file) && (
                <Reveal delay={0.1} className="lg:sticky lg:top-24 lg:self-start">
                    <div className="rounded-2xl border border-tone-line bg-tone-soft p-5">
                        <h2 className="text-[13px] font-semibold text-tone-text">
                            Ishtirok etmoqchimisiz?
                        </h2>
                        <p className="mt-2 text-[13px] leading-relaxed text-muted">
                            {item.apply_url
                                ? "Shartlar bilan tanishing va «Murojaat qilish» tugmasi orqali ariza yuboring."
                                : "Hujjat va shartlar bilan tanishing."}
                        </p>

                        {item.apply_url && !item.is_expired && (
                            <a
                                href={item.apply_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-invert px-5 py-2.5 text-[13.5px] font-medium text-on-invert transition-opacity hover:opacity-90"
                            >
                                <Icon name="send" size={15} />
                                Murojaat qilish
                            </a>
                        )}

                        {item.apply_url && item.is_expired && (
                            <p className="mt-4 rounded-full bg-surface px-4 py-2.5 text-center text-[13px] text-faint">
                                Qabul muddati tugagan
                            </p>
                        )}

                        {item.file && (
                            <a
                                href={item.file}
                                target="_blank"
                                rel="noreferrer"
                                className={
                                    item.apply_url
                                        ? "mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full border border-tone-line px-5 py-2.5 text-[13.5px] font-medium text-tone-text transition-colors hover:bg-page/60"
                                        : "mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-invert px-5 py-2.5 text-[13.5px] font-medium text-on-invert transition-opacity hover:opacity-90"
                                }
                            >
                                <Icon name="doc" size={15} />
                                Hujjatni ochish
                            </a>
                        )}
                    </div>
                </Reveal>
                )}
            </div>
        </article>
    );
}
