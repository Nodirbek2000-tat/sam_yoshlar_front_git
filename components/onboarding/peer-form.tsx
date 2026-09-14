"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import {
    Field,
    INPUT,
    LogoPicker,
    Section,
    SubmitBar,
    TEXTAREA,
    collectForm,
    toFieldErrors,
    type FieldErrors,
} from "@/components/onboarding/form-kit";
import { cn } from "@/lib/cn";
import type { Country, PeerProfile } from "@/lib/types";

const COURSES = [1, 2, 3, 4, 5, 6, 7];
const ACHIEVEMENTS_MAX = 300;

/**
 * Chet elda o'qiydigan yoshning anketasi.
 *
 * Saqlangach profil darhol «Chet eldagi tengdoshlar» ro'yxatiga chiqadi.
 * Rasm majburiy — ro'yxatda yurtdoshlar sizni yuzingizdan taniydi.
 */
export function PeerForm({
    countries,
    initial,
    defaultPhone = "",
    submitLabel = "Saqlash",
    onSaved,
}: {
    countries: Country[];
    initial?: PeerProfile | null;
    defaultPhone?: string;
    submitLabel?: string;
    onSaved?: (profile: PeerProfile) => void;
}) {
    const router = useRouter();
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [errors, setErrors] = useState<FieldErrors>({});
    const [achievements, setAchievements] = useState(initial?.achievements ?? "");

    /** Maydon tahrirlanishi bilan uning xatosi yo'qoladi. */
    function clearError(name: string) {
        if (!name || !errors[name]) return;
        setErrors((current) => {
            const next = { ...current };
            delete next[name];
            return next;
        });
        setError(null);
    }

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (busy) return;

        const form = event.currentTarget;
        const photoPicked = (form.elements.namedItem("photo") as HTMLInputElement | null)?.files
            ?.length;
        if (!photoPicked && !initial?.photo_url) {
            setErrors({ photo: "Rasmingizni yuklang." });
            setError("Rasm majburiy — tengdoshlar ro'yxatida sizni shu rasm bilan tanishadi.");
            return;
        }

        setBusy(true);
        setError(null);
        setErrors({});

        try {
            const response = await fetch("/api/proxy/me/peer", {
                method: "POST",
                body: collectForm(form),
            });
            const payload = await response.json().catch(() => null);

            if (!response.ok) {
                const parsed = toFieldErrors(payload);
                setErrors(parsed.fields);
                setError(
                    parsed.general ??
                        "Ba'zi maydonlarda xato bor — qizil yozuvlarni tekshiring.",
                );
                return;
            }

            // Ro'yxat va bosh sahifa keshi tozalansin — profil darhol ko'rinsin
            await fetch("/api/revalidate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tag: "peers" }),
            }).catch(() => null);

            onSaved?.(payload as PeerProfile);
            router.refresh();
        } catch {
            setError("Tarmoqda xatolik. Qayta urinib ko'ring.");
        } finally {
            setBusy(false);
        }
    }

    const left = ACHIEVEMENTS_MAX - achievements.length;

    return (
        <form
            onSubmit={submit}
            onChange={(event) => clearError((event.target as { name?: string }).name ?? "")}
            className="space-y-4"
            noValidate
        >
            <Section
                icon="image"
                tone="rose"
                title="Rasmingiz"
                hint="Yuzingiz aniq ko'rinadigan yaxshi rasm"
                required
            >
                <LogoPicker
                    name="photo"
                    current={initial?.photo_url}
                    label="Profil rasmi"
                    icon="image"
                    required
                    error={errors.photo}
                />
            </Section>

            <Section icon="globe" tone="blue" title="Qayerda o'qiysiz?" hint="Davlat, universitet va yo'nalish">
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Davlat" required error={errors.country}>
                        <select
                            name="country"
                            required
                            defaultValue={initial?.country ?? ""}
                            className={INPUT}
                        >
                            <option value="" disabled>
                                Tanlang
                            </option>
                            {countries.map((item) => (
                                <option key={item.value} value={item.value}>
                                    {item.label}
                                </option>
                            ))}
                        </select>
                    </Field>

                    <Field label="Shahar" error={errors.city}>
                        <input
                            name="city"
                            maxLength={100}
                            defaultValue={initial?.city}
                            placeholder="Masalan: Seul"
                            className={INPUT}
                        />
                    </Field>

                    <Field
                        label="Universitet nomi"
                        required
                        error={errors.institution}
                        className="sm:col-span-2"
                    >
                        <input
                            name="institution"
                            required
                            maxLength={200}
                            defaultValue={initial?.institution}
                            placeholder="Masalan: Seoul National University"
                            className={INPUT}
                        />
                    </Field>

                    <Field label="Nechanchi kurs" required error={errors.course}>
                        <select
                            name="course"
                            required
                            defaultValue={initial?.course ?? 1}
                            className={INPUT}
                        >
                            {COURSES.map((course) => (
                                <option key={course} value={course}>
                                    {course}-kurs
                                </option>
                            ))}
                        </select>
                    </Field>

                    <Field label="Yo'nalishingiz" required error={errors.field}>
                        <input
                            name="field"
                            required
                            maxLength={150}
                            defaultValue={initial?.field}
                            placeholder="Masalan: Kompyuter injiniringi"
                            className={INPUT}
                        />
                    </Field>
                </div>
            </Section>

            <Section icon="spark" tone="amber" title="Yutuqlaringiz" hint={`${ACHIEVEMENTS_MAX} ta belgigacha`}>
                <Field label="Qilgan yutuqlaringiz" error={errors.achievements}>
                    <textarea
                        name="achievements"
                        rows={4}
                        maxLength={ACHIEVEMENTS_MAX}
                        value={achievements}
                        onChange={(event) => setAchievements(event.target.value)}
                        placeholder="Grantlar, olimpiadalar, loyihalar, sertifikatlar…"
                        className={TEXTAREA}
                    />
                </Field>
                <p
                    className={cn(
                        "mt-1.5 text-right text-[12px] tabular-nums transition-colors",
                        left < 30 ? "text-warn-text" : "text-faint",
                    )}
                >
                    {left} ta belgi qoldi
                </p>
            </Section>

            <Section
                icon="telegram"
                tone="cyan"
                title="Bog'lanish"
                hint="Yurtdoshlaringiz shu orqali siz bilan bog'lanadi"
            >
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Telefon raqam" required error={errors.phone}>
                        <input
                            name="phone"
                            type="tel"
                            required
                            maxLength={25}
                            defaultValue={initial?.phone || defaultPhone}
                            placeholder="+998 90 123 45 67"
                            className={INPUT}
                        />
                    </Field>

                    <Field label="Telegram" error={errors.telegram}>
                        <input
                            name="telegram"
                            maxLength={100}
                            defaultValue={initial?.telegram}
                            placeholder="@username"
                            className={INPUT}
                        />
                    </Field>

                    <Field label="Gmail" error={errors.email} className="sm:col-span-2">
                        <input
                            name="email"
                            type="email"
                            maxLength={254}
                            defaultValue={initial?.email}
                            placeholder="ism@gmail.com"
                            className={INPUT}
                        />
                    </Field>
                </div>
            </Section>

            <div className="pt-2">
                <SubmitBar busy={busy} label={submitLabel} error={error} />
            </div>
        </form>
    );
}
