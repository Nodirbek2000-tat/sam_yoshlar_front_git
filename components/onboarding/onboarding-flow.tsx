"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { CategoryTile } from "@/components/category-tile";
import { Icon } from "@/components/icon";
import { BusinessForm } from "@/components/onboarding/business-form";
import { INPUT } from "@/components/onboarding/form-kit";
import { StartupForm } from "@/components/onboarding/startup-form";
import { cn } from "@/lib/cn";
import type { BusinessProfile, Choice, StartupProfile } from "@/lib/types";

/**
 * Ro'yxatdan o'tishning davomi: kim siz → anketa → kabinet.
 *
 * Qaysi qadamdan boshlashni server aytadi (`user.onboarding`): rol
 * tanlangan-u anketa to'ldirilmagan bo'lsa, to'g'ri ikkinchi qadam
 * ochiladi. «Keyinroq» tugmasi yo'q — anketasiz kabinet ochilmaydi.
 */

type Step = "role" | "profile";

const ROLE_META: Record<string, { slug: string; hint: string; opens: string[]; tone: string }> = {
    yosh: {
        slug: "ic-graduation",
        hint: "O'qiyapman yoki endi yo'l boshlayapman",
        opens: ["Tashabbus bildirish", "Ovoz berish", "Tadbirlarga yozilish"],
        tone: "indigo",
    },
    entrepreneur: {
        slug: "ic-briefcase",
        hint: "Biznesim bor yoki boshlamoqchiman",
        opens: ["Biznes profili va rasmlar", "Hamkorlar ro'yxatiga kirish", "Grant va kreditlar"],
        tone: "amber",
    },
    startupper: {
        slug: "ic-rocket",
        hint: "Innovatsion g'oya ustida ishlayman",
        opens: ["Startap anketasi", "Investorlarga ko'rinish", "Pitch yuklash"],
        tone: "orange",
    },
};

