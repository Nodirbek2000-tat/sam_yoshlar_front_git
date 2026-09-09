"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Icon } from "@/components/icon";
import type { Solution } from "@/lib/types";

/**
 * Muammoga taklif yozish.
 *
 * Mehmonga forma ko'rsatilmaydi — o'rniga kirish taklifi chiqadi.
 * Ruxsatni Django ham tekshiradi, bu yerdagisi faqat qulaylik uchun.
 */
export function SolutionForm({
    problemId,
    canSubmit,
    onCreated,
}: {
    problemId: number;
    canSubmit: boolean;
    /** Yangi taklif — ro'yxatga sahifani yangilamasdan qo'shiladi. */
    onCreated?: (solution: Solution) => void;
}) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [done, setDone] = useState(false);

    if (!canSubmit) {
        return (
            <div className="tone-violet rounded-2xl border border-tone-line bg-tone-soft p-5 text-center">
                <p className="text-[14px] text-muted">
                    Taklif yozish uchun ro&apos;yxatdan o&apos;tgan bo&apos;lishingiz kerak.
                </p>
                <a
                    href={`/kirish?next=/tashabbuslar/muammolar/${problemId}`}
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-invert px-5 py-2.5 text-[13.5px] font-medium text-on-invert transition-opacity hover:opacity-90"
                >
                    Kirish
                    <Icon name="arrowRight" size={14} />
                </a>
            </div>
        );
    }

    if (done) {
        return (
            <div className="tone-emerald rounded-2xl border border-tone-line bg-tone-soft p-5 text-center">
                <span className="mx-auto grid size-10 place-items-center rounded-full bg-page">
                    <Icon name="check" size={18} className="text-tone-text" />
                </span>
                <p className="mt-3 text-[14px] font-medium text-tone-text">Taklifingiz yuborildi</p>
                <p className="mt-1 text-[13px] text-muted">
                    Ro&apos;yxatda darhol ko&apos;rinadi — tashkilotga ham xabar ketdi.
                </p>

                <button
                    type="button"
                    onClick={() => {
                        setDone(false);
                        setOpen(true);
                    }}
                    className="mt-4 text-[13px] font-medium text-tone-text hover:underline"
                >
                    Yana taklif yozish
                </button>
            </div>
        );
    }

    if (!open) {
        return (
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="group inline-flex items-center gap-2 rounded-full bg-invert px-5 py-2.5 text-[14px] font-medium text-on-invert transition-opacity hover:opacity-90"
            >
                <Icon name="plus" size={15} />
                Taklif berish
            </button>
        );
    }

    async function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (busy) return;

        const form = new FormData(event.currentTarget);
        setBusy(true);
        setError(null);

        try {
            const response = await fetch(`/api/proxy/problems/${problemId}/solutions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: form.get("title"),
                    description: form.get("description"),
                    technologies: form.get("technologies") ?? "",
                    expected_result: form.get("expected_result") ?? "",
                }),
            });

            if (!response.ok) {
                const data = (await response.json().catch(() => null)) as
                    | Record<string, string[] | string>
                    | null;
                const first = data ? Object.values(data)[0] : null;
                setError(
                    Array.isArray(first) ? first[0] : (first as string) ?? "Yuborib bo'lmadi.",
                );
                return;
            }

            const created = (await response.json()) as Solution;
            onCreated?.(created);
            setDone(true);

            // Ro'yxat allaqachon yangilandi; kelasi yuklashda ham to'g'ri chiqsin
            if (!onCreated) router.refresh();
        } catch {
            setError("Tarmoqda xatolik.");
        } finally {
            setBusy(false);
        }
    }

    return (
        <form
            onSubmit={submit}
            className="tone-violet rounded-2xl border border-tone-line bg-tone-soft p-5"
        >
            <h3 className="text-[14px] font-semibold text-tone-text">Taklifingiz</h3>

            <div className="mt-4 space-y-3">
                <Field name="title" label="Yechim nomi" required placeholder="Qisqa va aniq" />
                <Field
                    name="description"
                    label="Yechim tavsifi"
                    required
                    rows={4}
                    placeholder="Muammoni qanday hal qilasiz?"
                />
                <Field
                    name="technologies"
                    label="Texnologiya va vositalar"
                    placeholder="Ixtiyoriy"
                />
                <Field
                    name="expected_result"
                    label="Kutilayotgan natija"
                    rows={2}
                    placeholder="Ixtiyoriy"
                />
            </div>

            {error && <p className="mt-3 text-[12.5px] text-warn-text">{error}</p>}

            <div className="mt-5 flex items-center gap-2">
                <button
                    type="submit"
                    disabled={busy}
                    className="inline-flex items-center gap-2 rounded-full bg-invert px-5 py-2.5 text-[13.5px] font-medium text-on-invert transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                    {busy ? "Yuborilmoqda..." : "Yuborish"}
                </button>
                <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-full border border-tone-line px-5 py-2.5 text-[13.5px] text-muted transition-colors hover:text-text"
                >
                    Bekor qilish
                </button>
            </div>
        </form>
    );
}

function Field({
    name,
    label,
    rows,
    required,
    placeholder,
}: {
    name: string;
    label: string;
    rows?: number;
    required?: boolean;
    placeholder?: string;
}) {
    const shared =
        "mt-1.5 w-full rounded-xl border border-line bg-page px-3.5 py-2.5 text-[14px] outline-none transition-colors placeholder:text-faint focus:border-tone-line";

    return (
        <label className="block">
            <span className="text-[12.5px] text-muted">
                {label}
                {required && <span className="text-warn-text"> *</span>}
            </span>
            {rows ? (
                <textarea
                    name={name}
                    rows={rows}
                    required={required}
                    placeholder={placeholder}
                    className={`${shared} resize-y leading-relaxed`}
                />
            ) : (
                <input
                    name={name}
                    required={required}
                    placeholder={placeholder}
                    className={shared}
                />
            )}
        </label>
    );
}
