import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Icon } from "@/components/icon";
import { CommentForm } from "@/components/initiatives/comment-form";
import { DirectionScene } from "@/components/initiatives/direction-scene";
import { VoteButton } from "@/components/initiatives/vote-button";
import { Reveal } from "@/components/motion-primitives";
import { ApiError, getInitiative } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { getCurrentUser } from "@/lib/session";

export async function generateMetadata({
    params,
}: PageProps<"/tashabbuslar/[id]">): Promise<Metadata> {
    try {
        const idea = await getInitiative((await params).id);
        return {
            title: idea.title,
            description: idea.summary || idea.description.slice(0, 150),
        };
    } catch {
        return { title: "Tashabbus" };
    }
}

export default async function InitiativePage({
    params,
}: PageProps<"/tashabbuslar/[id]">) {
    const { id } = await params;

    let idea;
    try {
        idea = await getInitiative(id);
    } catch (error) {
        if (error instanceof ApiError) notFound();
        throw error;
    }

    const user = await getCurrentUser();
    const direction = idea.direction_info;

    return (
        <article>
            {/* ---------- Sarlavha ---------- */}
            <header className="border-b border-line">
                <div className="container-page py-8 md:py-10">
                    <Link
                        href={`/tashabbuslar/yoshlar?yonalish=${direction.id}`}
                        className="group inline-flex items-center gap-1.5 text-[13px] text-muted transition-colors hover:text-text"
                    >
                        <Icon
                            name="arrowLeft"
                            size={14}
                            className="transition-transform duration-200 group-hover:-translate-x-0.5"
                        />
                        {direction.name}
                    </Link>

                    <Reveal className="mt-7 grid gap-10 md:grid-cols-[1fr_auto] md:items-start">
                        <div className="max-w-2xl">
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12.5px]">
                                <span
                                    className="inline-flex items-center gap-1.5 font-medium"
                                    style={{ color: direction.color }}
                                >
                                    <span className="size-1.5 rounded-full bg-current" />
                                    {direction.name}
                                </span>
                                <span className="text-faint">{idea.kind_display}</span>
                                {idea.rank && (
                                    <span className="rounded-full border border-line px-2 py-0.5 text-faint">
                                        #{idea.rank}-o&apos;rin
                                    </span>
                                )}
                            </div>

                            <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                                {idea.title}
                            </h1>

                            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-faint">
                                <span className="text-muted">{idea.author_label}</span>
                                <span>{formatDate(idea.created_at)}</span>
                                {idea.region_display && <span>{idea.region_display}</span>}
                            </div>

                            <div className="mt-7 flex items-center gap-3">
                                <VoteButton
                                    initiativeId={idea.id}
                                    votes={idea.vote_count}
                                    voted={idea.voted}
                                    canVote={Boolean(user)}
                                    color={direction.color}
                                />
                                <a
                                    href="#takliflar"
                                    className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-[13.5px] text-muted transition-colors hover:text-text"
                                >
                                    <Icon name="chat" size={15} />
                                    {idea.comments?.length ?? 0} taklif
                                </a>
                            </div>
                        </div>

                        <div className="justify-self-center md:justify-self-end">
                            <DirectionScene
                                votes={idea.vote_count}
                                max={direction.max * 8}
                                color={direction.color}
                                accent={direction.accent}
                                seed={idea.id}
                                className="size-48 md:size-60"
                            />
                            <p className="mt-2 text-center text-[12px] text-faint">
                                {idea.vote_count} / {direction.max * 8} {direction.unit}
                            </p>
                        </div>
                    </Reveal>
                </div>
            </header>

            {/* ---------- Matn ---------- */}
            <div className="container-page grid gap-12 py-14 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16">
                <div className="min-w-0">
                    <div className="max-w-2xl space-y-4 text-[15.5px] leading-[1.75] text-muted">
                        {idea.description.split("\n").filter(Boolean).map((line, index) => (
                            <p key={index}>{line}</p>
                        ))}
                    </div>

                    {idea.expected_result && (
                        <div className="mt-10 max-w-2xl rounded-xl border border-line p-5">
                            <h2 className="text-[12px] font-medium uppercase tracking-[0.1em] text-faint">
                                Kutilayotgan natija
                            </h2>
                            <p className="mt-2.5 text-[14.5px] leading-relaxed">
                                {idea.expected_result}
                            </p>
                        </div>
                    )}

                    {/* ---------- Takliflar ---------- */}
                    <section id="takliflar" className="mt-14 max-w-2xl scroll-mt-24">
                        <h2 className="text-[15px] font-semibold">
                            Takliflar
                            <span className="ml-2 text-faint">{idea.comments?.length ?? 0}</span>
                        </h2>

                        <div className="mt-5">
                            {user ? (
                                <CommentForm initiativeId={idea.id} authorName={user.full_name} />
                            ) : (
                                <div className="rounded-xl border border-dashed border-line p-6 text-center">
                                    <Icon name="lock" size={18} className="mx-auto text-faint" />
                                    <p className="mt-3 text-[14px] font-medium">
                                        Taklif yozish uchun tizimga kiring
                                    </p>
                                    <p className="mt-1.5 text-[13px] text-muted">
                                        O&apos;qish hamma uchun ochiq. Yozish uchun ro&apos;yxatdan o&apos;ting.
                                    </p>
                                    <Link
                                        href={`/kirish?next=/tashabbuslar/${idea.id}`}
                                        className="mt-5 inline-flex items-center gap-2 rounded-full bg-invert px-5 py-2.5 text-[13.5px] font-medium text-on-invert"
                                    >
                                        Kirish
                                        <Icon name="arrowRight" size={14} />
                                    </Link>
                                </div>
                            )}
                        </div>

                        {idea.comments?.length ? (
                            <div className="mt-8 divide-y divide-line border-t border-line">
                                {idea.comments.map((comment) => (
                                    <div key={comment.id} className="flex gap-4 py-5">
                                        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-surface text-[11.5px] font-semibold text-muted">
                                            {comment.initials}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-baseline gap-x-3">
                                                {/* Muallif ro'yxatdan o'tgan bo'lsa — profiliga o'tiladi */}
                                                {comment.author_id ? (
                                                    <Link
                                                        href={`/insonlar/${comment.author_id}`}
                                                        className="text-[13.5px] font-medium text-accent-text transition-opacity hover:opacity-80"
                                                    >
                                                        {comment.author_label}
                                                    </Link>
                                                ) : (
                                                    <span className="text-[13.5px] font-medium">
                                                        {comment.author_label}
                                                    </span>
                                                )}
                                                <span className="text-[12px] text-faint">
                                                    {formatDate(comment.created_at)}
                                                </span>
                                            </div>
                                            <p className="mt-1.5 text-[14px] leading-relaxed text-muted">
                                                {comment.text}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="mt-8 border-t border-line py-10 text-center text-[13.5px] text-faint">
                                Hozircha taklif yo&apos;q — birinchi bo&apos;ling.
                            </p>
                        )}
                    </section>
                </div>

                {/* ---------- Yonidagi ustun ---------- */}
                <aside className="lg:sticky lg:top-24 lg:self-start">
                    <h2 className="text-[12px] font-medium uppercase tracking-[0.1em] text-faint">
                        Shu yo&apos;nalishdan
                    </h2>

                    <div className="mt-4 divide-y divide-line border-y border-line">
                        {idea.siblings?.length ? (
                            idea.siblings.map((item) => (
                                <Link
                                    key={item.id}
                                    href={`/tashabbuslar/${item.id}`}
                                    className="flex items-start gap-3 py-3.5 transition-opacity hover:opacity-70"
                                >
                                    <span className="min-w-0 flex-1">
                                        <span className="line-clamp-2 block text-[13.5px] font-medium leading-snug">
                                            {item.title}
                                        </span>
                                        <span className="mt-1 block text-[12px] text-faint">
                                            {item.author_label}
                                        </span>
                                    </span>
                                    <span className="shrink-0 text-[13px] font-semibold tabular-nums text-muted">
                                        {item.vote_count}
                                    </span>
                                </Link>
                            ))
                        ) : (
                            <p className="py-8 text-center text-[13px] text-faint">
                                Boshqa tashabbus yo&apos;q.
                            </p>
                        )}
                    </div>

                    <Link
                        href="/tashabbuslar/bildirish"
                        className="mt-6 flex items-center justify-center gap-2 rounded-full border border-line px-4 py-2.5 text-[13.5px] font-medium transition-colors hover:bg-surface"
                    >
                        <Icon name="plus" size={14} />
                        O&apos;z tashabbusingizni bildiring
                    </Link>
                </aside>
            </div>
        </article>
    );
}
