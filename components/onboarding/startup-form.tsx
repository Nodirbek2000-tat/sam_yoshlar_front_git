"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Icon } from "@/components/icon";
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
import type { Choice, StartupProfile } from "@/lib/types";

/**
 * Startupperning startap anketasi.
 *
 * Ro'yxatdan o'tishda bo'sh ochiladi, kabinetdagi «Startapim» bo'limida
 * mavjud ma'lumot bilan. Logotip va pitch fayl ixtiyoriy.
 */
export function StartupForm({
    spheres,
    stages,
    initial,
    submitLabel = "Saqlash",
    action = "/api/proxy/me/startup",
    onSaved,
}: {
    spheres: Choice[];
    stages: Choice[];
    initial?: StartupProfile | null;
    submitLabel?: string;
    /** Qayerga yuboriladi: ro'yxatdan o'tishda — birinchi startap, kabinetda — aniq startap */
    action?: string;
    onSaved?: (profile: StartupProfile) => void;
}) {
    const router = useRouter();
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [errors, setErrors] = useState<FieldErrors>({});
    const [pitchName, setPitchName] = useState<string | null>(null);

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
        const logoPicked = (form.elements.namedItem("logo") as HTMLInputElement | null)?.files?.length;
        if (!logoPicked && !initial?.logo_url) {
            setErrors({ logo: "Logotipni yuklang." });
            setError("Logotip majburiy — u startaplar ro'yxatida ko'rinadi.");
            return;
        }

        setBusy(true);
        setError(null);
        setErrors({});

        try {
            const response = await fetch(action, {
                method: "POST",
                body: collectForm(form, ["team_size"]),
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

            onSaved?.(payload as StartupProfile);
            router.refresh();
        } catch {
            setError("Tarmoqda xatolik. Qayta urinib ko'ring.");
        } finally {
            setBusy(false);
        }
    }

    return (
        <form
            onSubmit={submit}
            onChange={(event) => clearError((event.target as { name?: string }).name ?? "")}
            className="space-y-4"
            noValidate
        >
            <Section icon="rocket" tone="violet" title="Startapingiz" hint="Nomi, yo'nalishi va bosqichi">
                <div className="space-y-5">
                    <LogoPicker
                        name="logo"
                        current={initial?.logo_url}
                        label="Logotip"
                        icon="rocket"
                        required
                        error={errors.logo}
                    />

                    <Field label="Startap nomi" required error={errors.name}>
                        <input
                            name="name"
                            required
                            maxLength={200}
                            defaultValue={initial?.name}
                            placeholder="Masalan: Tilchi AI"
                            className={INPUT}
                        />
                    </Field>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Yo'nalish" required error={errors.sphere}>
                            <select
                                name="sphere"
                                required
                                defaultValue={initial?.sphere ?? spheres[0]?.value}
                                className={INPUT}
                            >
                                {spheres.map((item) => (
                                    <option key={item.value} value={item.value}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        <Field label="Bosqichi" required error={errors.stage}>
                            <select
                                name="stage"
                                required
                                defaultValue={initial?.stage ?? stages[0]?.value}
                                className={INPUT}
                            >
                                {stages.map((item) => (
                                    <option key={item.value} value={item.value}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                        </Field>
                    </div>
                </div>
            </Section>

            <Section icon="bulb" tone="amber" title="G'oya" hint="Investor birinchi shuni o'qiydi">
                <div className="space-y-4">
                    <Field label="Startapingiz nima qiladi?" required error={errors.about}>
                        <textarea
                            name="about"
                            required
                            rows={4}
                            defaultValue={initial?.about}
                            placeholder="Mahsulotingiz nima, kimga kerak, qanday ishlaydi"
                            className={TEXTAREA}
                        />
                    </Field>

                    <Field label="Qaysi muammoni hal qiladi?" error={errors.problem_solved}>
                        <textarea
                            name="problem_solved"
                            rows={3}
                            defaultValue={initial?.problem_solved}
                            placeholder="Bu muammo hozir qanday hal qilinyapti va nimasi yomon"
                            className={TEXTAREA}
                        />
                    </Field>
                </div>
            </Section>

            <Section icon="users" tone="emerald" title="Jamoa va investitsiya">
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Jamoada necha kishi?" error={errors.team_size}>
                        <input
                            type="number"
                            name="team_size"
                            min={1}
                            defaultValue={initial?.team_size ?? 1}
                            className={INPUT}
                        />
                    </Field>

                    <Field
                        label="Kerakli investitsiya"
                        hint="so'mda"
                        error={errors.needed_investment}
                    >
                        <input
                            type="number"
                            name="needed_investment"
                            min={0}
                            step={1000000}
                            defaultValue={
                                initial?.needed_investment
                                    ? Math.round(Number(initial.needed_investment))
                                    : ""
                            }
                            placeholder="150000000"
                            className={INPUT}
                        />
                    </Field>
                </div>
            </Section>

            <Section icon="doc" tone="cyan" title="Materiallar" hint="Ixtiyoriy">
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Veb-sayt yoki demo" error={errors.website}>
                        <input
                            name="website"
                            maxLength={200}
                            defaultValue={initial?.website}
                            placeholder="tilchi.uz"
                            className={INPUT}
                        />
                    </Field>

                    <Field label="Pitch (PDF yoki slayd)" hint="20 MB gacha" error={errors.pitch_file}>
                        <span className="flex h-11 items-center gap-3 rounded-xl border border-dashed border-line bg-page px-3.5 text-[13.5px] text-muted transition-colors hover:border-accent">
                            <Icon name="doc" size={16} className="shrink-0 text-faint" />
                            <span className="min-w-0 flex-1 truncate">
                                {pitchName ??
                                    (initial?.pitch_url ? "Yuklangan — almashtirish" : "Fayl tanlash")}
                            </span>
                            <input
                                type="file"
                                name="pitch_file"
                                accept=".pdf,.ppt,.pptx,.key"
                                className="sr-only"
                                onChange={(event) =>
                                    setPitchName(event.target.files?.[0]?.name ?? null)
                                }
                            />
                        </span>
                    </Field>
                </div>

                {initial?.pitch_url && (
                    <a
                        href={initial.pitch_url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-accent-text hover:underline"
                    >
                        Joriy pitchni ochish
                        <Icon name="arrowRight" size={12} />
                    </a>
                )}
            </Section>

            <div className="pt-2">
                <SubmitBar busy={busy} label={submitLabel} error={error} />
            </div>
        </form>
    );
}
