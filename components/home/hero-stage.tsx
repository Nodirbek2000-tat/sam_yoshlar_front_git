"use client";

import { ArrowRight, ChevronDown } from "lucide-react";
import { Fragment, useRef, type CSSProperties, type PointerEvent, type ReactNode } from "react";

import { MagneticLink } from "@/components/home/interactive";

/**
 * Bosh sahifaning ochilish sahnasi.
 *
 * Kirishda: sarlavha harf-harf, gradient qator, matn, tugmalar va
 * o'ng tomonda yo'nalishlarning 3D rasmlari ketma-ket paydo bo'ladi.
 * Kursor yurganda rasmlar har xil chuqurlikda siljiydi, orqada yog'du
 * kursor ortidan yuradi. Pastga aylantirilganda sahna tarqalib ketadi.
 *
 * Hammasi CSS'da (`globals.css` → «Bosh sahifaning ochilishi»): animatsiya
 * JS kutmasdan birinchi kadrdan boshlanadi — sekin telefonda ham sarlavha
 * darhol chiqadi. Bu yerdagi JS faqat sichqoncha harakatini uzatadi.
 *
 * Har bir rasm uch qatlamli — har bir harakat o'z qatlamida, bir-birini
 * bosmasin:  aylantirish > sichqoncha > kirish (+ CSS suzish).
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

type Floater = {
    id: string;
    top: string;
    left: string;
    size: number;
    /** Chuqurlik: kattasi yaqinroq — tezroq siljiydi */
    depth: number;
    delay: number;
};

const FLOATERS: Floater[] = [
    { id: "ai", top: "7%", left: "40%", size: 190, depth: 1.25, delay: 0 },
    { id: "eco", top: "37%", left: "6%", size: 165, depth: 0.85, delay: 1.2 },
    { id: "fintech", top: "60%", left: "50%", size: 150, depth: 1.5, delay: 0.6 },
    { id: "energy", top: "3%", left: "4%", size: 108, depth: 0.55, delay: 2 },
    { id: "smartcity", top: "72%", left: "8%", size: 128, depth: 1.05, delay: 1.6 },
    { id: "startup", top: "33%", left: "74%", size: 112, depth: 1.8, delay: 0.9 },
];

/** Telefonda — sarlavha ostida kichik qator */
const MOBILE = ["ai", "eco", "fintech", "startup"];

