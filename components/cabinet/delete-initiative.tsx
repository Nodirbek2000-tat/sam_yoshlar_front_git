"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Icon } from "@/components/icon";

/** O'z tashabbusini o'chirish. Server ham egalikni tekshiradi. */
export function DeleteInitiative({ id, title }: { id: number; title: string }) {
    const router = useRouter();
    const [busy, setBusy] = useState(false);

    async function remove() {
        const ok = confirm(
            `«${title}» o'chirilsinmi?\n\nBerilgan ovozlar va takliflar ham o'chadi. Buni qaytarib bo'lmaydi.`,
        );
        if (!ok) return;

        setBusy(true);
        try {
            const response = await fetch(`/api/proxy/me/initiatives/${id}`, {
                method: "DELETE",
            });
            if (response.ok) router.refresh();
        } finally {
            setBusy(false);
        }
    }

    return (
        <button
            type="button"
            onClick={remove}
            disabled={busy}
            title="O'chirish"
            aria-label="O'chirish"
            className="grid size-8 place-items-center rounded-lg text-faint transition-colors hover:bg-surface hover:text-red-600 disabled:opacity-40"
        >
            <Icon name="trash" size={15} />
        </button>
    );
}
