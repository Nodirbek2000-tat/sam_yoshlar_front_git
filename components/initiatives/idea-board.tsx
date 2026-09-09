"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import { Icon } from "@/components/icon";
import { LiveScene } from "@/components/initiatives/live-scene";
import { cn } from "@/lib/cn";
import type { Initiative, VoteResult } from "@/lib/types";

/**
 * Tashabbuslar taxtasi.
 *
 * Ovoz berilganda uch narsa bir vaqtda bo'ladi:
 *   1. sahna o'sadi (daraxtga barg qo'shiladi),
 *   2. hisob oshadi,
 *   3. karta reytingda yuqoriga siljiydi — `layout` animatsiyasi bilan.
 *
 * Shuning uchun tartib serverda emas, shu yerda hisoblanadi.
 */

type VoteState = { count: number; voted: boolean };

export function IdeaBoard({
    items,
    canVote,
    /** `yangi` bo'lsa tartib o'zgarmaydi — sana bo'yicha turaveradi. */
    order,
}: {
    items: Initiative[];
    canVote: boolean;
    order?: string;
}) {
    const [votes, setVotes] = useState<Record<number, VoteState>>(() =>
        Object.fromEntries(
            items.map((item) => [item.id, { count: item.vote_count, voted: item.voted }]),
        ),
    );

    const stateOf = useCallback(
        (item: Initiative): VoteState =>
            votes[item.id] ?? { count: item.vote_count, voted: item.voted },
        [votes],
    );

    const sorted = useMemo(() => {
        if (order === "yangi") return items;
        return [...items].sort((a, b) => stateOf(b).count - stateOf(a).count);
    }, [items, order, stateOf]);

    const peak = Math.max(...sorted.map((item) => stateOf(item).count), 1);

    return (
        <div className="space-y-3.5">
            <AnimatePresence initial={false}>
                {sorted.map((idea, index) => (
                    <motion.div
                        key={idea.id}
                        layout
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            layout: { type: "spring", stiffness: 320, damping: 34 },
                            duration: 0.45,
                            delay: Math.min(index * 0.04, 0.4),
                        }}
                    >
                        <IdeaCard
                            idea={idea}
                            rank={index + 1}
                            state={stateOf(idea)}
                            share={stateOf(idea).count / peak}
                            canVote={canVote}
                            onVoted={(next) =>
                                setVotes((current) => ({ ...current, [idea.id]: next }))
                            }
                        />
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}

/* ------------------------------------------------------------------ */

function IdeaCard({
    idea,
    rank,
    state,
    share,
    canVote,
    onVoted,
}: {
    idea: Initiative;
    rank: number;
    state: VoteState;
    share: number;
    canVote: boolean;
    onVoted: (next: VoteState) => void;
}) {
    const router = useRouter();
    const [busy, setBusy] = useState(false);
    const [toast, setToast] = useState<string | null>(null);
    // Har bir ovozda ortadi — sahna ustidagi portlashni qayta ishga tushiradi
    const [burst, setBurst] = useState(0);

    const direction = idea.direction_info;
    const color = direction.color;
    const leader = rank === 1;

    async function vote() {
        if (!canVote) {
            router.push(`/kirish?next=/tashabbuslar/${idea.id}`);
            return;
        }
        if (state.voted || busy) return;

        setBusy(true);
        // Sahna darhol o'ssin — tarmoq javobini kutib turmaymiz
        onVoted({ count: state.count + 1, voted: true });
        setBurst((value) => value + 1);

        try {
            const response = await fetch(`/api/proxy/initiatives/${idea.id}/vote`, {
                method: "POST",
            });
            const data = (await response.json()) as VoteResult & { detail?: string };

            if (!response.ok) {
                onVoted({ count: state.count, voted: state.voted });
                setToast(data.detail ?? "Ovoz berib bo'lmadi.");
                return;
            }

            onVoted({ count: data.votes, voted: true });
            setToast(data.message);
        } catch {
            onVoted({ count: state.count, voted: state.voted });
            setToast("Tarmoqda xatolik.");
        } finally {
            setBusy(false);
            setTimeout(() => setToast(null), 3400);
        }
    }

    return (
        <article
            className={cn(
                "group glass relative overflow-hidden rounded-2xl transition-shadow duration-500",
                leader && "shadow-[0_0_0_1px_var(--scene),0_18px_50px_-28px_var(--scene)]",
            )}
            style={{ ["--scene" as string]: leader ? "#e3b341" : color }}
        >
            {/* Yetakchining tepasidagi oltin chiziq */}
            {leader && (
                <span
                    aria-hidden
                    className="absolute inset-x-0 top-0 h-px"
                    style={{
                        background:
                            "linear-gradient(90deg, transparent, #e3b341, transparent)",
                    }}
                />
            )}

            <div className="flex flex-col gap-5 p-4 md:flex-row md:items-start md:gap-6 md:p-5">
                {/* --- O'rin --- */}
                <div className="flex shrink-0 items-center gap-3 md:flex-col md:gap-1.5 md:pt-8">
                    <span
                        className="grid size-11 place-items-center rounded-xl text-[14px] font-semibold tabular-nums"
                        style={
                            leader
                                ? { background: "#e3b341", color: "#241a02" }
                                : {
                                      color,
                                      background: `color-mix(in oklab, ${color} 13%, transparent)`,
                                      boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${color} 30%, transparent)`,
                                  }
                        }
                    >
                        #{rank}
                    </span>
                    {leader && <Icon name="trophy" size={16} className="text-[#e3b341]" />}
                </div>

                {/* --- Sahna --- */}
                <div className="w-full shrink-0 md:w-64 lg:w-72">
                    <LiveScene direction={direction} votes={state.count} burst={burst} />

                    <div className="mt-2 flex items-baseline justify-between gap-3 px-0.5">
                        <span
                            className="truncate text-[11px] font-semibold uppercase tracking-[0.12em]"
                            style={{ color }}
                        >
                            {direction.title}
                        </span>
                        <span className="shrink-0 text-[11.5px] tabular-nums text-faint">
                            {state.count} / {direction.max} {direction.unit}
                        </span>
                    </div>

                    {/* Sahna to'lishi */}
                    <span className="energy mt-2 block h-1 rounded-full">
                        <span
                            style={{
                                width: `${Math.min((state.count / (direction.max * 8)) * 100, 100)}%`,
                            }}
                        />
                    </span>
                </div>

                {/* --- Matn --- */}
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                        <Pill color={color} filled>
                            <span className="size-1.5 rounded-full bg-current" />
                            {direction.name}
                        </Pill>
                        <Pill>{idea.kind_display}</Pill>
                        {idea.region_display && (
                            <Pill>
                                <Icon name="pin" size={11} />
                                {idea.region_display}
                            </Pill>
                        )}
                    </div>

                    <h3 className="mt-3 font-display text-[19px] font-semibold leading-snug tracking-tight sm:text-[21px]">
                        <Link
                            href={`/tashabbuslar/${idea.id}`}
                            className="transition-colors hover:text-accent"
                        >
                            {idea.title}
                        </Link>
                    </h3>

                    <p className="mt-2 line-clamp-3 text-[14px] leading-relaxed text-muted">
                        {idea.summary || idea.description}
                    </p>

                    <p className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-faint">
                        <span>
                            <span className="font-semibold tabular-nums text-text">
                                {state.count}
                            </span>{" "}
                            ovoz
                        </span>
                        <span>
                            <span className="font-semibold tabular-nums text-text">
                                {idea.comment_count}
                            </span>{" "}
                            taklif
                        </span>
                        <span>{idea.author_label}</span>
                    </p>

                    {/* Reytingdagi ulush */}
                    <span
                        className="energy mt-3 block h-1 max-w-md rounded-full"
                        style={{ ["--scene" as string]: color }}
                    >
                        <span style={{ width: `${Math.max(share * 100, 4)}%` }} />
                    </span>

                    <div className="relative mt-4 flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={vote}
                            disabled={busy}
                            className={cn(
                                "inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-[13.5px] font-medium transition-all duration-200 disabled:opacity-70",
                                state.voted
                                    ? "border-transparent"
                                    : "border-line hover:-translate-y-0.5",
                            )}
                            style={
                                state.voted
                                    ? {
                                          color,
                                          background: `color-mix(in oklab, ${color} 15%, transparent)`,
                                      }
                                    : undefined
                            }
                        >
                            <Icon name="vote" size={15} />
                            <motion.span
                                key={state.count}
                                initial={{ y: -8, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.25 }}
                                className="font-semibold tabular-nums"
                            >
                                {state.count}
                            </motion.span>
                            {state.voted ? "Ovoz berildi" : "Ovoz berish"}
                        </button>

                        <Link
                            href={`/tashabbuslar/${idea.id}#takliflar`}
                            className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2.5 text-[13.5px] text-muted transition-colors hover:text-text"
                        >
                            <Icon name="chat" size={15} />
                            Taklif berish
                        </Link>

                        <AnimatePresence>
                            {toast && (
                                <motion.span
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -4 }}
                                    className="pointer-events-none absolute -top-9 left-0 z-20 max-w-xs rounded-lg bg-invert px-3 py-1.5 text-[12px] leading-snug text-on-invert shadow-lg"
                                >
                                    {toast}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </article>
    );
}

function Pill({
    children,
    color,
    filled,
}: {
    children: React.ReactNode;
    color?: string;
    filled?: boolean;
}) {
    return (
        <span
            className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11.5px] font-medium"
            style={
                filled && color
                    ? {
                          color,
                          borderColor: `color-mix(in oklab, ${color} 32%, transparent)`,
                          background: `color-mix(in oklab, ${color} 11%, transparent)`,
                      }
                    : undefined
            }
        >
            {children}
        </span>
    );
}
