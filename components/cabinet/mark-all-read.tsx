"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Icon } from "@/components/icon";

/** Hamma bildirishnomani o'qilgan deb belgilaydi. */
export function MarkAllRead() {
    const router = useRouter();
    const [busy, setBusy] = useState(false);

    async function mark() {
        setBusy(true);
        try {
            await fetch("/api/proxy/me/notifications", { method: "POST" });
            router.refresh();
        } finally {
            setBusy(false);
        }
    }

    return (
        <button
            type="button"
            onClick={mark}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-[13px] text-muted transition-colors hover:text-text disabled:opacity-40"
        >
            <Icon name="check" size={14} />
            {busy ? "Belgilanmoqda…" : "Hammasini o'qildi"}
        </button>
    );
}
