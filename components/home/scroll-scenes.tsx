"use client";

import { useEffect } from "react";

/**
 * Aylantirishga bog'langan sahnalar — bosh sahifaning «rejissyori».
 *
 * Sahifadagi `[data-scene]` bo'limlarini kuzatadi va har biriga aylantirish
 * holatini CSS o'zgaruvchisi qilib beradi — qolganini CSS bajaradi:
 *
 *   data-scene="pin"   mahkamlangan bo'lim: `--p` (0..1) — ichida qancha yurildi;
 *                      `data-steps="4"` bo'lsa `--step` (0..3) ham beriladi va
 *                      `[data-step-item]` bolalaridan faoliga `data-active` qo'yiladi;
 *                      `data-count="8"` bo'lsa `--idx` — o'rtadagi element raqami
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

        const root = document.documentElement;
        // Oxirgi yozilgan qiymatlar — o'zgarmagan bo'lsa qayta yozilmaydi (stil qayta hisoblanmasin)
        const written = new Map<HTMLElement, Map<string, string>>();
        const scenes = Array.from(document.querySelectorAll<HTMLElement>("[data-scene]"));
        const bar = document.querySelector<HTMLElement>("[data-scroll-bar]");
        const near = new Set<HTMLElement>();
        const items = new Map<HTMLElement, HTMLElement[]>();
        let frame = 0;

        const clamp = (value: number) => Math.max(0, Math.min(1, value));

        function children(scene: HTMLElement, selector: string) {
            let list = items.get(scene);
            if (!list) {
                list = Array.from(scene.querySelectorAll<HTMLElement>(selector));
                items.set(scene, list);
            }
            return list;
        }

        /** O'zgargan bo'lsagina yozadi — keraksiz stil qayta hisoblanishi bo'lmasin. */
        function write(scene: HTMLElement, name: string, value: string) {
            const key = `${name}:${value}`;
            const marks = written.get(scene) ?? new Map<string, string>();
            if (marks.get(name) === key) return false;
            marks.set(name, key);
            written.set(scene, marks);
            scene.style.setProperty(name, value);
            return true;
        }

        function update() {
            frame = 0;
            const viewport = window.innerHeight;
            const scrollY = window.scrollY;
            const max = root.scrollHeight - viewport;

            // 1-bosqich: faqat o'lchash. Yozish bilan aralashtirilsa brauzer har
            // o'qishda sahifani qayta hisoblaydi («layout thrash») — sahifa qotadi.
            const plans: { scene: HTMLElement; kind: string; value: number }[] = [];
            for (const scene of near) {
                const kind = scene.dataset.scene ?? "view";

                if (kind === "spy") {
                    // Ekran o'rtasidan biroz yuqori — ko'z odatda shu yerda turadi
                    const focus = viewport * 0.46;
                    let best = 0;
                    let distance = Infinity;
                    children(scene, "[data-spy-item]").forEach((item, index) => {
                        const rect = item.getBoundingClientRect();
                        const gap = Math.abs(rect.top + rect.height / 2 - focus);
                        if (gap < distance) {
                            distance = gap;
                            best = index;
                        }
                    });
                    plans.push({ scene, kind, value: best });
                    continue;
                }

                const rect = scene.getBoundingClientRect();
                const progress =
                    kind === "pin"
                        ? rect.height > viewport
                            ? clamp(-rect.top / (rect.height - viewport))
                            : 0
                        : clamp((viewport - rect.top) / (viewport + rect.height));
                plans.push({ scene, kind, value: progress });
            }

            // 2-bosqich: faqat yozish
            if (bar) bar.style.transform = `scaleX(${max > 0 ? clamp(scrollY / max) : 0})`;

            for (const { scene, kind, value } of plans) {
                if (kind === "spy") {
                    if (write(scene, "--active", String(value))) {
                        children(scene, "[data-spy-item]").forEach((item, index) =>
                            item.toggleAttribute("data-active", index === value),
                        );
                    }
                    continue;
                }

                const steps = Number(scene.dataset.steps);
                if (steps) {
                    // Qadamli bo'limga faqat `--step` kerak — `--p` yozilsa butun bo'lim
                    // stili har kadrda qayta hisoblanardi
                    const step = String(Math.min(steps - 1, Math.floor(value * steps)));
                    if (write(scene, "--step", step)) {
                        children(scene, "[data-step-item]").forEach((item, index) =>
                            item.toggleAttribute("data-active", String(index) === step),
                        );
                    }
                    continue;
                }

                write(scene, "--p", value.toFixed(3));
                const count = Number(scene.dataset.count);
                if (count) write(scene, "--idx", String(Math.round(value * (count - 1))));
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
