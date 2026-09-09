"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Icon } from "@/components/icon";

/** Taklif yozish. Mehmon uchun ko'rinmaydi — o'rniga kirish taklifi turadi. */
export function CommentForm({
    initiativeId,
    authorName,
}: {
    initiativeId: number;
    authorName: string;
}) {
    const router = useRouter();
    const [text, setText] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function submit(event: FormEvent) {
        event.preventDefault();
        if (!text.trim()) return;

        setBusy(true);
        setError(null);

        try {
            const response = await fetch(`/api/proxy/initiatives/${initiativeId}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ author_name: authorName, text }),
            });

            if (!response.ok) {
                const data = await response.json();
                setError(data.detail ?? "Taklif yuborilmadi.");
                return;
            }

            setText("");
            router.refresh();
        } catch {
            setError("Tarmoqda xatolik.");
        } finally {
            setBusy(false);
        }
    }

    return (
        <form onSubmit={submit} className="rounded-xl border border-line p-4">
            <textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                rows={3}
                placeholder="Taklifingizni yozing — qanday hal qilish mumkin?"
                className="w-full resize-none bg-transparent text-[14px] leading-relaxed outline-none placeholder:text-faint"
            />

            <div className="mt-3 flex items-center justify-between gap-3 border-t border-line pt-3">
                <span className="text-[12px] text-faint">{authorName}</span>

                <button
                    type="submit"
                    disabled={busy || !text.trim()}
                    className="inline-flex items-center gap-2 rounded-full bg-invert px-4 py-2 text-[13px] font-medium text-on-invert transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    {busy ? "Yuborilmoqda…" : "Yuborish"}
                    <Icon name="arrowRight" size={13} />
                </button>
            </div>

            {error && (
                <p className="mt-3 text-[12.5px] text-red-600">{error}</p>
            )}
        </form>
    );
}
