"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Icon } from "@/components/icon";
import { EmptyState, Flash, PanelHeader, StatusPill } from "@/components/panel/ui";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";

/**
 * «Botga yuborish» — yoqilgan bo'lsa, saytga qo'shilgan har bir yangilik,
 * e'lon, startap, tadbirkor va tengdosh botdagi hamma foydalanuvchiga
 * rasm va «Davomini o'qish» tugmasi bilan boradi.
 *
 * O'chirib qo'yilsa — hech kimga hech narsa yuborilmaydi.
 */

export type BotPost = {
    id: number;
    kind: string;
    kind_display: string;
    title: string;
    link: string;
    status: string;
    sent: number;
    failed: number;
    total: number;
    created_at: string;
    sent_at: string | null;
};

const KIND_TONE: Record<string, string> = {
    news: "rose",
    announcement: "pink",
    startup: "orange",
    business: "amber",
    peer: "cyan",
};

export function BotManager({ autoPost, posts }: { autoPost: boolean; posts: BotPost[] }) {
    const router = useRouter();
    const [enabled, setEnabled] = useState(autoPost);
    const [busy, setBusy] = useState(false);
    const [flash, setFlash] = useState<string | null>(null);

    async function toggle() {
        if (busy) return;

        const next = !enabled;
        setBusy(true);
        try {
            const response = await fetch("/api/proxy/panel/bot", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ auto_post: next }),
            });
            if (!response.ok) {
                setFlash("Saqlab bo'lmadi.");
                return;
            }

            setEnabled(next);
            setFlash(next ? "Yoqildi — yangi xabarlar botga ketadi." : "O'chirildi.");
            router.refresh();
        } finally {
            setBusy(false);
        }
    }

    return (
        <>
            <PanelHeader
                title="Botga yuborish"
                description="Saytga qo'shilgan yangilik, e'lon, startap, tadbirkor va tengdoshlar botdagi foydalanuvchilarga yuboriladi."
            />

            <Flash text={flash} onDone={() => setFlash(null)} />

            {/* Yoqish / o'chirish */}
            <div
                className={cn(
                    enabled ? "tone-emerald" : "tone-slate",
                    "mt-6 flex flex-wrap items-center gap-4 rounded-2xl border border-tone-line bg-tone-soft p-5",
                )}
            >
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-page text-tone-text">
                    <Icon name="send" size={22} />
                </span>

                <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-semibold">
                        {enabled ? "Yoqilgan" : "O'chirilgan"}
                    </p>
                    <p className="mt-0.5 text-[13px] text-muted">
                        {enabled
                            ? "Har bir yangi xabar botdagi hamma foydalanuvchiga boradi."
                            : "Hozir botga hech narsa yuborilmaydi."}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={toggle}
                    disabled={busy}
                    role="switch"
                    aria-checked={enabled}
                    aria-label="Botga yuborishni yoqish"
                    className={cn(
                        "relative h-8 w-14 shrink-0 rounded-full transition-colors disabled:opacity-60",
                        enabled ? "bg-tone" : "bg-line",
                    )}
                >
                    <motion.span
                        layout
                        transition={{ type: "spring", stiffness: 500, damping: 34 }}
                        className={cn(
                            "absolute top-1 size-6 rounded-full bg-page shadow",
                            enabled ? "left-7" : "left-1",
                        )}
                    />
                </button>
            </div>

            {/* Yuborilganlar */}
            <h2 className="mt-9 text-[15px] font-semibold tracking-tight">Yuborilgan xabarlar</h2>

            {posts.length ? (
                <ul className="mt-4 space-y-2.5">
                    <AnimatePresence initial={false}>
                        {posts.map((post) => (
                            <motion.li
                                key={post.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={cn(
                                    `tone-${KIND_TONE[post.kind] ?? "slate"}`,
                                    "flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-raised p-4",
                                )}
                            >
                                <span className="rounded-full bg-tone-soft px-2.5 py-1 text-[11.5px] font-medium text-tone-text">
                                    {post.kind_display}
                                </span>

                                <a
                                    href={post.link}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="min-w-0 flex-1 truncate text-[14.5px] font-medium transition-colors hover:text-accent"
                                >
                                    {post.title}
                                </a>

                                <span className="text-[12.5px] tabular-nums text-muted">
                                    {post.status === "sent"
                                        ? `${post.sent} / ${post.total} ta`
                                        : "navbatda"}
                                </span>

                                <StatusPill status={post.status === "sent" ? "approved" : "pending"} />

                                <span className="text-[12px] text-faint">
                                    {formatDate(post.sent_at ?? post.created_at)}
                                </span>
                            </motion.li>
                        ))}
                    </AnimatePresence>
                </ul>
            ) : (
                <div className="mt-4">
                    <EmptyState
                        text={
                            enabled
                                ? "Hali xabar yuborilmagan — yangi yangilik qo'shilsa shu yerda ko'rinadi."
                                : "Yuborish o'chirilgan."
                        }
                    />
                </div>
            )}
        </>
    );
}
