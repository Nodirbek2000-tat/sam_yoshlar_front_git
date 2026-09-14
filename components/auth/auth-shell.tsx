import Link from "next/link";
import type { ReactNode } from "react";

import { BrandLogo } from "@/components/brand-logo";
import { Icon } from "@/components/icon";

/**
 * Kirish va ro'yxatdan o'tish sahifalarining umumiy qobig'i:
 * chapda forma, o'ngda brend paneli. Telefonda o'ng panel yashiriladi.
 *
 * Rol tanlash va anketa bu qobiqni ishlatmaydi — ular kengroq joy talab
 * qiladi, shuning uchun o'z sahifasida chiziladi.
 */
export function AuthShell({
    children,
    points = [
        "Ovoz berish va taklif yozish",
        "Tadbirlarga bir bosishda yozilish",
        "Tashabbuslaringizni kuzatib borish",
    ],
}: {
    children: ReactNode;
    points?: string[];
}) {
    return (
        <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
            {/* Forma */}
            <div className="flex items-center justify-center px-5 py-14 sm:px-8">
                <div className="w-full max-w-md">{children}</div>
            </div>

            {/* Brend paneli — ikkala rejimda ham qorong'i, bu ataylab */}
            <aside className="relative hidden overflow-hidden bg-ink-950 lg:block">
                <div aria-hidden className="pointer-events-none absolute inset-0">
                    <div className="absolute -left-20 top-10 size-[30rem] rounded-full bg-brand-500/20 blur-[100px]" />
                    <div className="absolute bottom-0 right-0 size-[24rem] rounded-full bg-[#2AABEE]/15 blur-[100px]" />
                    <div
                        className="absolute inset-0 opacity-30"
                        style={{
                            backgroundImage:
                                "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 0)",
                            backgroundSize: "32px 32px",
                        }}
                    />
                </div>

                <div className="relative flex h-full flex-col justify-between p-12 text-white">
                    <Link href="/" aria-label="Bosh sahifa" className="inline-flex self-start">
                        {/* Panel ikkala rejimda ham to'q — logoning kechki nusxasi */}
                        <BrandLogo height={52} tone="dark" />
                    </Link>

                    <div className="max-w-sm">
                        <h2 className="text-3xl font-bold leading-tight text-white">
                            Ovozingiz ekranda
                            <br />
                            <span className="text-brand-300">jonlanadi</span>
                        </h2>
                        <p className="mt-4 text-[15px] leading-relaxed text-ink-400">
                            Har bir ovoz yo&apos;nalishning tirik ekotizimini o&apos;stiradi:
                            daraxt barg chiqaradi, shahar yonadi, neyronlar ulanadi.
                        </p>
                    </div>

                    <ul className="grid gap-3 text-[14px] text-ink-300">
                        {points.map((item) => (
                            <li key={item} className="flex items-center gap-2.5">
                                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-brand-600/25 text-brand-300">
                                    <Icon name="check" size={12} strokeWidth={2.4} />
                                </span>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </aside>
        </div>
    );
}