export function OnboardingFlow({
    initialStep,
    initialRole,
    roles,
    regions,
    fullName,
    userRegion,
    startupSpheres,
    startupStages,
    businessSpheres,
    business = null,
    startup = null,
}: {
    initialStep: Step;
    initialRole: string | null;
    roles: Choice[];
    regions: Choice[];
    fullName: string;
    userRegion: string;
    startupSpheres: Choice[];
    startupStages: Choice[];
    businessSpheres: Choice[];
    /** Yarim saqlangan anketa (masalan, rasm yuklanmay qolgan) — qaytadan yozmasin */
    business?: BusinessProfile | null;
    startup?: StartupProfile | null;
}) {
    const router = useRouter();
    const [step, setStep] = useState<Step>(initialStep);
    const [role, setRole] = useState<string | null>(initialRole);
    const [name, setName] = useState(fullName);
    const [region, setRegion] = useState(userRegion);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const needsProfile = role === "entrepreneur" || role === "startupper";

    async function saveRole() {
        if (!role || busy) return;
        if (!name.trim()) {
            setError("Ismingizni yozing.");
            return;
        }

        setBusy(true);
        setError(null);

        try {
            const response = await fetch("/api/auth/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role, region, full_name: name.trim() }),
            });
            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                setError(data.detail ?? "Saqlab bo'lmadi.");
                return;
            }

            if (needsProfile) {
                setStep("profile");
                window.scrollTo({ top: 0, behavior: "smooth" });
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

    function finish() {
        router.replace("/kabinet");
        router.refresh();
    }

    const steps = needsProfile
        ? ["Kim siz?", role === "startupper" ? "Startap" : "Biznes", "Tayyor"]
        : ["Kim siz?", "Tayyor"];
    const current = step === "role" ? 0 : 1;

    return (
        <div>
            {/* Qadamlar */}
            <ol className="mb-10 flex items-center gap-2">
                {steps.map((label, index) => (
                    <li key={label} className="flex items-center gap-2">
                        <span
                            className={cn(
                                "grid size-7 place-items-center rounded-full text-[12px] font-semibold tabular-nums transition-colors duration-300",
                                index < current && "bg-accent text-white",
                                index === current && "bg-invert text-on-invert",
                                index > current && "border border-line text-faint",
                            )}
                        >
                            {index < current ? <Icon name="check" size={13} strokeWidth={3} /> : index + 1}
                        </span>
                        <span
                            className={cn(
                                "text-[13px]",
                                index === current ? "font-semibold text-text" : "text-muted",
                            )}
                        >
                            {label}
                        </span>
                        {index < steps.length - 1 && (
                            <span
                                className={cn(
                                    "mx-1 h-px w-8 sm:w-14",
                                    index < current ? "bg-accent" : "bg-line",
                                )}
                            />
                        )}
                    </li>
                ))}
            </ol>

            <AnimatePresence mode="wait">
                {step === "role" ? (
                    <motion.div
                        key="role"
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -16 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                            Kim sifatida qatnashasiz?
                        </h1>
                        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted">
                            Bu tanlov hisobingizga status beradi va sizga mos bo&apos;limlarni
                            ochadi. Tadbirkor va startupperdan qisqa anketa so&apos;raladi.
                        </p>

                        <div className="mt-8 grid gap-3 md:grid-cols-3">
                            {roles.map((item, index) => {
                                const meta = ROLE_META[item.value];
                                if (!meta) return null;
                                const active = role === item.value;

                                return (
                                    <motion.button
                                        key={item.value}
                                        type="button"
                                        onClick={() => {
                                            setRole(item.value);
                                            setError(null);
                                        }}
                                        initial={{ opacity: 0, y: 14 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.07, duration: 0.4 }}
                                        className={cn(
                                            `tone-${meta.tone}`,
                                            "group relative flex flex-col rounded-2xl border p-5 text-left transition-all duration-200",
                                            active
                                                ? "border-tone bg-tone-soft shadow-[0_12px_32px_-18px_var(--tone)]"
                                                : "border-line bg-raised hover:-translate-y-0.5 hover:border-tone-line",
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                "absolute right-4 top-4 grid size-5 place-items-center rounded-full border transition-all duration-200",
                                                active ? "border-tone bg-tone text-page" : "border-line",
                                            )}
                                        >
                                            {active && <Icon name="check" size={12} strokeWidth={3} />}
                                        </span>

                                        <CategoryTile slug={meta.slug} size="lg" />

                                        <span className="mt-4 text-[16.5px] font-semibold">
                                            {item.label}
                                        </span>
                                        <span className="mt-1 text-[13px] leading-snug text-muted">
                                            {meta.hint}
                                        </span>

                                        <ul className="mt-4 space-y-1.5 border-t border-tone-line pt-4">
                                            {meta.opens.map((line) => (
                                                <li
                                                    key={line}
                                                    className="flex items-center gap-2 text-[12.5px] text-muted"
                                                >
                                                    <Icon
                                                        name="check"
                                                        size={12}
                                                        strokeWidth={2.6}
                                                        className="shrink-0 text-tone-text"
                                                    />
                                                    {line}
                                                </li>
                                            ))}
                                        </ul>
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
                                    <div className="mt-6 grid gap-4 rounded-2xl border border-line bg-raised p-5 sm:grid-cols-2">
                                        <label className="block">
                                            <span className="mb-1.5 block text-[13px] font-medium">
                                                F.I.O.
                                            </span>
                                            <input
                                                value={name}
                                                onChange={(event) => setName(event.target.value)}
                                                placeholder="Familiya Ism"
                                                className={INPUT}
                                            />
                                        </label>

                                        <label className="block">
                                            <span className="mb-1.5 block text-[13px] font-medium">
                                                Hudud
                                            </span>
                                            <select
                                                value={region}
                                                onChange={(event) => setRegion(event.target.value)}
                                                className={INPUT}
                                            >
                                                <option value="">Tanlang</option>
                                                {regions.map((item) => (
                                                    <option key={item.value} value={item.value}>
                                                        {item.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>
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
                            onClick={saveRole}
                            disabled={!role || busy}
                            className="mt-7 inline-flex items-center gap-2 rounded-full bg-invert px-7 py-3.5 text-[15px] font-semibold text-on-invert transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            {busy && (
                                <span className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
                            )}
                            {busy ? "Saqlanmoqda…" : needsProfile ? "Keyingi qadam" : "Kabinetga o'tish"}
                            {!busy && <Icon name="arrowRight" size={16} />}
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="profile"
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 16 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <button
                            type="button"
                            onClick={() => setStep("role")}
                            className="group mb-5 inline-flex items-center gap-1.5 text-[13px] text-muted transition-colors hover:text-text"
                        >
                            <Icon
                                name="arrowLeft"
                                size={14}
                                className="transition-transform group-hover:-translate-x-0.5"
                            />
                            Rolni o&apos;zgartirish
                        </button>

                        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                            {role === "startupper" ? "Startapingiz haqida" : "Biznesingiz haqida"}
                        </h1>
                        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted">
                            {role === "startupper"
                                ? "Anketa kengash tomonidan ko'rib chiqiladi, tasdiqlangach startapingiz reyestrga tushadi va investorlarga ko'rinadi."
                                : "Anketa kengash tomonidan ko'rib chiqiladi, tasdiqlangach biznesingiz hamkorlar ro'yxatida ko'rinadi."}{" "}
                            Yulduzchali maydonlar majburiy.
                        </p>

                        <div className="mt-8">
                            {role === "startupper" ? (
                                <StartupForm
                                    spheres={startupSpheres}
                                    stages={startupStages}
                                    initial={startup}
                                    submitLabel="Tayyor — kabinetga"
                                    onSaved={finish}
                                />
                            ) : (
                                <BusinessForm
                                    spheres={businessSpheres}
                                    regions={regions}
                                    initial={business}
                                    defaultRegion={region}
                                    submitLabel="Tayyor — kabinetga"
                                    onSaved={finish}
                                />
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
