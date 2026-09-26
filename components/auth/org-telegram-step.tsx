"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Icon } from "@/components/icon";
import { cn } from "@/lib/cn";
import type { User } from "@/lib/types";

/**
 * Tashkilotning birinchi kirishi: Telegram hisobini ulash.
 *
 * Login-parol to'g'ri, lekin tashkilotning Telegram'i hali ulanmagan.
 * Maxsus havola botni ochadi va `/start` o'zi yuboriladi — bot tashkilotni
 * taniydi va faqat raqam so'raydi. Bu oyna esa holatni so'rab turadi va
 * ulanishi bilan o'zi tizimga kiradi: kod yozish shart emas.
 */

export type OrgLink = {
    ticket: string;
    botUrl: string;
    organization: string;
    firstLogin: boolean;
    expiresIn: number;
};

type Status = "waiting" | "phone" | "linked" | "expired";

/** Oyna ochiq bo'lsa — tez, orqada bo'lsa — siyrakroq so'raymiz */
const POLL_VISIBLE = 1500;
const POLL_HIDDEN = 4000;

export function OrgTelegramStep({
    link,
    onLinked,
    onRestart,
}: {
    link: OrgLink;
    onLinked: (user: User | null, onboarding: string | null) => void;
    onRestart: () => void;
}) {
    const [status, setStatus] = useState<Status>("waiting");
    const [secondsLeft, setSecondsLeft] = useState(link.expiresIn);

    const busy = useRef(false);
    const finished = useRef(false);
    const linkedRef = useRef(onLinked);

    useEffect(() => {
        linkedRef.current = onLinked;
    }, [onLinked]);

    const poll = useCallback(async () => {
        if (busy.current || finished.current) return;
        busy.current = true;

        try {
            const response = await fetch("/api/auth/org-link", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ticket: link.ticket }),
                cache: "no-store",
            });
            const data = (await response.json().catch(() => null)) as {
                status?: string;
                user?: User;
                onboarding?: string | null;
            } | null;

            const next = data?.status;

            if (next === "linked") {
                finished.current = true;
                setStatus("linked");
                linkedRef.current(data?.user ?? null, data?.onboarding ?? null);
            } else if (next === "phone" || next === "waiting") {
                setStatus(next);
            } else if (next === "expired" || next === "used" || next === "invalid") {
                finished.current = true;
                setStatus("expired");
            }
            // «offline» — tarmoq uzildi, keyingi safar yana so'raymiz
        } catch {
            // Internet vaqtincha yo'q — keyingi urinishda davom etadi
        } finally {
            busy.current = false;
        }
    }, [link.ticket]);

    // Holatni so'rab turish. Telegram'dan qaytganda (oyna yana ko'rinsa)
    // darhol so'raymiz — shunda kirish bir zumda bo'ladi.
    useEffect(() => {
        let timer: number | undefined;

        const schedule = () => {
            window.clearTimeout(timer);
            if (finished.current) return;
            timer = window.setTimeout(
                async () => {
                    await poll();
                    schedule();
                },
                document.hidden ? POLL_HIDDEN : POLL_VISIBLE,
            );
        };

        const wake = () => {
            if (document.hidden) return;
            void poll().then(schedule);
        };

        schedule();
        document.addEventListener("visibilitychange", wake);
        window.addEventListener("focus", wake);

        return () => {
            window.clearTimeout(timer);
            document.removeEventListener("visibilitychange", wake);
            window.removeEventListener("focus", wake);
        };
    }, [poll]);

    // Havola muddati — faqat ko'rsatish uchun; aniq holatni server aytadi
    useEffect(() => {
        const started = Date.now();
        const timer = window.setInterval(() => {
            const left = Math.max(0, link.expiresIn - Math.floor((Date.now() - started) / 1000));
            setSecondsLeft(left);
            if (left === 0) window.clearInterval(timer);
        }, 1000);
        return () => window.clearInterval(timer);
    }, [link.expiresIn]);

    if (status === "expired") {
        return (
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
            >
                <span className="tone-amber mx-auto grid size-14 place-items-center rounded-2xl bg-tone-soft text-tone-text">
                    <Icon name="clock" size={24} />
                </span>
                <h2 className="mt-5 text-xl font-semibold">Havolaning muddati tugadi</h2>
                <p className="mt-2 text-[14px] leading-relaxed text-muted">
                    Xavotir olmang — login va parol bilan qaytadan kiring, yangi havola chiqadi.
                </p>
                <button
                    type="button"
                    onClick={onRestart}
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-invert py-3.5 text-[15px] font-semibold text-on-invert transition-opacity hover:opacity-90"
                >
                    <Icon name="arrowLeft" size={17} />
                    Qaytadan kirish
                </button>
            </motion.div>
        );
    }

    const opened = status === "phone" || status === "linked";
    const linked = status === "linked";

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
            <div className="flex items-center gap-3">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#2AABEE] text-white shadow-sm">
                    <Icon name="telegram" size={22} />
                </span>
                <div className="min-w-0">
                    <p className="text-[12.5px] font-medium uppercase tracking-[0.08em] text-faint">
                        {link.firstLogin ? "Birinchi kirish" : "Telegram ulanmagan"}
                    </p>
                    <h2 className="truncate text-xl font-semibold">{link.organization}</h2>
                </div>
            </div>

            <p className="mt-4 text-[14px] leading-relaxed text-muted">
                {link.firstLogin ? "Siz birinchi marta kiryapsiz. " : ""}
                Tashkilot hisobini Telegram&apos;ga <strong className="text-text">bir marta</strong>{" "}
                ulaymiz — keyin saytga login-parol bilan ham, bot orqali ham kira olasiz.
            </p>

            <a
                href={link.botUrl}
                target="_blank"
                rel="noreferrer"
                className="group mt-6 flex items-center justify-center gap-2.5 rounded-xl bg-[#2AABEE] py-3.5 text-[15px] font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
                <Icon name="telegram" size={18} />
                Telegram&apos;da ochish
                <Icon
                    name="arrowRight"
                    size={16}
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                />
            </a>

            <ol className="mt-6 space-y-2.5">
                <Step
                    index={1}
                    done={opened}
                    active={!opened}
                    title="Botni oching"
                    text="«Start» tugmasi chiqsa — bosing"
                />
                <Step
                    index={2}
                    done={linked}
                    active={opened && !linked}
                    title="Raqamingizni yuboring"
                    text="Botdagi «📱 Raqamni yuborish» tugmasi orqali"
                />
                <Step
                    index={3}
                    done={linked}
                    active={false}
                    title="Sayt o'zi ochiladi"
                    text="Kod yozish shart emas"
                />
            </ol>

            <div className="mt-6 flex items-center justify-between gap-3 border-t border-line pt-5 text-[12.5px] text-faint">
                <span className="inline-flex items-center gap-2" aria-live="polite">
                    <span className="relative flex size-2">
                        <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60" />
                        <span className="relative inline-flex size-2 rounded-full bg-accent" />
                    </span>
                    {opened ? "Raqamingiz kutilmoqda…" : "Bot ochilishi kutilmoqda…"}
                </span>
                <span className="tabular-nums">
                    {secondsLeft > 0 ? `${formatTime(secondsLeft)} amal qiladi` : "Muddat tugadi"}
                </span>
            </div>

            <button
                type="button"
                onClick={onRestart}
                className="mt-4 w-full text-center text-[13px] text-muted transition-colors hover:text-text"
            >
                Boshqa hisob bilan kirish
            </button>
        </motion.div>
    );
}

