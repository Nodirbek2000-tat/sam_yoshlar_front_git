"use client";

import { Backpack, Briefcase, GraduationCap, SearchX, type LucideIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Icon } from "@/components/icon";
import { Field, INPUT } from "@/components/onboarding/form-kit";
import { cn } from "@/lib/cn";
import { SOCIAL_STATUSES, isStudying, type SocialStatus } from "@/lib/social";

const ICONS: Record<SocialStatus, LucideIcon> = {
    student: GraduationCap,
    school: Backpack,
    employed: Briefcase,
    unemployed: SearchX,
};

/**
 * Ijtimoiy holat: 4 ta tanlov, talaba yoki o'quvchi bo'lsa — o'qish joyi.
 *
 * Formaning ichida ishlaydi: tanlangan qiymat `social_status` va
 * `education_place` nomli maydonlar bo'lib forma bilan birga yuboriladi.
 */
export function SocialStatusFields({
    initialStatus = "",
    initialPlace = "",
    errors = {},
    onPick,
}: {
    initialStatus?: SocialStatus | "";
    initialPlace?: string;
    errors?: { social_status?: string; education_place?: string };
    /** Tanlov o'zgarganda — formadagi eski xato yozuvi o'chsin */
    onPick?: () => void;
}) {
    const [status, setStatus] = useState<SocialStatus | "">(initialStatus);
    const current = SOCIAL_STATUSES.find((item) => item.value === status);

    return (
        <div className="space-y-4">
            <input type="hidden" name="social_status" value={status} />

            <div className="grid gap-2.5 sm:grid-cols-2">
                {SOCIAL_STATUSES.map((option) => {
                    const active = status === option.value;
                    const Glyph = ICONS[option.value];
                    return (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                                setStatus(option.value);
                                onPick?.();
                            }}
                            aria-pressed={active}
                            className={cn(
                                `tone-${option.tone}`,
                                "group flex items-center gap-3 rounded-2xl border p-3.5 text-left transition-colors duration-200",
                                active
                                    ? "border-tone bg-tone-soft shadow-[0_14px_34px_-26px_var(--tone)]"
                                    : "border-line bg-page hover:border-tone-line",
                            )}
                        >
                            <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-tone-line bg-tone-soft text-tone-text transition-transform duration-300 group-hover:-rotate-6">
                                <Glyph className="size-5" strokeWidth={1.8} />
                            </span>
                            <span className="min-w-0 flex-1 text-[14px] font-medium">{option.choice}</span>
                            <span
                                className={cn(
                                    "grid size-5 shrink-0 place-items-center rounded-full border transition-all",
                                    active ? "border-tone bg-tone text-page" : "border-line",
                                )}
                            >
                                {active && <Icon name="check" size={12} strokeWidth={3} />}
                            </span>
                        </button>
                    );
                })}
            </div>

            {errors.social_status && (
                <p className="text-[12.5px] text-warn-text">{errors.social_status}</p>
            )}

            <AnimatePresence initial={false}>
                {current?.place && (
                    <motion.div
                        key={current.value}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                    >
                        <Field label={current.place} required error={errors.education_place}>
                            <input
                                name="education_place"
                                required
                                maxLength={200}
                                defaultValue={initialPlace}
                                placeholder={current.placeholder}
                                className={INPUT}
                            />
                        </Field>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

/**
 * Kabinetda: joriy holat va «O'zgartirish». Talaba bitirib ishga kirsa,
 * shu yerdan yangilaydi — startap qo'shishda qayta so'ralmaydi.
 */
export function SocialStatusCard({
    status,
    place,
}: {
    status: SocialStatus | "";
    place: string;
}) {
    const router = useRouter();
    const [editing, setEditing] = useState(false);
    const [busy, setBusy] = useState(false);
    const [errors, setErrors] = useState<{ social_status?: string; education_place?: string }>({});
    const current = SOCIAL_STATUSES.find((item) => item.value === status);

    async function save(form: HTMLFormElement) {
        const data = new FormData(form);
        const next = String(data.get("social_status") ?? "");
        if (!next) {
            setErrors({ social_status: "Ijtimoiy holatingizni tanlang." });
            return;
        }

        setBusy(true);
        setErrors({});
        try {
            const response = await fetch("/api/auth/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    social_status: next,
                    education_place: isStudying(next) ? String(data.get("education_place") ?? "").trim() : "",
                }),
            });
            if (!response.ok) {
                const payload = (await response.json().catch(() => null)) as Record<string, string[] | string> | null;
                const pick = (key: string) => {
                    const value = payload?.[key];
                    return Array.isArray(value) ? value[0] : value;
                };
                setErrors({
                    social_status: pick("social_status") ?? (pick("education_place") ? undefined : "Saqlab bo'lmadi."),
                    education_place: pick("education_place"),
                });
                return;
            }
            setEditing(false);
            router.refresh();
        } catch {
            setErrors({ social_status: "Tarmoqda xatolik. Qayta urinib ko'ring." });
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="rounded-2xl border border-line bg-raised p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-3">
                <span
                    className={cn(
                        `tone-${current?.tone ?? "slate"}`,
                        "grid size-10 shrink-0 place-items-center rounded-xl border border-tone-line bg-tone-soft text-tone-text",
                    )}
                >
                    <Icon name="user" size={17} />
                </span>
                <div className="min-w-0 flex-1">
                    <p className="text-[12px] text-faint">Ijtimoiy holatingiz</p>
                    <p className="truncate text-[14.5px] font-medium">
                        {current ? current.label : "Ko'rsatilmagan"}
                        {current?.place && place && <span className="text-muted"> · {place}</span>}
                    </p>
                </div>
                {!editing && (
                    <button
                        type="button"
                        onClick={() => setEditing(true)}
                        className="rounded-full border border-line px-4 py-2 text-[12.5px] text-muted transition-colors hover:bg-surface hover:text-text"
                    >
                        O&apos;zgartirish
                    </button>
                )}
            </div>

            <AnimatePresence initial={false}>
                {editing && (
                    <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                        onSubmit={(event) => {
                            event.preventDefault();
                            void save(event.currentTarget);
                        }}
                        noValidate
                    >
                        <div className="pt-4">
                            <SocialStatusFields
                                initialStatus={status}
                                initialPlace={place}
                                errors={errors}
                                onPick={() => setErrors({})}
                            />
                            <div className="mt-4 flex items-center gap-2">
                                <button
                                    type="submit"
                                    disabled={busy}
                                    className="rounded-full bg-invert px-5 py-2.5 text-[13px] font-medium text-on-invert transition-opacity hover:opacity-90 disabled:opacity-60"
                                >
                                    {busy ? "Saqlanmoqda…" : "Saqlash"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditing(false);
                                        setErrors({});
                                    }}
                                    className="rounded-full border border-line px-5 py-2.5 text-[13px] text-muted transition-colors hover:text-text"
                                >
                                    Bekor qilish
                                </button>
                            </div>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>
        </div>
    );
}
