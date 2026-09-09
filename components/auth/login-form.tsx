"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";

import { Icon } from "@/components/icon";
import { cn } from "@/lib/cn";

type Mode = "telegram" | "password";

const CODE_LENGTH = 6;

export function LoginForm({ botUrl, next }: { botUrl: string; next: string }) {
    const router = useRouter();
    const [mode, setMode] = useState<Mode>("telegram");
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    async function submit(payload: Record<string, string>) {
        setBusy(true);
        setError(null);

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await response.json();

            if (!response.ok) {
                setError(data.detail ?? "Kirib bo'lmadi.");
                return;
            }

            // Rol hali tanlanmagan bo'lsa — avval shuni so'raymiz
            router.replace(data.needs_profile ? "/kirish/rol" : next);
            router.refresh();
        } catch {
            setError("Tarmoqda xatolik. Qayta urinib ko'ring.");
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="w-full">
            {/* Rejim tanlash */}
            <div className="relative mb-8 grid grid-cols-2 gap-1 rounded-full border border-line bg-surface p-1">
                {(
                    [
                        { key: "telegram", label: "Telegram orqali" },
                        { key: "password", label: "Login va parol" },
                    ] as const
                ).map((tab) => (
                    <button
                        key={tab.key}
                        type="button"
                        onClick={() => {
                            setMode(tab.key);
                            setError(null);
                        }}
                        className={cn(
                            "relative z-10 rounded-full px-4 py-2.5 text-[13.5px] font-semibold transition-colors duration-200",
                            mode === tab.key ? "text-text" : "text-muted hover:text-text",
                        )}
                    >
                        {mode === tab.key && (
                            <motion.span
                                layoutId="auth-tab"
                                className="absolute inset-0 -z-10 rounded-full bg-raised shadow-sm"
                                transition={{ type: "spring", stiffness: 400, damping: 34 }}
                            />
                        )}
                        {tab.label}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait" initial={false}>
                {mode === "telegram" ? (
                    <motion.div
                        key="telegram"
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 12 }}
                        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <TelegramPanel botUrl={botUrl} busy={busy} onSubmit={submit} />
                    </motion.div>
                ) : (
                    <motion.div
                        key="password"
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -12 }}
                        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <PasswordPanel busy={busy} onSubmit={submit} />
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {error && (
                    <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-5 flex items-start gap-2.5 rounded-xl bg-warn-soft px-4 py-3 text-[13.5px] text-warn-text"
                    >
                        <Icon name="alert" size={16} className="mt-0.5 shrink-0" />
                        {error}
                    </motion.p>
                )}
            </AnimatePresence>

            <p className="mt-8 border-t border-line pt-6 text-center text-[13.5px] text-muted">
                Hisobingiz yo&apos;qmi?{" "}
                <Link
                    href="/royxatdan-otish"
                    className="font-semibold text-accent-text hover:underline"
                >
                    Ro&apos;yxatdan o&apos;tish
                </Link>
            </p>
        </div>
    );
}

/* ------------------------------------------------------------------ */

function TelegramPanel({
    botUrl,
    busy,
    onSubmit,
}: {
    botUrl: string;
    busy: boolean;
    onSubmit: (payload: Record<string, string>) => void;
}) {
    const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
    const inputs = useRef<(HTMLInputElement | null)[]>([]);

    const code = digits.join("");
    const filled = code.length === CODE_LENGTH;

    function setDigit(index: number, value: string) {
        const clean = value.replace(/\D/g, "");
        if (!clean) {
            setDigits((prev) => prev.map((d, i) => (i === index ? "" : d)));
            return;
        }

        setDigits((prev) => {
            const next = [...prev];
            // Kodni to'liq nusxalab qo'yish ham ishlasin
            for (let i = 0; i < clean.length && index + i < CODE_LENGTH; i += 1) {
                next[index + i] = clean[i];
            }
            return next;
        });

        const nextIndex = Math.min(index + clean.length, CODE_LENGTH - 1);
        inputs.current[nextIndex]?.focus();
    }

    function onKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
        if (event.key === "Backspace" && !digits[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    }

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        if (filled) onSubmit({ mode: "telegram", code });
    }

    return (
        <form onSubmit={handleSubmit}>
            <a
                href={botUrl}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-4 rounded-2xl border border-line bg-raised p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent hover:shadow-md"
            >
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#2AABEE] text-white">
                    <Icon name="telegram" size={20} />
                </span>
                <span className="min-w-0 flex-1">
                    <span className="block text-[14.5px] font-semibold">
                        1. Botni oching va raqamingizni yuboring
                    </span>
                    <span className="mt-0.5 block text-[13px] text-muted">
                        Bot darhol 6 xonali kod beradi
                    </span>
                </span>
                <Icon
                    name="arrowRight"
                    size={18}
                    className="shrink-0 text-faint transition-transform duration-300 group-hover:translate-x-1"
                />
            </a>

            <div className="mt-6">
                <span className="block text-[14.5px] font-semibold">2. Kodni kiriting</span>

                <div className="mt-3 flex gap-2" dir="ltr">
                    {digits.map((digit, index) => (
                        <input
                            key={index}
                            ref={(element) => {
                                inputs.current[index] = element;
                            }}
                            value={digit}
                            onChange={(event) => setDigit(index, event.target.value)}
                            onKeyDown={(event) => onKeyDown(index, event)}
                            inputMode="numeric"
                            autoComplete={index === 0 ? "one-time-code" : "off"}
                            maxLength={CODE_LENGTH}
                            aria-label={`${index + 1}-raqam`}
                            className="h-14 w-full rounded-xl border border-line bg-page text-center text-xl font-semibold tabular-nums text-text transition-colors duration-200 focus:border-accent focus:outline-none"
                        />
                    ))}
                </div>
            </div>

            <SubmitButton busy={busy} disabled={!filled}>
                Kirish
            </SubmitButton>
        </form>
    );
}

/* ------------------------------------------------------------------ */

function PasswordPanel({
    busy,
    onSubmit,
}: {
    busy: boolean;
    onSubmit: (payload: Record<string, string>) => void;
}) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [visible, setVisible] = useState(false);

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        onSubmit({ mode: "password", email, password });
    }

    return (
        <form onSubmit={handleSubmit} className="grid gap-4">
            <p className="rounded-xl border border-line bg-surface px-4 py-3 text-[13px] leading-relaxed text-muted">
                Login va parol <strong>tashkilotlar va adminlarga</strong> beriladi.
                Oddiy foydalanuvchilar Telegram orqali kiradi.
            </p>

            <Field label="Login (email)">
                <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="username"
                    required
                    placeholder="tashkilot@mentadbirkor.uz"
                    className="h-12 w-full rounded-xl border border-line bg-page px-4 text-[15px] text-text transition-colors duration-200 placeholder:text-faint focus:border-accent focus:outline-none"
                />
            </Field>

            <Field label="Parol">
                <div className="relative">
                    <input
                        type={visible ? "text" : "password"}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        autoComplete="current-password"
                        required
                        className="h-12 w-full rounded-xl border border-line bg-page px-4 pr-12 text-[15px] text-text transition-colors duration-200 placeholder:text-faint focus:border-accent focus:outline-none"
                    />
                    <button
                        type="button"
                        onClick={() => setVisible((value) => !value)}
                        aria-label={visible ? "Parolni yashirish" : "Parolni ko'rsatish"}
                        className="absolute inset-y-0 right-0 grid w-12 place-items-center text-faint transition-colors hover:text-text"
                    >
                        <Icon name={visible ? "eyeOff" : "eye"} size={18} />
                    </button>
                </div>
            </Field>

            <SubmitButton busy={busy} disabled={!email || !password}>
                Kirish
            </SubmitButton>
        </form>
    );
}

/* ------------------------------------------------------------------ */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-text">{label}</span>
            {children}
        </label>
    );
}

function SubmitButton({
    busy,
    disabled,
    children,
}: {
    busy: boolean;
    disabled?: boolean;
    children: React.ReactNode;
}) {
    return (
        <button
            type="submit"
            disabled={busy || disabled}
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-invert py-3.5 text-[15px] font-semibold text-on-invert transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
            {busy ? (
                <>
                    <Spinner />
                    Tekshirilmoqda…
                </>
            ) : (
                <>
                    {children}
                    <Icon name="arrowRight" size={17} />
                </>
            )}
        </button>
    );
}

function Spinner() {
    return (
        <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
    );
}
