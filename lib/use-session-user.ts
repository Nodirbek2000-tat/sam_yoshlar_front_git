"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import type { PendingFeedback, User } from "./types";

/** Sarlavhaga kerakli qism */
export type SessionUser = Pick<User, "full_name" | "initials" | "avatar" | "is_panel_admin"> & {
    /** O'qilmagan bildirishnomalar soni */
    unread: number;
    /** Investor bilan suhbat natijasi so'ralishi kerak bo'lsa */
    feedback: PendingFeedback | null;
};

/** Kirish yoki chiqishdan keyin sarlavha darhol yangilansin */
const EVENT = "sy:session";

export function notifySessionChanged() {
    window.dispatchEvent(new Event(EVENT));
}

/**
 * Joriy foydalanuvchi — brauzerda olinadi.
 *
 * Sahifa keshlangan va hamma uchun bir xil; kim kirgani esa bu yerda
 * `/api/auth/session` dan so'raladi: sahifa almashganda va kirish/chiqish
 * bo'lganda. Javob kelguncha `ready = false` — sarlavha «Kirish» tugmasini
 * miltillatib ko'rsatmaydi.
 */
export function useSessionUser() {
    const pathname = usePathname();
    const [state, setState] = useState<{ user: SessionUser | null; ready: boolean }>({
        user: null,
        ready: false,
    });
    const [version, setVersion] = useState(0);

    useEffect(() => {
        const bump = () => setVersion((value) => value + 1);
        window.addEventListener(EVENT, bump);
        return () => window.removeEventListener(EVENT, bump);
    }, []);

    useEffect(() => {
        const controller = new AbortController();

        fetch("/api/auth/session", { cache: "no-store", signal: controller.signal })
            .then((response) => (response.ok ? response.json() : { user: null }))
            .then((data: { user: SessionUser | null }) => setState({ user: data.user, ready: true }))
            .catch((error: unknown) => {
                // Sahifa almashib so'rov bekor qilingan — bu xato emas
                if (error instanceof DOMException && error.name === "AbortError") return;
                setState((previous) => ({ ...previous, ready: true }));
            });

        return () => controller.abort();
    }, [pathname, version]);

    return state;
}
