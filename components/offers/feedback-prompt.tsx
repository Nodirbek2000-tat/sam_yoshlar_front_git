"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import type { PendingFeedback } from "@/lib/types";
import { notifySessionChanged } from "@/lib/use-session-user";

/**
 * Startap egasi saytga kirganda: «investor bilan suhbat qanday o'tdi?»
 *
 * Sarlavha ichida turadi — qaysi sahifada bo'lmasin chiqadi. Javobsiz
 * yopilsa shu kirishda qayta bezovta qilmaydi, keyingi kirishda yana so'raydi.
 * Oynaning o'zi (animatsiya bilan) faqat kerak bo'lganda yuklanadi.
 */

const FeedbackDialog = dynamic(() => import("./feedback-dialog"), { ssr: false });

const KEY = "sy:feedback-closed";

function closedThisVisit(id: number) {
    try {
        return sessionStorage.getItem(KEY) === String(id);
    } catch {
        return false;
    }
}

export function FeedbackPrompt({ feedback }: { feedback: PendingFeedback }) {
    // Faqat brauzerda chiziladi (kim kirgani aniqlangach) — sessionStorage'ni o'qish xavfsiz
    const [closed, setClosed] = useState(() => closedThisVisit(feedback.id));
    const [open, setOpen] = useState(false);

    // Sahifa ochilishi bilan emas, biroz o'tib chiqadi — odam avval sahifani ko'rsin
    useEffect(() => {
        if (closed) return;
        const timer = setTimeout(() => setOpen(true), 1200);
        return () => clearTimeout(timer);
    }, [closed]);

    if (closed) return null;

    function close() {
        try {
            sessionStorage.setItem(KEY, String(feedback.id));
        } catch {
            // Maxfiy rejimda saqlab bo'lmasa ham oyna yopiladi
        }
        setOpen(false);
        setClosed(true);
    }

    function done() {
        setOpen(false);
        setClosed(true);
        // Sarlavha yangilansin: navbatdagi so'rov bo'lsa — keyingi kirishda chiqadi
        notifySessionChanged();
    }

    return (
        <FeedbackDialog open={open} target={feedback} allowLater onClose={close} onDone={done} />
    );
}
