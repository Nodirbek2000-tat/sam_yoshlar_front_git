"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { Icon } from "@/components/icon";
import { PeerForm } from "@/components/onboarding/peer-form";
import type { Country, PeerProfile } from "@/lib/types";

/** Kabinetdagi «Tengdosh profilim»: anketa va «Saqlandi» belgisi. */
export function PeerEditor({
    initial,
    countries,
    defaultPhone,
}: {
    initial: PeerProfile | null;
    countries: Country[];
    defaultPhone: string;
}) {
    const [saved, setSaved] = useState(false);

    function flash() {
        setSaved(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
        setTimeout(() => setSaved(false), 2800);
    }

    return (
        <>
            <AnimatePresence>
                {saved && (
                    <motion.p
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="tone-emerald mb-5 inline-flex items-center gap-2 rounded-full bg-tone-soft px-4 py-2 text-[13px] text-tone-text"
                    >
                        <Icon name="check" size={14} />
                        Saqlandi — profilingiz yangilandi
                    </motion.p>
                )}
            </AnimatePresence>

            <PeerForm
                initial={initial}
                countries={countries}
                defaultPhone={defaultPhone}
                onSaved={flash}
            />
        </>
    );
}
