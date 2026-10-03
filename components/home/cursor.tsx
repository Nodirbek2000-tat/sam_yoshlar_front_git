"use client";

import { useEffect, useRef } from "react";

/**
 * Bosh sahifadagi kursor halqasi — sichqoncha ortidan yumshoq yuradi,
 * havola yoki tugma ustida kengayadi. Oddiy kursor o'z joyida qoladi.
 *
 * Faqat sichqonchali qurilmalarda; React qayta chizilmaydi — bitta element,
 * kadrga bir marta `transform`.
 */
export function CursorRing() {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ring = ref.current;
        if (!ring) return;
        if (!window.matchMedia("(pointer: fine)").matches) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        let targetX = -100;
        let targetY = -100;
        let x = targetX;
        let y = targetY;
        let frame = 0;
        let shown = false;

        function tick() {
            x += (targetX - x) * 0.22;
            y += (targetY - y) * 0.22;
            ring!.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
            // Joyiga yetgach to'xtaydi — bekor kadr yo'q
            frame = Math.abs(targetX - x) + Math.abs(targetY - y) > 0.2 ? requestAnimationFrame(tick) : 0;
        }

        function onMove(event: PointerEvent) {
            if (event.pointerType !== "mouse") return;
            targetX = event.clientX;
            targetY = event.clientY;
            if (!shown) {
                shown = true;
                x = targetX;
                y = targetY;
                ring!.classList.add("is-on");
            }
            const over = (event.target as Element | null)?.closest("a, button, [role=button], input, textarea, select");
            ring!.classList.toggle("is-hover", Boolean(over));
            if (!frame) frame = requestAnimationFrame(tick);
        }

        function onLeave() {
            shown = false;
            ring!.classList.remove("is-on", "is-hover");
        }

        function onDown() {
            ring!.classList.add("is-down");
        }

        function onUp() {
            ring!.classList.remove("is-down");
        }

        window.addEventListener("pointermove", onMove, { passive: true });
        window.addEventListener("pointerdown", onDown, { passive: true });
        window.addEventListener("pointerup", onUp, { passive: true });
        document.documentElement.addEventListener("mouseleave", onLeave);

        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerdown", onDown);
            window.removeEventListener("pointerup", onUp);
            document.documentElement.removeEventListener("mouseleave", onLeave);
        };
    }, []);

    return <div ref={ref} aria-hidden className="lp-cursor" />;
}
