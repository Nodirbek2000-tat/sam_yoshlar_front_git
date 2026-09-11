import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { apiFetch } from "@/lib/api";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = {
    title: "Kirish",
    description: "Telegram orqali yoki login va parol bilan tizimga kiring.",
};

const FALLBACK_BOT = "https://t.me/yoshtadbirkorlarbot";

export default async function LoginPage({ searchParams }: PageProps<"/kirish">) {
    const user = await getCurrentUser();
    const params = await searchParams;

    const nextParam = params?.next;
    const next = typeof nextParam === "string" && nextParam.startsWith("/") ? nextParam : "/kabinet";

    // Kirgan, lekin ro'yxatdan o'tishni tugatmagan — o'sha qadamga
    if (user) redirect(user.onboarding ? "/kirish/rol" : next);

    let botUrl = FALLBACK_BOT;
    try {
        const info = await apiFetch<{ bot_url: string }>("/auth/info/", { revalidate: 3600 });
        botUrl = info.bot_url;
    } catch {
        // Backend javob bermasa ham sahifa ochilaversin
    }

    return (
        <AuthShell>
            <h1 className="text-3xl font-bold">Xush kelibsiz</h1>
            <p className="mt-2 mb-8 text-[15px] text-muted">
                Ovoz berish, taklif yozish va tadbirlarga yozilish uchun tizimga kiring.
            </p>

            <LoginForm botUrl={botUrl} next={next} />
        </AuthShell>
    );
}
