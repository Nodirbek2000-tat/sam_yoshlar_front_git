"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Icon } from "@/components/icon";
import type { Choice } from "@/lib/types";

/**
 * «Tuman / shahar» — botda tanlanadi, kabinetda ko'rinadi va shu yerda
 * o'zgartirsa bo'ladi. Ro'yxat — Samarqand viloyatining tuman va shaharlari.
 */
export function DistrictPicker({ value, options }: { value: string; options: Choice[] }) {
    const router = useRouter();
    const [editing, setEditing] = useState(false);
    const [selected, setSelected] = useState(
        () => options.find((item) => item.label === value)?.value ?? "",
    );
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function save() {
        if (!selected || busy) return;

        setBusy(true);
        setError(null);
        try {
            const response = await fetch("/api/auth/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ district: selected }),
            });
            const data = (await response.json().catch(() => null)) as { detail?: string } | null;

            if (!response.ok) {
                setError(data?.detail ?? "Saqlab bo'lmadi.");
                return;
            }

            setEditing(false);
            router.refresh();
        } catch {
            setError("Tarmoqda xatolik.");
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="min-w-0">
            <AnimatePresence mode="wait" initial={false}>
                {editing ? (
                    <motion.div
                        key="edit"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.18 }}
                        className="flex flex-wrap items-center gap-2"
                    >
                        <select
                            value={selected}
                            onChange={(event) => setSelected(event.target.value)}
                            aria-label="Tuman yoki shahar"
                            className="h-9 min-w-0 max-w-full rounded-lg border border-line bg-page px-3 text-[13.5px] text-text transition-colors focus:border-accent focus:outline-none"
                        >
                            <option value="" disabled>
                                Tanlang
                            </option>
                            {options.map((item) => (
                                <option key={item.value} value={item.value}>
                                    {item.label}
                                </option>
                            ))}
                        </select>
                        <button
                            type="button"
                            onClick={save}
                            disabled={!selected || busy}
                            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-invert px-3.5 text-[13px] font-medium text-on-invert transition-opacity hover:opacity-90 disabled:opacity-40"
                        >
                            <Icon name="check" size={14} />
                            {busy ? "Saqlanmoqda…" : "Saqlash"}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setEditing(false);
                                setError(null);
                            }}
                            className="h-9 rounded-lg px-3 text-[13px] text-muted transition-colors hover:text-text"
                        >
                            Bekor
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="view"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="flex flex-wrap items-center gap-x-3 gap-y-1"
                    >
                        <span>{value || "Tanlanmagan"}</span>
                        {options.length > 0 && (
                            <button
                                type="button"
                                onClick={() => setEditing(true)}
                                className="inline-flex items-center gap-1 text-[12.5px] font-medium text-accent-text hover:underline"
                            >
                                {value ? "O'zgartirish" : "Tanlash"}
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {error && <p className="mt-1.5 text-[12.5px] text-warn-text">{error}</p>}
        </div>
    );
}
