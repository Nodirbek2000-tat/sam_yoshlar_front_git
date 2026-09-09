"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Icon } from "@/components/icon";
import type { Choice } from "@/lib/types";

export function AppealForm({ categories }: { categories: Choice[] }) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setBusy(true);
        setError(null);

        const form = new FormData(event.currentTarget);

        try {
            const response = await fetch("/api/proxy/me/appeals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(Object.fromEntries(form.entries())),
            });

            if (!response.ok) {
                const data = await response.json();
                setError(data.detail ?? "Yuborilmadi. Maydonlarni tekshiring.");
                return;
            }

            setOpen(false);
            router.refresh();
        } catch {
            setError("Tarmoqda xatolik.");
        } finally {
            setBusy(false);
        }
    }

    return (
        <div>
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                className="inline-flex items-center gap-2 rounded-full bg-invert px-4 py-2 text-[13px] font-medium text-on-invert transition-opacity hover:opacity-90"
            >
                <Icon name={open ? "close" : "plus"} size={14} />
                {open ? "Bekor qilish" : "Murojaat yozish"}
            </button>

            <AnimatePresence>
                {open && (
                    <motion.form
                        onSubmit={submit}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                    >
                        <div className="mt-5 grid gap-4 rounded-xl border border-line p-5">
                            <label className="block">
                                <span className="mb-1.5 block text-[12.5px] font-medium text-muted">
                                    Mavzu <span className="text-red-500">*</span>
                                </span>
                                <input
                                    name="subject"
                                    required
                                    maxLength={200}
                                    className="h-10 w-full rounded-lg border border-line bg-page px-3 text-[14px] transition-colors focus:border-accent focus:outline-none"
                                />
                            </label>

                            <label className="block">
                                <span className="mb-1.5 block text-[12.5px] font-medium text-muted">
                                    Kategoriya
                                </span>
                                <select
                                    name="category"
                                    defaultValue={categories[0]?.value}
                                    className="h-10 w-full rounded-lg border border-line bg-page px-3 text-[14px] transition-colors focus:border-accent focus:outline-none"
                                >
                                    {categories.map((item) => (
                                        <option key={item.value} value={item.value}>
                                            {item.label}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="block">
                                <span className="mb-1.5 block text-[12.5px] font-medium text-muted">
                                    Matn <span className="text-red-500">*</span>
                                </span>
                                <textarea
                                    name="message"
                                    required
                                    rows={4}
                                    className="w-full resize-none rounded-lg border border-line bg-page px-3 py-2.5 text-[14px] leading-relaxed transition-colors focus:border-accent focus:outline-none"
                                />
                            </label>

                            {error && <p className="text-[13px] text-red-600">{error}</p>}

                            <button
                                type="submit"
                                disabled={busy}
                                className="justify-self-start rounded-full bg-invert px-5 py-2.5 text-[13.5px] font-medium text-on-invert transition-opacity hover:opacity-90 disabled:opacity-40"
                            >
                                {busy ? "Yuborilmoqda…" : "Yuborish"}
                            </button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>
        </div>
    );
}
