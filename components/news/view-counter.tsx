"use client";

import { useEffect, useState } from "react";

import { Icon } from "@/components/icon";
import { API_BASE } from "@/lib/api";

/**
 * Ko'rishlar soni. Sahifa keshlangani uchun «o'qildi» signali brauzerdan
 * yuboriladi va javobdagi yangi son darhol ko'rsatiladi.
 *
 * Bitta oynada qayta ochilsa qayta yuborilmaydi; server ham bir odamdan
 * yarim soatda bir marta sanaydi.
 */
export function ViewCounter({ slug, views }: { slug: string; views: number }) {
    const [count, setCount] = useState(views);

    useEffect(() => {
        const key = `sy:korildi:${slug}`;
        try {
            if (sessionStorage.getItem(key)) return;
            sessionStorage.setItem(key, "1");
        } catch {
            // Maxfiy rejim — baribir yuboramiz, server takrorni o'zi sanamaydi
        }

        const controller = new AbortController();
        fetch(`${API_BASE}/news/${encodeURIComponent(slug)}/korildi/`, {
            method: "POST",
            signal: controller.signal,
            keepalive: true,
        })
            .then((response) => (response.ok ? response.json() : null))
            .then((data: { views?: number } | null) => {
                if (typeof data?.views === "number") setCount(data.views);
            })
            .catch(() => null);

        return () => controller.abort();
    }, [slug]);

    return (
        <span className="inline-flex items-center gap-1.5 text-[13px] text-faint">
            <Icon name="eye" size={13} />
            {count}
        </span>
    );
}
