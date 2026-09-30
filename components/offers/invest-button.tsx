"use client";

import { HandCoins } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Icon, type IconName } from "@/components/icon";
import { cn } from "@/lib/cn";
import type { OfferState } from "@/lib/types";

import type { InvestPrefill } from "./invest-dialog";

/**
 * Startap sahifasidagi «Investitsiya kiritaman» tugmasi.
 *
 * Sahifaning o'zi hamma uchun bir xil keshlanadi — kim kirgani va taklif
 * yuborganmi, shu yerda brauzerda aniqlanadi. Oyna (forma va animatsiya)
 * faqat tugma bosilganda yuklanadi.
 */

const InvestDialog = dynamic(() => import("./invest-dialog"), { ssr: false });

type State =
    | { kind: "loading" }
    | { kind: "guest" }
    | { kind: "ready"; is_owner: boolean; offer: OfferState | null; prefill: InvestPrefill };

const SENT: Record<string, { tone: string; icon: IconName; title: string; text: string }> = {
    new: {
        tone: "tone-emerald",
        icon: "check",
        title: "Taklifingiz yuborilgan",
        text: "Asoschi ma'lumotlaringizni oldi va siz bilan bog'lanadi.",
    },
    accepted: {
        tone: "tone-emerald",
        icon: "check",
        title: "Taklifingiz qabul qilindi",
        text: "Asoschi tez orada siz bilan bog'lanadi.",
    },
    declined: {
        tone: "tone-slate",
        icon: "clock",
        title: "Taklifingiz ko'rib chiqildi",
        text: "Asoschi hozircha taklifni qabul qilmadi.",
    },
};

export function InvestButton({ startupId, startupName }: { startupId: number; startupName: string }) {
    const router = useRouter();
    const [state, setState] = useState<State>({ kind: "loading" });
    // Oyna faqat birinchi bosishdan keyin yuklanadi
    const [armed, setArmed] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const controller = new AbortController();

        fetch(`/api/proxy/startups/${startupId}/invest`, {
            cache: "no-store",
            signal: controller.signal,
        })
            .then(async (response) => {
                const data = response.ok ? await response.json() : null;
                setState(data?.authenticated ? { kind: "ready", ...data } : { kind: "guest" });
            })
            .catch((error: unknown) => {
                if (error instanceof DOMException && error.name === "AbortError") return;
                setState({ kind: "guest" });
            });

        return () => controller.abort();
    }, [startupId]);

    // --- O'z startapi: tugma o'rniga kelgan takliflarga yo'l ---
    if (state.kind === "ready" && state.is_owner) {
        return (
            <Link
                href="/kabinet/investitsiya"
                className="group flex items-center gap-3 rounded-2xl border border-tone-line bg-tone-soft px-4 py-3.5 transition-opacity hover:opacity-90"
            >
                <HandCoins className="size-5 shrink-0 text-tone-text" strokeWidth={1.7} />
                <span className="min-w-0 flex-1">
                    <span className="block text-[13.5px] font-medium text-tone-text">
                        Bu sizning startapingiz
                    </span>
                    <span className="block text-[12.5px] text-muted">Kelgan takliflarni ko&apos;rish</span>
                </span>
                <Icon
                    name="arrowRight"
                    size={15}
                    className="shrink-0 text-tone-text transition-transform group-hover:translate-x-0.5"
                />
            </Link>
        );
    }

    // --- Taklif yuborilgan: holati ---
    if (state.kind === "ready" && state.offer) {
        const view = SENT[state.offer.status] ?? SENT.new;
        return (
            <div
                className={cn(
                    view.tone,
                    "flex items-start gap-3 rounded-2xl border border-tone-line bg-tone-soft px-4 py-3.5",
                )}
            >
                <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-page text-tone-text">
                    <Icon name={view.icon} size={14} strokeWidth={2.2} />
                </span>
                <span>
                    <span className="block text-[14px] font-semibold text-tone-text">{view.title}</span>
                    <span className="mt-0.5 block text-[12.5px] leading-relaxed text-muted">
                        {view.text}
                    </span>
                </span>
            </div>
        );
    }

    function click() {
        if (state.kind === "guest") {
            router.push(`/kirish?next=/startaplar/${startupId}`);
            return;
        }
        setArmed(true);
        setOpen(true);
    }

    return (
        <>
            <div>
                <button
                    type="button"
                    onClick={click}
                    disabled={state.kind === "loading"}
                    className="invest-cta group relative inline-flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-invert px-5 py-4 text-[15px] font-semibold text-on-invert transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70"
                >
                    <HandCoins className="size-5" strokeWidth={1.8} />
                    Investitsiya kiritaman
                    <Icon
                        name="arrowRight"
                        size={15}
                        className="transition-transform duration-200 group-hover:translate-x-1"
                    />
                </button>
                <p className="mt-2 text-center text-[12px] text-faint">
                    {state.kind === "guest"
                        ? "Taklif yuborish uchun tizimga kirasiz"
                        : "Asoschi siz bilan o'zi bog'lanadi"}
                </p>
            </div>

            {armed && state.kind === "ready" && (
                <InvestDialog
                    open={open}
                    onClose={() => setOpen(false)}
                    startupId={startupId}
                    startupName={startupName}
                    prefill={state.prefill}
                    onSent={(offer) => setState({ ...state, offer })}
                />
            )}
        </>
    );
}
