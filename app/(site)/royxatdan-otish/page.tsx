import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Icon, type IconName } from "@/components/icon";
import { Reveal, Stagger, StaggerItem } from "@/components/motion-primitives";
import { apiFetch } from "@/lib/api";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = {
    title: "Ro'yxatdan o'tish",
    description:
        "Telegram bot orqali bir daqiqada ro'yxatdan o'ting — parol o'ylab topish shart emas.",
};

const FALLBACK_BOT = "https://t.me/yoshtadbirkorlarbot";

const STEPS: { icon: IconName; title: string; text: string }[] = [
    {
        icon: "send",
        title: "Botni oching",
        text: "Quyidagi tugma sizni to'g'ridan-to'g'ri botga olib boradi.",
    },
    {
        icon: "phone",
        title: "Raqamingizni ulashing",
        text: "Bot bitta tugma chiqaradi — bosasiz, tamom. Ism va rasm o'zi olinadi.",
    },
    {
        icon: "lock",
        title: "Kodni kiriting",
        text: "Bot 6 xonali kod beradi. Uni kirish sahifasiga kiritasiz — hisobingiz tayyor.",
    },
    {
        icon: "user",
        title: "Statusingizni tanlang",
        text: "Yosh, tadbirkor yoki startupper — bittasini bosasiz va hisobingizga status beriladi.",
    },
];

export default async function RegisterPage() {
    if (await getCurrentUser()) redirect("/kabinet");

    let botUrl = FALLBACK_BOT;
    try {
        const info = await apiFetch<{ bot_url: string }>("/auth/info/", { revalidate: 3600 });
        botUrl = info.bot_url;
    } catch {
        // Backend javob bermasa ham sahifa ochilaversin
    }

    return (
        <section className="relative overflow-hidden bg-ink-950 text-white">
            <div aria-hidden className="pointer-events-none absolute inset-0">
                <div className="absolute -left-24 -top-10 size-[32rem] rounded-full bg-brand-500/20 blur-[110px]" />
                <div className="absolute -right-20 bottom-0 size-[26rem] rounded-full bg-[#2AABEE]/15 blur-[110px]" />
                <div
                    className="absolute inset-0 opacity-30"
                    style={{
                        backgroundImage:
                            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 0)",
                        backgroundSize: "32px 32px",
                    }}
                />
            </div>

            <div className="container-page relative flex min-h-[calc(100vh-4rem)] flex-col justify-center py-14">
                <Reveal className="mx-auto max-w-xl text-center">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[12px] font-medium uppercase tracking-[0.1em] text-brand-200 backdrop-blur">
                        <Icon name="spark" size={13} />
                        Bir daqiqada
                    </span>

                    <h1 className="mt-6 text-4xl font-bold leading-tight text-white sm:text-5xl">
                        Ro&apos;yxatdan o&apos;tish{" "}
                        <span className="text-brand-300">Telegram orqali</span>
                    </h1>

                    <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-ink-300">
                        Parol o&apos;ylab topish, email tasdiqlash — hech biri kerak emas.
                        Botga raqamingizni ulashasiz, u kod beradi, tamom.
                    </p>

                    <a
                        href={botUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="group mt-9 inline-flex items-center gap-3 rounded-full bg-[#2AABEE] px-8 py-4 text-[15.5px] font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#1e9bd8] hover:shadow-[0_16px_40px_-12px_rgba(42,171,238,0.7)]"
                    >
                        <Icon name="telegram" size={20} />
                        Botni ochish
                        <Icon
                            name="arrowRight"
                            size={17}
                            className="transition-transform duration-300 group-hover:translate-x-1"
                        />
                    </a>

                    <p className="mt-4 text-[13px] text-ink-500">
                        Bot: <span className="text-ink-300">{botUrl.replace("https://", "")}</span>
                    </p>
                </Reveal>

                <Stagger className="mx-auto mt-14 grid w-full max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {STEPS.map((step, index) => (
                        <StaggerItem
                            key={step.title}
                            className="relative rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm"
                        >
                            <span className="absolute right-5 top-5 text-3xl font-bold tabular-nums text-white/8">
                                {index + 1}
                            </span>
                            <span className="grid size-11 place-items-center rounded-xl bg-brand-600/20 text-brand-300">
                                <Icon name={step.icon} size={20} strokeWidth={1.6} />
                            </span>
                            <h2 className="mt-4 text-[16px] font-semibold text-white">
                                {step.title}
                            </h2>
                            <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-400">
                                {step.text}
                            </p>
                        </StaggerItem>
                    ))}
                </Stagger>

                <Reveal className="mx-auto mt-12 text-center" delay={0.2}>
                    <p className="text-[14px] text-ink-400">
                        Kod allaqachon bormi?{" "}
                        <Link href="/kirish" className="font-semibold text-brand-300 hover:underline">
                            Kirish sahifasiga o&apos;tish
                        </Link>
                    </p>
                    <p className="mt-2 text-[13px] text-ink-500">
                        Tashkilot yoki adminmisiz? Sizga login va parol beriladi —{" "}
                        <Link href="/kirish" className="text-ink-300 hover:underline">
                            shu yerdan kiring
                        </Link>
                        .
                    </p>
                </Reveal>
            </div>
        </section>
    );
}
