"use client";

import Lenis from "lenis";
import { useEffect, useRef, type ReactNode } from "react";

import { gsap, prefersReducedMotion, ScrollTrigger, SplitText, useGSAP } from "@/lib/gsap";

/**
 * Bosh sahifaning harakat qatlami.
 *
 *   1. Lenis — yumshoq aylantirish. GSAP'ning soatiga ulangan, shuning
 *      uchun ScrollTrigger animatsiyalari aylantirish bilan bir kadrda yuradi.
 *   2. Aylantirishdagi animatsiyalar — belgilangan elementlarga `data-fx`
 *      qo'yiladi, qolganini shu komponent qiladi:
 *
 *        data-fx="heading"  sarlavha so'zma-so'z pastdan chiqadi
 *        data-fx="rise"     blok yumshoq ko'tarilib chiqadi
 *        data-fx="cards"    ichidagi kartalar to'lqin bo'lib kiradi
 *        data-fx="rows"     qatorlar chapdan sirg'alib kiradi
 *        data-fx="fill"     matn o'qilgan sari to'ladi (aylantirishga bog'liq)
 *        data-speed="0.4"   parallaks — sahifadan sekinroq/tezroq siljiydi
 *
 * Sahifaning o'zi server komponent bo'lib qoladi — bu yerda faqat o'ram.
 * Harakatni kamaytirish so'ralgan bo'lsa hech narsa ishga tushmaydi.
 */
export function HomeFx({ children }: { children: ReactNode }) {
    const scope = useRef<HTMLDivElement>(null);

    // --- Lenis
    useEffect(() => {
        if (prefersReducedMotion()) return;

        const lenis = new Lenis({
            duration: 1.15,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
        });

        lenis.on("scroll", ScrollTrigger.update);
        const tick = (time: number) => lenis.raf(time * 1000);
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);

        return () => {
            gsap.ticker.remove(tick);
            lenis.destroy();
        };
    }, []);

    // --- Aylantirishdagi animatsiyalar
    useGSAP(
        () => {
            const mm = gsap.matchMedia();

            mm.add("(prefers-reduced-motion: no-preference)", () => {
                // Sarlavhalar: har bir so'z o'z niqobi ichidan ko'tariladi
                gsap.utils.toArray<HTMLElement>("[data-fx='heading']").forEach((element) => {
                    const split = SplitText.create(element, { type: "words", mask: "words" });
                    gsap.from(split.words, {
                        yPercent: 110,
                        duration: 1,
                        ease: "power4.out",
                        stagger: 0.07,
                        scrollTrigger: { trigger: element, start: "top 88%", once: true },
                    });
                });

                gsap.utils.toArray<HTMLElement>("[data-fx='rise']").forEach((element) => {
                    gsap.from(element, {
                        y: 44,
                        opacity: 0,
                        duration: 1,
                        ease: "power3.out",
                        scrollTrigger: { trigger: element, start: "top 90%", once: true },
                    });
                });

                // Kartalar: ekranga kirgan to'plam birga, lekin ketma-ket
                gsap.utils.toArray<HTMLElement>("[data-fx='cards']").forEach((group) => {
                    const items = Array.from(group.children);
                    gsap.set(items, { y: 70, opacity: 0, scale: 0.96 });
                    ScrollTrigger.batch(items, {
                        start: "top 92%",
                        once: true,
                        onEnter: (batch) =>
                            gsap.to(batch, {
                                y: 0,
                                opacity: 1,
                                scale: 1,
                                duration: 1,
                                ease: "power3.out",
                                stagger: 0.09,
                                overwrite: true,
                            }),
                    });
                });

                gsap.utils.toArray<HTMLElement>("[data-fx='rows']").forEach((group) => {
                    gsap.from(group.children, {
                        x: -48,
                        opacity: 0,
                        duration: 0.9,
                        ease: "power3.out",
                        stagger: 0.08,
                        scrollTrigger: { trigger: group, start: "top 85%", once: true },
                    });
                });

                // O'qilgan sari to'ladigan matn — aylantirishga bog'langan
                gsap.utils.toArray<HTMLElement>("[data-fx='fill']").forEach((element) => {
                    const split = SplitText.create(element, { type: "words" });
                    gsap.fromTo(
                        split.words,
                        { opacity: 0.16 },
                        {
                            opacity: 1,
                            ease: "none",
                            stagger: 0.12,
                            scrollTrigger: {
                                trigger: element,
                                start: "top 82%",
                                end: "top 38%",
                                scrub: true,
                            },
                        },
                    );
                });

                gsap.utils.toArray<HTMLElement>("[data-speed]").forEach((element) => {
                    const speed = Number(element.dataset.speed) || 0.2;
                    gsap.to(element, {
                        yPercent: -speed * 40,
                        ease: "none",
                        scrollTrigger: {
                            trigger: element,
                            start: "top bottom",
                            end: "bottom top",
                            scrub: true,
                        },
                    });
                });
            });

            // Rasmlar kech yuklansa, balandliklar o'zgaradi — qayta o'lchaymiz
            const refresh = () => ScrollTrigger.refresh();
            window.addEventListener("load", refresh);
            return () => window.removeEventListener("load", refresh);
        },
        { scope },
    );

    return <div ref={scope}>{children}</div>;
}
