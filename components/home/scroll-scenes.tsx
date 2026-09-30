"use client";

import { useEffect } from "react";

/**
 * Aylantirishga bog'langan sahnalar — bosh sahifaning «rejissyori».
 *
 * Sahifadagi `[data-scene]` bo'limlarini kuzatadi va har biriga aylantirish
 * holatini CSS o'zgaruvchisi qilib beradi — qolganini CSS bajaradi:
 *
 *   data-scene="pin"   mahkamlangan bo'lim: `--p` (0..1) — ichida qancha yurildi;
 *                      `data-steps="4"` bo'lsa `--step` (0..3) ham beriladi
 *   data-scene="view"  oddiy bo'lim: `--p` — ekrandan o'tish yo'li (0..1)
 *   data-scene="spy"   ro'yxat: ekran o'rtasiga eng yaqin `[data-spy-item]`
 *                      `data-active` oladi, bo'limga `--active` (tartib raqami)
 *
 * `[data-scroll-bar]` — sahifa qancha o'qilganini ko'rsatuvchi chiziq.
 *
 * Har bir kadrda faqat ekran yaqinidagi sahnalar o'lchanadi. «Harakatni
 * kamaytirish» yoqilgan bo'lsa umuman ishlamaydi — sahifa oddiy ko'rinishda.
 */
export function ScrollScenes() {
    useEffect(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        const scenes = Array.from(document.querySelectorAll<HTMLElement>("[data-scene]"));
        const bar = document.querySelector<HTMLElement>("[data-scroll-bar]");
        const near = new Set<HTMLElement>();
        const items = new Map<HTMLElement, HTMLElement[]>();
        let frame = 0;

        const clamp = (value: number) => Math.max(0, Math.min(1, value));

        function update() {
            frame = 0;
            const viewport = window.innerHeight;

            if (bar) {
                const max = document.documentElement.scrollHeight - viewport;
                bar.style.transform = `scaleX(${max > 0 ? clamp(window.scrollY / max) : 0})`;
            }

            for (const scene of near) {
                const kind = scene.dataset.scene;

                if (kind === "spy") {
                    let list = items.get(scene);
                    if (!list) {
                        list = Array.from(scene.querySelectorAll<HTMLElement>("[data-spy-item]"));
                        items.set(scene, list);
                    }

                    // Ekran o'rtasidan biroz yuqori — ko'z odatda shu yerda turadi
                    const focus = viewport * 0.46;
                    let best = 0;
                    let distance = Infinity;
                    list.forEach((item, index) => {
                        const rect = item.getBoundingClientRect();
                        const gap = Math.abs(rect.top + rect.height / 2 - focus);
                        if (gap < distance) {
                            distance = gap;
                            best = index;
                        }
                    });

                    if (scene.style.getPropertyValue("--active") !== String(best)) {
                        scene.style.setProperty("--active", String(best));
                        list.forEach((item, index) => item.toggleAttribute("data-active", index === best));
                    }
                    continue;
                }

                const rect = scene.getBoundingClientRect();
                const progress =
                    kind === "pin"
                        ? rect.height > viewport
                            ? clamp(-rect.top / (rect.height - viewport))
                            : 0
                        : clamp((viewport - rect.top) / (viewport + rect.height));

                scene.style.setProperty("--p", progress.toFixed(4));

                const steps = Number(scene.dataset.steps);
                if (steps) {
                    scene.style.setProperty("--step", String(Math.min(steps - 1, Math.floor(progress * steps))));
                }
            }
        }

        const schedule = () => {
            if (!frame) frame = requestAnimationFrame(update);
        };

        const io = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) near.add(entry.target as HTMLElement);
                    else near.delete(entry.target as HTMLElement);
                }
                schedule();
            },
            { rootMargin: "25% 0px" },
        );
        for (const scene of scenes) io.observe(scene);

        window.addEventListener("scroll", schedule, { passive: true });
        window.addEventListener("resize", schedule);
        schedule();

        return () => {
            cancelAnimationFrame(frame);
            io.disconnect();
            window.removeEventListener("scroll", schedule);
            window.removeEventListener("resize", schedule);
        };
    }, []);

    return null;
}
