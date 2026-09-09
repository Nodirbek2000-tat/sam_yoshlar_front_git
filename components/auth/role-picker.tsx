"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Icon, type IconName } from "@/components/icon";
import { ProfileStep } from "@/components/auth/profile-step";
import { cn } from "@/lib/cn";
import type { Tone } from "@/lib/tone";
import type { Choice } from "@/lib/types";

/**
 * Ro'yxatdan o'tgandan keyingi birinchi savol: kim sifatida qatnashasiz?
 *
 * Tanlovga qarab hisobga status beriladi. Tashkilot va admin bu ro'yxatda
 * yo'q — ular uchun login-parolni biz o'zimiz beramiz.
 */
const ROLE_META: Record<string, { icon: IconName; hint: string; tone: Tone }> = {
    yosh: {
        icon: "spark",
        hint: "O'qiyapman yoki endi yo'l boshlayapman",
        tone: "blue",
    },
    entrepreneur: {
        icon: "briefcase",
        hint: "Biznesim bor yoki boshlamoqchiman",
        tone: "amber",
    },
    startupper: {
        icon: "rocket",
        hint: "Innovatsion g'oya va startap ustida ishlayman",
        tone: "violet",
    },
    organization: {
        icon: "building",
        hint: "Tashkilot nomidan muammo kiritaman",
        tone: "emerald",
    },
};

export function RolePicker({
    roles,
    regions,
    fullName,
    startupSpheres,
    startupStages,
    businessSpheres,
}: {
    roles: Choice[];
    regions: Choice[];
    fullName: string;
    startupSpheres: Choice[];
    startupStages: Choice[];
    businessSpheres: Choice[];
}) {
    const router = useRouter();
    const [role, setRole] = useState<string | null>(null);
    const [region, setRegion] = useState("");
    const [name, setName] = useState(fullName);
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    /** Rol saqlangach ikkinchi qadamga o'tamiz — startap yoki biznes haqida */
    const [step, setStep] = useState<"role" | "profile">("role");

    async function save() {
        if (!role) return;
        setBusy(true);
        setError(null);

        try {
            const response = await fetch("/api/auth/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role, region, full_name: name }),
            });
            const data = await response.json();

            if (!response.ok) {
                setError(data.detail ?? "Saqlab bo'lmadi.");
                return;
            }

            // Startupper va tadbirkordan yana bir savol bor
            if (role === "startupper" || role === "entrepreneur") {
                setStep("profile");
                return;
            }

            router.replace("/kabinet");
            router.refresh();
        } catch {
            setError("Tarmoqda xatolik. Qayta urinib ko'ring.");
        } finally {
            setBusy(false);
        }
    }

    if (step === "profile" && (role === "startupper" || role === "entrepreneur")) {
        return (
            <ProfileStep
                role={role}
                spheres={role === "startupper" ? startupSpheres : businessSpheres}
                stages={startupStages}
                onDone={() => setStep("role")}
            />
        );
    }

    return (
        <div>
            <div className="mb-7">
                <span className="text-[12px] font-medium uppercase tracking-[0.1em] text-accent">
                    1-qadam
                </span>
                <h1 className="mt-2.5 text-3xl font-semibold tracking-tight">
                    Kim sifatida qatnashasiz?
                </h1>
                <p className="mt-2.5 text-[14.5px] leading-relaxed text-muted">
                    Bu tanlov hisobingizga status beradi va sizga mos bo&apos;limlarni ochadi.
                    Startupper va tadbirkordan yana bitta savol so&apos;raladi.
                </p>
            </div>

            <div className="grid gap-2.5">
                {roles.map((item, index) => {
                    const meta = ROLE_META[item.value] ?? {
                        icon: "user" as IconName,
                        hint: "",
                        tone: "slate" as Tone,
                    };
                    const active = role === item.value;

                    return (
                        <motion.button
                            key={item.value}
                            type="button"
                            onClick={() => setRole(item.value)}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.06, duration: 0.4 }}
                            className={cn(
                                `tone-${meta.tone}`,
                                "flex items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-200",
                                active
                                    ? "border-tone-line bg-tone-soft"
                                    : "border-line bg-raised hover:border-tone-line hover:bg-tone-soft",
                            )}
                        >
                            <span
                                className={cn(
                                    "grid size-11 shrink-0 place-items-center rounded-xl transition-colors duration-200",
                                    active ? "bg-tone text-page" : "bg-tone-soft text-tone-text",
                                )}
                            >
                                <Icon name={meta.icon} size={21} strokeWidth={1.6} />
                            </span>

                            <span className="min-w-0 flex-1">
                                <span className="block text-[15px] font-semibold">
                                    {item.label}
                                </span>
                                <span className="mt-0.5 block text-[13px] text-muted">
                                    {meta.hint}
                                </span>
                            </span>

                            <span
                                className={cn(
                                    "grid size-5 shrink-0 place-items-center rounded-full border transition-all duration-200",
                                    active ? "border-tone bg-tone text-page" : "border-line",
                                )}
                            >
                                {active && <Icon name="check" size={12} strokeWidth={3} />}
                            </span>
                        </motion.button>
                    );
                })}
            </div>

            <AnimatePresence>
                {role && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                    >
                        <div className="grid gap-4 pt-6">
                            <Field label="F.I.O.">
                                <input
                                    value={name}
                                    onChange={(event) => setName(event.target.value)}
                                    placeholder="Familiya Ism"
                                    className="h-12 w-full rounded-xl border border-line bg-page px-4 text-[15px] outline-none transition-colors placeholder:text-faint focus:border-accent"
                                />
                            </Field>

                            <Field label="Hudud">
                                <select
                                    value={region}
                                    onChange={(event) => setRegion(event.target.value)}
                                    className="h-12 w-full rounded-xl border border-line bg-page px-4 text-[15px] outline-none transition-colors focus:border-accent"
                                >
                                    <option value="">Tanlang</option>
                                    {regions.map((item) => (
                                        <option key={item.value} value={item.value}>
                                            {item.label}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {error && (
                <p className="mt-5 flex items-start gap-2.5 rounded-xl bg-warn-soft px-4 py-3 text-[13.5px] text-warn-text">
                    <Icon name="alert" size={16} className="mt-0.5 shrink-0" />
                    {error}
                </p>
            )}

            <button
                type="button"
                onClick={save}
                disabled={!role || busy}
                className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-invert py-3.5 text-[15px] font-semibold text-on-invert transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
                {busy ? (
                    <>
                        <span className="size-4 animate-spin rounded-full border-2 border-current/30 border-t-current" />
                        Saqlanmoqda…
                    </>
                ) : (
                    <>
                        {role === "startupper" || role === "entrepreneur"
                            ? "Keyingi qadam"
                            : "Davom etish"}
                        <Icon name="arrowRight" size={17} />
                    </>
                )}
            </button>
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-muted">{label}</span>
            {children}
        </label>
    );
}