function Step({
    index,
    done,
    active,
    title,
    text,
}: {
    index: number;
    done: boolean;
    active: boolean;
    title: string;
    text: string;
}) {
    return (
        <li
            className={cn(
                "flex items-center gap-3.5 rounded-xl border px-4 py-3 transition-colors duration-300",
                done
                    ? "tone-emerald border-tone-line bg-tone-soft"
                    : active
                      ? "border-accent bg-raised"
                      : "border-line bg-raised opacity-70",
            )}
        >
            <span
                className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-full text-[13px] font-semibold transition-colors duration-300",
                    done ? "bg-page text-tone-text" : "bg-surface text-muted",
                )}
            >
                <AnimatePresence mode="wait" initial={false}>
                    {done ? (
                        <motion.span
                            key="done"
                            initial={{ scale: 0.4, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 500, damping: 26 }}
                        >
                            <Icon name="check" size={16} />
                        </motion.span>
                    ) : (
                        <motion.span key="index" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            {index}
                        </motion.span>
                    )}
                </AnimatePresence>
            </span>
            <span className="min-w-0">
                <span
                    className={cn(
                        "block text-[14px] font-semibold",
                        done && "text-tone-text",
                    )}
                >
                    {title}
                </span>
                <span className="block text-[12.5px] text-muted">{text}</span>
            </span>
        </li>
    );
}

function formatTime(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
}
