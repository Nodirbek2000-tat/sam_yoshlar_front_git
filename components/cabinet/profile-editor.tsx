"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { Icon, type IconName } from "@/components/icon";
import { BusinessForm } from "@/components/onboarding/business-form";
import { StartupForm } from "@/components/onboarding/startup-form";
import { cn } from "@/lib/cn";
import type { BusinessProfile, Choice, StartupProfile } from "@/lib/types";

/**
 * Kabinetdagi «Biznesim» va «Startapim»: anketa holati va tahrirlash.
 *
 * Anketa kengash tomonidan ko'rib chiqiladi. Rad etilgan anketani tuzatib
 * saqlasa — backend uni qayta «kutilmoqda» holatiga o'tkazadi.
 */

const STATUS: Record<string, { tone: string; icon: IconName; title: string; text: string }> = {
    pending: {
        tone: "amber",
        icon: "clock",
        title: "Kengash ko'rib chiqmoqda",
        text: "Tasdiqlangach ommaviy ro'yxatda ko'rinadi. Odatda 1–2 kun oladi.",
    },
    approved: {
        tone: "emerald",
        icon: "check",
        title: "Tasdiqlangan",
        text: "Anketangiz ommaviy ro'yxatda ko'rinib turibdi.",
    },
    rejected: {
        tone: "rose",
        icon: "alert",
        title: "Qaytarildi",
        text: "Quyidagini tuzatib saqlang — anketa qayta ko'rib chiqiladi.",
    },
};

export function StatusBanner({ status, note }: { status: string; note?: string }) {
    const info = STATUS[status] ?? STATUS.pending;

    return (
        <div
            className={cn(
                `tone-${info.tone}`,
                "mb-6 flex items-start gap-3.5 rounded-2xl border border-tone-line bg-tone-soft p-4",
            )}
        >
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-page text-tone-text">
                <Icon name={info.icon} size={17} />
            </span>
            <div className="min-w-0">
                <p className="text-[14px] font-semibold text-tone-text">{info.title}</p>
                <p className="mt-0.5 text-[13px] leading-relaxed text-muted">{info.text}</p>
                {note && (
                    <p className="mt-2 rounded-lg bg-page px-3 py-2 text-[13px] text-text">
                        <span className="text-faint">Kengash izohi: </span>
                        {note}
                    </p>
                )}
            </div>
        </div>
    );
}

function Saved({ show }: { show: boolean }) {
    return (
        <AnimatePresence>
            {show && (
                <motion.p
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="tone-emerald mb-5 inline-flex items-center gap-2 rounded-full bg-tone-soft px-4 py-2 text-[13px] text-tone-text"
                >
                    <Icon name="check" size={14} />
                    Saqlandi
                </motion.p>
            )}
        </AnimatePresence>
    );
}

function useFlash() {
    const [show, setShow] = useState(false);
    return {
        show,
        flash: () => {
            setShow(true);
            window.scrollTo({ top: 0, behavior: "smooth" });
            setTimeout(() => setShow(false), 2800);
        },
    };
}

export function BusinessEditor({
    initial,
    spheres,
    regions,
}: {
    initial: BusinessProfile | null;
    spheres: Choice[];
    regions: Choice[];
}) {
    const { show, flash } = useFlash();

    return (
        <>
            <Saved show={show} />
            <BusinessForm initial={initial} spheres={spheres} regions={regions} onSaved={flash} />
        </>
    );
}

export function StartupEditor({
    initial,
    spheres,
    stages,
}: {
    initial: StartupProfile | null;
    spheres: Choice[];
    stages: Choice[];
}) {
    const { show, flash } = useFlash();

    return (
        <>
            <Saved show={show} />
            <StartupForm initial={initial} spheres={spheres} stages={stages} onSaved={flash} />
        </>
    );
}
