/**
 * GSAP va uning plaginlari bir joyda ro'yxatdan o'tkaziladi.
 *
 * 3.13 dan beri SplitText ham bepul va asosiy paket ichida keladi.
 * Server tomonda `window` yo'q — ro'yxatdan o'tkazish faqat brauzerda.
 */
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);
}

export { gsap, ScrollTrigger, SplitText, useGSAP };

/** Foydalanuvchi harakatni kamaytirishni so'raganmi. */
export function prefersReducedMotion() {
    return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
