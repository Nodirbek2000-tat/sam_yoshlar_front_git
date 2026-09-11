import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { apiFetch } from "@/lib/api";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = {
    title: "Ro'yxatdan o'tish",
    description:
        "Telegram bot orqali bir daqiqada ro'yxatdan o'ting — parol o'ylab topish shart emas.",
};

const FALLBACK_BOT = "https://t.me/yoshtadbirkorlarbot";

/**
 * Ro'yxatdan o'tish — kirish sahifasining Telegram qismining o'zi.
 *
 * Yangi foydalanuvchi uchun alohida yo'l yo'q: bot kod beradi, kod bilan
 * kiradi, keyin rol va anketa so'raladi. Shuning uchun bu yerda faqat
 * Telegram usuli turadi — login va parol tashkilotlarga beriladi.
 */
export default async function RegisterPage() {
    const user = await getCurrentUser();
    if (user) redirect(user.onboarding ? "/kirish/rol" : "/kabinet");

    let botUrl = FALLBACK_BOT;
    try {
        const info = await apiFetch<{ bot_url: string }>("/auth/info/", { revalidate: 3600 });
        botUrl = info.bot_url;
    } catch {
        // Backend javob bermasa ham sahifa ochilaversin
    }

    return (
        <AuthShell
            points={[
                "Parol o'ylab topish shart emas",
                "Bir daqiqada — bot kod beradi",
                "Yosh, tadbirkor yoki startupper sifatida",
            ]}
        >
            <h1 className="text-3xl font-bold">Ro&apos;yxatdan o&apos;tish</h1>
            <p className="mt-2 mb-8 text-[15px] text-muted">
                Botga raqamingizni ulashing — u 6 xonali kod beradi. Kodni shu yerga
                kiriting, hisobingiz tayyor.
            </p>

            <LoginForm botUrl={botUrl} next="/kabinet" telegramOnly />
        </AuthShell>
    );
}
