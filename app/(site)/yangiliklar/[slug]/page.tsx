import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Icon } from "@/components/icon";
import { Reveal, Stagger, StaggerItem } from "@/components/motion-primitives";
import { ApiError, getNews, getNewsList } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { toneClass } from "@/lib/tone";

export async function generateMetadata({
    params,
}: PageProps<"/yangiliklar/[slug]">): Promise<Metadata> {
    try {
        const item = await getNews((await params).slug);
        return { title: item.title, description: item.excerpt.slice(0, 150) };
    } catch {
        return { title: "Yangilik" };
    }
}

export default async function NewsDetailPage({ params }: PageProps<"/yangiliklar/[slug]">) {
    const { slug } = await params;

    let item;
    try {
        item = await getNews(slug);
    } catch (error) {
        if (error instanceof ApiError) notFound();
        throw error;
    }

    // Shu bo'limdagi boshqa xabarlar
    const related = await getNewsList({ kategoriya: item.category })
        .then((page) => page.results.filter((other) => other.slug !== item.slug).slice(0, 3))
        .catch(() => []);

    return (
        <article className={toneClass(item.category)}>
            <header className="relative overflow-hidden border-b border-line">
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.15]"
                    style={{
                        background:
                            "radial-gradient(44rem 22rem at 25% -25%, var(--tone), transparent 65%)",
                    }}
                />

                <div className="container-page relative py-9 md:py-11">
                    <Link
                        href="/yangiliklar"
                        className="group inline-flex items-center gap-1.5 text-[13px] text-muted transition-colors hover:text-text"
                    >
                        <Icon
                            name="arrowLeft"
                            size={14}
                            className="transition-transform duration-200 group-hover:-translate-x-0.5"
                        />
                        Yangiliklar
                    </Link>

                    <Reveal className="mt-7 max-w-3xl">
                        <div className="flex flex-wrap items-center gap-2.5">
                            <span className="rounded-full bg-tone-soft px-3 py-1.5 text-[12px] font-medium text-tone-text">
                                {item.category_display}
                            </span>
                            <span className="text-[13px] text-muted">
                                {formatDate(item.published_at)}
                            </span>
                            <span className="inline-flex items-center gap-1.5 text-[13px] text-faint">
                                <Icon name="eye" size={13} />
                                {item.views}
                            </span>
                        </div>

                        <h1 className="mt-5 text-3xl font-semibold leading-[1.15] tracking-tight sm:text-4xl md:text-5xl">
                            {item.title}
                        </h1>

                        <p className="mt-5 max-w-2xl text-[16.5px] leading-relaxed text-muted">
                            {item.excerpt}
                        </p>

                        {item.author_name && (
                            <p className="mt-6 inline-flex items-center gap-2 text-[13px] text-faint">
                                <span className="grid size-7 place-items-center rounded-full bg-tone-soft text-[11px] font-semibold text-tone-text">
                                    {item.author_name.slice(0, 1)}
                                </span>
                                {item.author_name}
                            </p>
                        )}
                    </Reveal>
                </div>
            </header>

            {item.image && (
                <div className="container-page -mt-px">
                    <Reveal className="overflow-hidden rounded-b-2xl border-x border-b border-line">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={item.image}
                            alt=""
                            className="max-h-[28rem] w-full object-cover"
                        />
                    </Reveal>
                </div>
            )}

            <div className="container-page py-8 md:py-10">
                <Reveal className="max-w-2xl space-y-5 text-[16px] leading-[1.8] text-muted">
                    {(item.body ?? "")
                        .split("\n")
                        .filter(Boolean)
                        .map((line, index) => (
                            <p key={index}>{line}</p>
                        ))}
                </Reveal>
            </div>

            {related.length > 0 && (
                <section className="border-t border-line">
                    <div className="container-page py-8 md:py-10">
                        <h2 className="text-[12px] font-medium uppercase tracking-[0.1em] text-accent">
                            Shu bo&apos;limdan yana
                        </h2>

                        <Stagger className="mt-6 grid gap-4 sm:grid-cols-3">
                            {related.map((other) => (
                                <StaggerItem key={other.id}>
                                    <Link
                                        href={`/yangiliklar/${other.slug}`}
                                        className="group flex h-full flex-col rounded-xl border border-line bg-raised p-4 transition-colors duration-300 hover:border-tone-line hover:bg-tone-soft"
                                    >
                                        <span className="text-[12px] text-muted">
                                            {formatDate(other.published_at)}
                                        </span>
                                        <span className="mt-1.5 line-clamp-3 flex-1 text-[14.5px] font-medium leading-snug">
                                            {other.title}
                                        </span>
                                        <span className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] text-tone-text">
                                            O&apos;qish
                                            <Icon
                                                name="arrowRight"
                                                size={12}
                                                className="transition-transform duration-300 group-hover:translate-x-1"
                                            />
                                        </span>
                                    </Link>
                                </StaggerItem>
                            ))}
                        </Stagger>
                    </div>
                </section>
            )}
        </article>
    );
}