export function HeroStage({ children }: { children?: ReactNode }) {
    // Sichqoncha: rasmlar chuqurlik bo'yicha siljiydi, yog'du kursor ortidan yuradi.
    // Kadrga bir marta — React qayta chizilmaydi, faqat CSS o'zgaruvchilari.
    const frame = useRef(0);

    function onPointerMove(event: PointerEvent<HTMLElement>) {
        if (event.pointerType !== "mouse") return;
        const section = event.currentTarget;
        const { clientX, clientY } = event;

        cancelAnimationFrame(frame.current);
        frame.current = requestAnimationFrame(() => {
            const rect = section.getBoundingClientRect();
            const nx = (clientX - rect.left) / rect.width - 0.5;
            const ny = (clientY - rect.top) / rect.height - 0.5;

            section.style.setProperty("--mx", `${clientX - rect.left}px`);
            section.style.setProperty("--my", `${clientY - rect.top}px`);

            for (const element of section.querySelectorAll<HTMLElement>("[data-mouse]")) {
                const depth = Number(element.dataset.mouse) || 1;
                element.style.setProperty("--mouse-x", `${nx * 56 * depth}px`);
                element.style.setProperty("--mouse-y", `${ny * 40 * depth}px`);
            }
        });
    }

    return (
        <section
            onPointerMove={onPointerMove}
            className="relative overflow-hidden border-b border-line"
        >
            {/* ---------- Fon ---------- */}
            <div aria-hidden className="pointer-events-none absolute inset-0">
                <div className="aurora" />
                <div className="blob -left-40 -top-40 size-[34rem] bg-[color-mix(in_oklab,var(--accent)_22%,transparent)]" />
                <div
                    className="blob right-[-10rem] top-10 size-[30rem] bg-[oklch(65%_0.14_255/0.16)]"
                    style={{ animationDelay: "-6s" }}
                />
                <div
                    className="blob bottom-[-12rem] left-1/3 size-[28rem] bg-[oklch(70%_0.14_300/0.12)]"
                    style={{ animationDelay: "-11s" }}
                />
                <div className="grid-lines absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000,transparent)]" />
                {/* Kursor ortidan yuruvchi yog'du */}
                <div className="absolute inset-0 bg-[radial-gradient(560px_circle_at_var(--mx,70%)_var(--my,30%),color-mix(in_oklab,var(--accent)_13%,transparent),transparent_60%)]" />
            </div>

            {/* ---------- 3D rasmlar (1280px dan) ---------- */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-y-0 right-0 hidden w-[40%] xl:block"
            >
                {/* Orqadagi aylanuvchi halqa */}
                <div className="absolute left-1/2 top-1/2 size-[24rem] -translate-x-1/2 -translate-y-1/2">
                    <div className="size-full animate-[spin_40s_linear_infinite] rounded-full bg-[conic-gradient(from_0deg,transparent,color-mix(in_oklab,var(--accent)_35%,transparent),transparent_40%,oklch(65%_0.14_255/0.3),transparent_75%)] opacity-60 blur-2xl" />
                </div>

                {FLOATERS.map((item, index) => (
                    <div
                        key={item.id}
                        data-floater
                        className="absolute"
                        style={
                            {
                                top: item.top,
                                left: item.left,
                                width: item.size,
                                height: item.size,
                                "--depth": item.depth,
                            } as Vars
                        }
                    >
                        <div data-mouse={item.depth} className="size-full">
                            <div data-pop className="size-full" style={{ "--i": index } as Vars}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={`/yonalish/sm/${item.id}.webp`}
                                    alt=""
                                    width={item.size}
                                    height={item.size}
                                    className="float-slow size-full object-contain drop-shadow-[0_24px_40px_rgba(0,0,0,0.28)]"
                                    style={{ animationDelay: `-${item.delay}s` }}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ---------- Matn ---------- */}
            <div className="container-page relative py-16 md:py-24 lg:py-28">
                <div data-hero-content className="max-w-3xl">
                    {/* Rasmlar o'ng tomonda turgan ekranlarda shrift biroz kichrayadi — sarlavha 2 qatorda qolsin */}
                    <h1 className="text-[2.75rem] font-semibold leading-[1.05] tracking-[-0.03em] sm:text-6xl md:text-7xl lg:text-[3.5rem] xl:text-[4rem]">
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
                        className="mt-7 max-w-xl text-[17px] leading-relaxed text-text"
                        style={{ "--d": "1.28s" } as Vars}
                    >
                        Yoshlarni birlashtiruvchi, qo&apos;llab-quvvatlovchi va rivojlantirishga
                        xizmat qiluvchi yagona axborot platformasi.
                    </p>

                    <p
                        data-intro="lead"
                        className="mt-3 max-w-lg text-[15px] leading-relaxed text-muted"
                        style={{ "--d": "1.4s" } as Vars}
                    >
                        Muammoni ayting, g&apos;oyani bildiring, ovoz bering. Har bir ovoz
                        yo&apos;nalishning tirik ekotizimini bir qadam o&apos;stiradi.
                    </p>

                    <div data-intro="actions" className="mt-10 flex flex-wrap items-center gap-3">
                        <MagneticLink
                            href="/tashabbuslar"
                            className="glow-ring group inline-flex items-center gap-2 rounded-full bg-invert px-6 py-3 text-[14.5px] font-medium text-on-invert"
                        >
                            Tashabbuslarni ko&apos;rish
                            <ArrowRight
                                className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                                strokeWidth={2}
                            />
                        </MagneticLink>

                        <MagneticLink
                            href="/royxatdan-otish"
                            className="inline-flex items-center gap-2 rounded-full border border-line bg-page/60 px-6 py-3 text-[14.5px] font-medium text-text backdrop-blur transition-colors hover:border-accent hover:text-accent"
                        >
                            Ro&apos;yxatdan o&apos;tish
                        </MagneticLink>
                    </div>

                    {/* Telefonda — rasmlar sarlavha ostida */}
                    <div
                        data-intro="lead"
                        className="mt-10 flex gap-3 xl:hidden"
                        style={{ "--d": "1.52s" } as Vars}
                        aria-hidden
                    >
                        {MOBILE.map((id, index) => (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                key={id}
                                src={`/yonalish/sm/${id}.webp`}
                                alt=""
                                width={72}
                                height={72}
                                className="float-slow size-16 object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.25)] sm:size-20"
                                style={{ animationDelay: `-${index * 1.3}s` }}
                            />
                        ))}
                    </div>

                    <div
                        data-intro="cue"
                        className="mt-14 hidden items-center gap-2.5 text-[12px] text-faint md:flex"
                    >
                        <span className="relative flex h-8 w-5 justify-center rounded-full border border-line">
                            <span className="scroll-wheel mt-1.5 h-1.5 w-1 rounded-full bg-accent" />
                        </span>
                        Pastga aylantiring
                        <ChevronDown className="size-3.5 animate-bounce" />
                    </div>
                </div>
            </div>

            {/* Raqamlar qatori — server tomonda chiziladi */}
            {children}
        </section>
    );
}
