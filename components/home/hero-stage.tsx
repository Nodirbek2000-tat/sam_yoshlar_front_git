"use client";

import { ArrowRight } from "lucide-react";
import { Fragment, useRef, type CSSProperties, type PointerEvent, type ReactNode } from "react";

import { MagneticLink } from "@/components/home/interactive";
import { ParticleField } from "@/components/home/particle-field";

/**
 * Bosh sahifaning ochilish sahnasi.
 *
 * Chapda — sarlavha harf-harf chiqadi, o'ngda — nuqtalardan yig'iladigan
 * Registon: sahifa ochilganda sochilgan nuqtalar shaklga keladi, sichqoncha
 * yaqinlashsa tarqaladi. Orqada yog'du kursor ortidan yuradi.
 *
 * Matn animatsiyasi CSS'da (`globals.css` → «Bosh sahifaning ochilishi»):
 * JS kutmasdan birinchi kadrdan boshlanadi — sekin telefonda ham sarlavha
 * darhol chiqadi.
 */

type Vars = CSSProperties & Record<`--${string}`, string | number>;

/** Sarlavhani harflarga bo'ladi: har bir so'z niqob ichida, harflar navbat bilan chiqadi. */
function SplitChars({ text }: { text: string }) {
    let index = 0;
    const words = text.split(" ");

    return words.map((word, wordIndex) => (
        <Fragment key={wordIndex}>
            <span className="fx-mask">
                {Array.from(word).map((char) => (
                    <span key={index} className="hero-char" style={{ "--c": index++ } as Vars}>
                        {char}
                    </span>
                ))}
            </span>
            {wordIndex < words.length - 1 && " "}
        </Fragment>
    ));
}

export function HeroStage({ children }: { children?: ReactNode }) {
    // Yog'du kursor ortidan yuradi — kadrga bir marta, React qayta chizilmaydi
    const frame = useRef(0);

    function onPointerMove(event: PointerEvent<HTMLElement>) {
        if (event.pointerType !== "mouse") return;
        const section = event.currentTarget;
        const { clientX, clientY } = event;

        cancelAnimationFrame(frame.current);
        frame.current = requestAnimationFrame(() => {
            const rect = section.getBoundingClientRect();
            section.style.setProperty("--mx", `${clientX - rect.left}px`);
            section.style.setProperty("--my", `${clientY - rect.top}px`);
        });
    }

    return (
        <section
            onPointerMove={onPointerMove}
            className="relative flex min-h-[calc(100svh-3.75rem)] flex-col overflow-hidden border-b border-line"
        >
            {/* ---------- Fon ---------- */}
            <div aria-hidden className="pointer-events-none absolute inset-0">
                <div className="aurora" />
                <div className="lp-dots absolute inset-0 [mask-image:radial-gradient(ellipse_75%_70%_at_20%_100%,#000,transparent)]" />
                <div className="grid-lines absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000,transparent)]" />
                {/* Kursor ortidan yuruvchi yog'du */}
                <div className="absolute inset-0 bg-[radial-gradient(560px_circle_at_var(--mx,72%)_var(--my,34%),color-mix(in_oklab,var(--accent)_12%,transparent),transparent_60%)]" />
            </div>

            <div className="container-page relative grid flex-1 items-center gap-6 py-12 md:py-16 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] xl:gap-8 xl:py-10">
                {/* ---------- Matn ---------- */}
                <div data-hero-content className="max-w-3xl">
                    <h1 className="text-[2.9rem] font-semibold leading-[1.02] tracking-[-0.035em] sm:text-6xl md:text-7xl xl:text-[3.75rem]">
                        <span data-intro className="block">
                            <SplitChars text="Yoshlar tashabbusi" />
                        </span>
                        {/* Gradient qator bo'linmaydi — butunligicha niqob ichidan chiqadi */}
                        <span data-intro className="block overflow-hidden pb-2">
                            <span data-gradient className="text-shimmer block">
                                kuchga aylanadigan joy
                            </span>
                        </span>
                    </h1>

                    <p
                        data-intro="lead"
                        className="mt-7 max-w-xl text-[17px] leading-relaxed text-text md:text-[18px]"
                        style={{ "--d": "1.28s" } as Vars}
                    >
                        Muammoni ayting, g&apos;oyani bildiring, ovoz bering. Yoshlarni birlashtiruvchi,
                        qo&apos;llab-quvvatlovchi va rivojlantirishga xizmat qiluvchi yagona maydon.
                    </p>

                    <div data-intro="actions" className="mt-10 flex flex-wrap items-center gap-3">
                        <MagneticLink
                            href="/tashabbuslar"
                            className="glow-ring group inline-flex items-center gap-2 rounded-full bg-invert px-6 py-3.5 text-[14.5px] font-medium text-on-invert"
                        >
                            Tashabbuslarni ko&apos;rish
                            <ArrowRight
                                className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                                strokeWidth={2}
                            />
                        </MagneticLink>

                        <MagneticLink
                            href="/royxatdan-otish"
                            className="inline-flex items-center gap-2 rounded-full border border-line bg-page/60 px-6 py-3.5 text-[14.5px] font-medium text-text backdrop-blur transition-colors hover:border-accent hover:text-accent"
                        >
                            Ro&apos;yxatdan o&apos;tish
                        </MagneticLink>
                    </div>

                </div>

                {/* ---------- Nuqtalardan Registon ---------- */}
                {/* `data-hero-art` — sahifadan chiqib ketayotganda CSS'da kattalashib so'nadi */}
                <div data-hero-art aria-hidden className="relative mx-auto aspect-square w-full max-w-[22rem] sm:max-w-[28rem] xl:max-w-none">
                    {/* Orqadagi aylanuvchi halqalar */}
                    <span className="lp-orbit absolute inset-[6%] rounded-full border border-dashed border-line" />
                    <span className="lp-orbit lp-orbit-slow absolute inset-[-4%] rounded-full border border-line-soft" />

                    <ParticleField shapes={["dome"]} interactive className="absolute inset-0 size-full" />

                    <p className="absolute inset-x-0 -bottom-1 flex items-center justify-center gap-3 text-[10.5px] font-medium uppercase tracking-[0.18em] text-faint">
                        <span className="h-px w-8 bg-line" />
                        Registon · 39.65° N, 66.98° E
                        <span className="h-px w-8 bg-line" />
                    </p>
                </div>
            </div>

            {/* Raqamlar qatori — server tomonda chiziladi */}
            {children}
        </section>
    );
}
