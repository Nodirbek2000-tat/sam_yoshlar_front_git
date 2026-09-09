"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { Icon } from "@/components/icon";
import { LikeButton } from "@/components/problems/like-button";
import { SolutionForm } from "@/components/problems/solution-form";
import { formatDate } from "@/lib/format";
import type { Solution } from "@/lib/types";

/**
 * Muammoga kelgan takliflar.
 *
 * Ro'yxat shu yerda saqlanadi: yangi taklif yozilishi bilan sahifani
 * yangilamasdan tepaga qo'shiladi, layk bosilganda esa tartib jonli
 * o'zgaradi — ko'p yig'gani yuqoriga siljiydi.
 */
export function SolutionBoard({
    problemId,
    initial,
    canSubmit,
}: {
    problemId: number;
    initial: Solution[];
    canSubmit: boolean;
}) {
    const [solutions, setSolutions] = useState(initial);

    // Layklar shu yerda — tartib ular bo'yicha hisoblanadi
    const [likes, setLikes] = useState<Record<number, { count: number; liked: boolean }>>(() =>
        Object.fromEntries(
            initial.map((item) => [item.id, { count: item.like_count, liked: item.liked }]),
        ),
    );

    const stateOf = (item: Solution) =>
        likes[item.id] ?? { count: item.like_count, liked: item.liked };

    const sorted = [...solutions].sort((a, b) => stateOf(b).count - stateOf(a).count);

    function add(solution: Solution) {
        setSolutions((current) => [solution, ...current]);
        setLikes((current) => ({
            ...current,
            [solution.id]: { count: solution.like_count, liked: solution.liked },
        }));
    }

    return (
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-14">
            <div className="min-w-0">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <h2 className="text-[17px] font-semibold tracking-tight">
                        Takliflar
                        <span className="ml-2 text-[13px] font-normal text-muted">
                            {solutions.length} ta
                        </span>
                    </h2>
                    <span className="text-[12.5px] text-faint">
                        Ko&apos;p layk yig&apos;gani tepada
                    </span>
                </div>

                {sorted.length ? (
                    <div className="mt-5 space-y-3">
                        <AnimatePresence initial={false}>
                            {sorted.map((solution, index) => {
                                const state = stateOf(solution);

                                return (
                                    <motion.div
                                        key={solution.id}
                                        layout
                                        initial={{ opacity: 0, y: -12, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{
                                            layout: {
                                                type: "spring",
                                                stiffness: 320,
                                                damping: 34,
                                            },
                                            duration: 0.4,
                                        }}
                                        className="group rounded-2xl border border-line bg-raised p-5 transition-colors duration-300 hover:border-tone-line"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex min-w-0 items-center gap-3">
                                                {index === 0 && state.count > 0 && (
                                                    <span className="tone-amber grid size-8 shrink-0 place-items-center rounded-lg bg-tone-soft">
                                                        <Icon
                                                            name="trophy"
                                                            size={15}
                                                            className="text-tone-text"
                                                        />
                                                    </span>
                                                )}
                                                <div className="min-w-0">
                                                    <h3 className="truncate text-[15.5px] font-semibold">
                                                        {solution.title}
                                                    </h3>
                                                    <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-[12.5px] text-muted">
                                                        <span>{solution.author_name}</span>
                                                        <span className="text-faint">
                                                            {formatDate(solution.created_at)}
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>

                                            <LikeButton
                                                solutionId={solution.id}
                                                likes={state.count}
                                                liked={state.liked}
                                                canLike={canSubmit}
                                                returnTo={`/tashabbuslar/muammolar/${problemId}`}
                                                onChange={(next) =>
                                                    setLikes((current) => ({
                                                        ...current,
                                                        [solution.id]: next,
                                                    }))
                                                }
                                            />
                                        </div>

                                        <p className="mt-3 text-[14px] leading-relaxed text-muted">
                                            {solution.description}
                                        </p>

                                        {(solution.technologies || solution.expected_result) && (
                                            <dl className="mt-4 grid gap-3 border-t border-line pt-4 text-[13px] sm:grid-cols-2">
                                                {solution.technologies && (
                                                    <div>
                                                        <dt className="text-[11.5px] text-faint">
                                                            Texnologiyalar
                                                        </dt>
                                                        <dd className="mt-0.5">
                                                            {solution.technologies}
                                                        </dd>
                                                    </div>
                                                )}
                                                {solution.expected_result && (
                                                    <div>
                                                        <dt className="text-[11.5px] text-faint">
                                                            Kutilayotgan natija
                                                        </dt>
                                                        <dd className="mt-0.5">
                                                            {solution.expected_result}
                                                        </dd>
                                                    </div>
                                                )}
                                            </dl>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="mt-5 rounded-2xl border border-dashed border-line py-16 text-center">
                        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-tone-soft">
                            <Icon name="bulb" size={22} className="text-tone-text" />
                        </span>
                        <p className="mt-3 text-[14px] text-muted">
                            Hali taklif yo&apos;q — birinchi bo&apos;ling.
                        </p>
                    </div>
                )}
            </div>

            <div className="lg:sticky lg:top-24 lg:self-start">
                <SolutionForm problemId={problemId} canSubmit={canSubmit} onCreated={add} />
            </div>
        </div>
    );
}
