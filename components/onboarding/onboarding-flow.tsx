"use client";

import { GraduationCap, Plane, type LucideIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { SuccessBurst } from "@/components/auth/success-burst";
import { CategoryTile } from "@/components/category-tile";
import { Icon } from "@/components/icon";
import { BusinessForm } from "@/components/onboarding/business-form";
import { INPUT } from "@/components/onboarding/form-kit";
import { PeerForm } from "@/components/onboarding/peer-form";
import { StartupForm } from "@/components/onboarding/startup-form";
import { cn } from "@/lib/cn";
import type { BusinessProfile, Choice, Country, PeerProfile, StartupProfile } from "@/lib/types";

/**
 * Ro'yxatdan o'tishning davomi: kim siz → (yosh: qayerda o'qiysiz) → anketa → kabinet.
 *
 * Qaysi qadamdan boshlashni server aytadi (`user.onboarding`): rol
 * tanlangan-u anketa to'ldirilmagan bo'lsa, to'g'ri o'sha qadam
 * ochiladi. «Keyinroq» tugmasi yo'q — anketasiz kabinet ochilmaydi.
 */

type Step = "role" | "study" | "profile";
type Study = "uz" | "abroad";

const ROLE_META: Record<string, { slug: string; hint: string; opens: string[]; tone: string }> = {
    yosh: {
        slug: "ic-graduation",
        hint: "O'qiyapman yoki endi yo'l boshlayapman",
        opens: ["Tashabbus bildirish", "Ovoz berish", "Chet eldagi tengdoshlarga qo'shilish"],
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

const STUDY_OPTIONS: {
    value: Study;
    title: string;
    hint: string;
    action: string;
    tone: string;
    icon: LucideIcon;
}[] = [
    {
        value: "uz",
        title: "O'zbekistonda",
        hint: "Vatanimizdagi universitet, kollej yoki litseyda o'qiyman.",
        action: "Tanlash va kabinetga o'tish",
        tone: "emerald",
        icon: GraduationCap,
    },
    {
        value: "abroad",
        title: "Chet elda",
        hint: "Xorijda o'qiyman. Profilim «Chet eldagi tengdoshlar» bo'limida chiqsin.",
        action: "Anketani to'ldirish",
        tone: "blue",
        icon: Plane,
    },
];

const EASE = [0.22, 1, 0.36, 1] as const;

export function OnboardingFlow({
    initialStep,
    initialRole,
    initialStudy = null,
    roles,
    regions,
    countries,
    fullName,
    userRegion,
    userPhone = "",
    startupSpheres,
    startupStages,
    businessSpheres,
    business = null,
    startup = null,
    peer = null,
}: {
    initialStep: Step;
    initialRole: string | null;
    initialStudy?: Study | null;
    roles: Choice[];
    regions: Choice[];
    countries: Country[];
    fullName: string;
    userRegion: string;
    userPhone?: string;
    startupSpheres: Choice[];
    startupStages: Choice[];
    businessSpheres: Choice[];
    /** Yarim saqlangan anketa (masalan, rasm yuklanmay qolgan) — qaytadan yozmasin */
    business?: BusinessProfile | null;
    startup?: StartupProfile | null;
    peer?: PeerProfile | null;
}) {
    const router = useRouter();
    const [step, setStep] = useState<Step>(initialStep);
    const [role, setRole] = useState<string | null>(initialRole);
    const [study, setStudy] = useState<Study | null>(initialStudy);
    const [name, setName] = useState(fullName);
    const [region, setRegion] = useState(userRegion);
    const [busy, setBusy] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const needsProfile = role === "entrepreneur" || role === "startupper";
    const isYouth = role === "yosh";

    function goTo(next: Step) {
        setStep(next);
        setError(null);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    /** Profilni saqlaydi; xato bo'lsa uni ko'rsatib `false` qaytaradi. */
    async function patchProfile(body: Record<string, string>) {
        const response = await fetch("/api/auth/profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        if (response.ok) return true;

        const data = await response.json().catch(() => ({}));
        setError(data.detail ?? "Saqlab bo'lmadi.");
        return false;
    }

    async function saveRole() {
        if (!role || busy) return;
        if (!name.trim()) {
            setError("Ismingizni yozing.");
            return;
        }

        setBusy(true);
        setError(null);

        try {
            if (!(await patchProfile({ role, region, full_name: name.trim() }))) return;

            if (needsProfile) return goTo("profile");
            if (isYouth) return goTo("study");
            finish();
        } catch {
            setError("Tarmoqda xatolik. Qayta urinib ko'ring.");
        } finally {
            setBusy(false);
        }
    }

    async function chooseStudy(value: Study) {
        if (busy) return;

        setStudy(value);
        setBusy(true);
        setError(null);

        try {
            if (!(await patchProfile({ study_location: value }))) return;

            if (value === "abroad") return goTo("profile");
            finish();
        } catch {
            setError("Tarmoqda xatolik. Qayta urinib ko'ring.");
        } finally {
            setBusy(false);
        }
    }

    /** «Tayyor!» lahzasini ko'rsatib, kabinetga o'tadi. */
    function finish() {
        setDone(true);
        window.setTimeout(() => {
            router.replace("/kabinet");
            router.refresh();
        }, 1400);
    }

    const steps = needsProfile
        ? ["Kim siz?", role === "startupper" ? "Startap" : "Biznes", "Tayyor"]
        : isYouth
          ? ["Kim siz?", "Ta'lim", ...(study === "abroad" ? ["Anketa"] : []), "Tayyor"]
          : ["Kim siz?", "Tayyor"];
    const position = step === "role" ? 0 : step === "study" ? 1 : isYouth ? 2 : 1;
    const current = done ? steps.length - 1 : position;

    return (
        <div>
            <SuccessBurst
                show={done}
                title={`Tayyor, ${name.trim().split(/\s+/)[0] || "do'stim"}!`}
                subtitle="Kabinetingiz ochilmoqda"
            />

            {/* Qadamlar */}
            <ol className="mb-10 flex flex-wrap items-center gap-2">
                {steps.map((label, index) => (
                    <li key={label} className="flex items-center gap-2">
                        <motion.span
                            layout
                            animate={index === current ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                            transition={{ duration: 0.4 }}
                            className={cn(
                                "grid size-7 place-items-center rounded-full text-[12px] font-semibold tabular-nums transition-colors duration-300",
                                index < current && "bg-accent text-white",
                                index === current && "bg-invert text-on-invert",
                                index > current && "border border-line text-faint",
                            )}
                        >
                            {index < current ? <Icon name="check" size={13} strokeWidth={3} /> : index + 1}
                        </motion.span>
                        <span
                            className={cn(
                                "text-[13px]",
                                index === current ? "font-semibold text-text" : "text-muted",
                            )}
                        >
                            {label}
                        </span>
                        {index < steps.length - 1 && (
                            <span className="relative mx-1 h-px w-8 overflow-hidden bg-line sm:w-14">
                                <motion.span
                                    className="absolute inset-y-0 left-0 bg-accent"
                                    initial={false}
                                    animate={{ width: index < current ? "100%" : "0%" }}
                                    transition={{ duration: 0.5, ease: EASE }}
                                />
                            </span>
                        )}
                    </li>
                ))}
            </ol>

            <AnimatePresence mode="wait">
                {step === "role" && (
                    <motion.div
                        key="role"
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -16 }}
                        transition={{ duration: 0.3, ease: EASE }}
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
                                        whileTap={{ scale: 0.98 }}
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
                                    transition={{ duration: 0.3, ease: EASE }}
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

                        <ErrorNote error={error} />

                        <motion.button
                            type="button"
                            onClick={saveRole}
                            disabled={!role || busy}
                            whileTap={{ scale: 0.97 }}
                            className="group mt-7 inline-flex items-center gap-2 rounded-full bg-invert px-7 py-3.5 text-[15px] font-semibold text-on-invert transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            {busy && (
                                <span className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
                            )}
                            {busy ? "Saqlanmoqda…" : needsProfile || isYouth ? "Keyingi qadam" : "Kabinetga o'tish"}
                            {!busy && (
                                <Icon
                                    name="arrowRight"
                                    size={16}
                                    className="transition-transform duration-300 group-hover:translate-x-1"
                                />
                            )}
                        </motion.button>
                    </motion.div>
                )}

                {step === "study" && (
                    <motion.div
                        key="study"
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -16 }}
                        transition={{ duration: 0.3, ease: EASE }}
                    >
                        <BackButton onClick={() => goTo("role")}>Rolni o&apos;zgartirish</BackButton>

                        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                            Qayerda ta&apos;lim olasiz?
                        </h1>
                        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted">
                            Chet elda o&apos;qiyotgan bo&apos;lsangiz, profilingiz «Chet eldagi
                            tengdoshlar» bo&apos;limida chiqadi — yurtdoshlaringiz siz bilan
                            bog&apos;lanib, tajriba so&apos;ray oladi.
                        </p>

                        <div className="mt-8 grid gap-4 sm:grid-cols-2">
                            {STUDY_OPTIONS.map((option, index) => {
                                const picked = study === option.value;
                                const Glyph = option.icon;

                                return (
                                    <motion.button
                                        key={option.value}
                                        type="button"
                                        onClick={() => chooseStudy(option.value)}
                                        disabled={busy}
                                        initial={{ opacity: 0, y: 22, scale: 0.96 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        whileHover={{ y: -5 }}
                                        whileTap={{ scale: 0.98 }}
                                        transition={{
                                            delay: 0.08 + index * 0.1,
                                            type: "spring",
                                            stiffness: 260,
                                            damping: 22,
                                        }}
                                        className={cn(
                                            `tone-${option.tone}`,
                                            "group relative overflow-hidden rounded-3xl border p-6 text-left transition-colors duration-300 disabled:cursor-wait sm:p-7",
                                            picked
                                                ? "border-tone bg-tone-soft shadow-[0_22px_50px_-26px_var(--tone)]"
                                                : "border-line bg-raised hover:border-tone-line hover:shadow-[0_22px_50px_-30px_var(--tone)]",
                                        )}
                                    >
                                        {/* Burchakdagi yog'du */}
                                        <span
                                            aria-hidden
                                            className="pointer-events-none absolute -right-20 -top-20 size-56 rounded-full bg-[radial-gradient(circle,var(--tone-soft),transparent_70%)] opacity-60 transition-opacity duration-500 group-hover:opacity-100"
                                        />

                                        <motion.span
                                            className="relative grid size-16 place-items-center rounded-2xl border border-tone-line bg-tone-soft text-tone-text"
                                            animate={
                                                option.value === "abroad"
                                                    ? { y: [0, -6, 0], rotate: [0, -8, 0] }
                                                    : { y: [0, -4, 0] }
                                            }
                                            transition={{
                                                duration: 3.2,
                                                repeat: Infinity,
                                                ease: "easeInOut",
                                                delay: index * 0.4,
                                            }}
                                        >
                                            <Glyph className="size-8" strokeWidth={1.6} />
                                        </motion.span>

                                        <span className="relative mt-5 block text-xl font-semibold tracking-tight">
                                            {option.title}
                                        </span>
                                        <span className="relative mt-1.5 block text-[13.5px] leading-relaxed text-muted">
                                            {option.hint}
                                        </span>

                                        <span className="relative mt-6 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-tone-text">
                                            {busy && picked ? (
                                                <>
                                                    <span className="size-3.5 animate-spin rounded-full border-2 border-current border-r-transparent" />
                                                    Saqlanmoqda…
                                                </>
                                            ) : (
                                                <>
                                                    {option.action}
                                                    <Icon
                                                        name="arrowRight"
                                                        size={14}
                                                        className="transition-transform duration-300 group-hover:translate-x-1"
                                                    />
                                                </>
                                            )}
                                        </span>
                                    </motion.button>
                                );
                            })}
                        </div>

                        <ErrorNote error={error} />
                    </motion.div>
                )}

                {step === "profile" && (
                    <motion.div
                        key="profile"
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 16 }}
                        transition={{ duration: 0.3, ease: EASE }}
                    >
                        <BackButton onClick={() => goTo(isYouth ? "study" : "role")}>
                            {isYouth ? "Tanlovni o'zgartirish" : "Rolni o'zgartirish"}
                        </BackButton>

                        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                            {isYouth
                                ? "Chet eldagi tengdosh anketasi"
                                : role === "startupper"
                                  ? "Startapingiz haqida"
                                  : "Biznesingiz haqida"}
                        </h1>
                        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted">
                            {isYouth
                                ? "Saqlangach profilingiz darhol «Chet eldagi tengdoshlar» bo'limida chiqadi."
                                : role === "startupper"
                                  ? "Anketa kengash tomonidan ko'rib chiqiladi, tasdiqlangach startapingiz reyestrga tushadi va investorlarga ko'rinadi."
                                  : "Anketa kengash tomonidan ko'rib chiqiladi, tasdiqlangach biznesingiz hamkorlar ro'yxatida ko'rinadi."}{" "}
                            Yulduzchali maydonlar majburiy.
                        </p>

                        <div className="mt-8">
                            {isYouth ? (
                                <PeerForm
                                    countries={countries}
                                    initial={peer}
                                    defaultPhone={userPhone}
                                    submitLabel="Tayyor — kabinetga"
                                    onSaved={finish}
                                />
                            ) : role === "startupper" ? (
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

function BackButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="group mb-5 inline-flex items-center gap-1.5 text-[13px] text-muted transition-colors hover:text-text"
        >
            <Icon
                name="arrowLeft"
                size={14}
                className="transition-transform group-hover:-translate-x-0.5"
            />
            {children}
        </button>
    );
}

function ErrorNote({ error }: { error: string | null }) {
    return (
        <AnimatePresence>
            {error && (
                <motion.p
                    initial={{ opacity: 0, height: 0, x: 0 }}
                    animate={{ opacity: 1, height: "auto", x: [0, -6, 6, -3, 0] }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.4 }}
                    className="mt-5 flex items-start gap-2.5 overflow-hidden rounded-xl bg-warn-soft px-4 py-3 text-[13.5px] text-warn-text"
                >
                    <Icon name="alert" size={16} className="mt-0.5 shrink-0" />
                    {error}
                </motion.p>
            )}
        </AnimatePresence>
    );
}
