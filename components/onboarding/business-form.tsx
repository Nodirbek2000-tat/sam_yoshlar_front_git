"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import {
    Field,
    GalleryPicker,
    INPUT,
    LogoPicker,
    Section,
    SubmitBar,
    TEXTAREA,
    collectForm,
    toFieldErrors,
    type FieldErrors,
} from "@/components/onboarding/form-kit";
import type { BusinessProfile, Choice } from "@/lib/types";

/**
 * Tadbirkorning biznes anketasi.
 *
 * Ro'yxatdan o'tishda ham, kabinetdagi «Biznesim» bo'limida ham shu forma:
 * birinchisida bo'sh ochiladi, ikkinchisida mavjud ma'lumot bilan.
 *
 * Saqlash ikki bosqichli: avval biznes (logotip bilan), keyin yangi
 * rasmlar — galereya biznesga bog'langani uchun u avval mavjud bo'lishi kerak.
 */
export function BusinessForm({
    spheres,
    regions,
    initial,
    defaultRegion = "",
    submitLabel = "Saqlash",
    onSaved,
}: {
    spheres: Choice[];
    regions: Choice[];
    initial?: BusinessProfile | null;
    defaultRegion?: string;
    submitLabel?: string;
    onSaved?: (profile: BusinessProfile) => void;
}) {
    const router = useRouter();
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [errors, setErrors] = useState<FieldErrors>({});
    const [files, setFiles] = useState<File[]>([]);
    const [gallery, setGallery] = useState(initial?.gallery ?? []);

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

        // Rasmlar majburiy — serverga bormasdan tekshiramiz
        const form = event.currentTarget;
        const logoPicked = (form.elements.namedItem("logo") as HTMLInputElement | null)?.files?.length;
        const missing: FieldErrors = {};
        if (!logoPicked && !initial?.logo_url) missing.logo = "Logotipni yuklang.";
        if (gallery.length + files.length === 0) missing.gallery = "Kamida bitta rasm qo'shing.";

        if (Object.keys(missing).length) {
            setErrors(missing);
            setError("Rasmlar majburiy — logotip va kamida bitta rasm kerak.");
            return;
        }

        setBusy(true);
        setError(null);
        setErrors({});

        try {
            const response = await fetch("/api/proxy/me/business", {
                method: "POST",
                body: collectForm(form, ["employees", "founded_year"]),
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

            let saved = payload as BusinessProfile;

            // Yangi rasmlar — biznes endi mavjud
            if (files.length) {
                const upload = new FormData();
                files.forEach((file) => upload.append("images", file));

                const images = await fetch("/api/proxy/me/business/gallery", {
                    method: "POST",
                    body: upload,
                });
                const result = await images.json().catch(() => null);

                if (!images.ok) {
                    setError(
                        (result as { detail?: string } | null)?.detail ??
                            "Ma'lumot saqlandi, lekin rasmlarni yuklab bo'lmadi.",
                    );
                    return;
                }

                saved = { ...saved, gallery: result };
                setGallery(result);
                setFiles([]);
            }

            onSaved?.(saved);
            router.refresh();
        } catch {
            setError("Tarmoqda xatolik. Qayta urinib ko'ring.");
        } finally {
            setBusy(false);
        }
    }

    async function removeImage(id: number) {
        const response = await fetch(`/api/proxy/me/business/gallery/${id}`, { method: "DELETE" });
        if (response.ok) setGallery((current) => current.filter((image) => image.id !== id));
    }

    return (
        <form
            onSubmit={submit}
            onChange={(event) => clearError((event.target as { name?: string }).name ?? "")}
            className="space-y-4"
            noValidate
        >
            <Section icon="briefcase" tone="amber" title="Biznesingiz" hint="Nomi va sohasi">
                <div className="space-y-5">
                    <LogoPicker
                        name="logo"
                        current={initial?.logo_url}
                        label="Logotip"
                        icon="building"
                        required
                        error={errors.logo}
                    />

                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Korxona nomi" required error={errors.name}>
                            <input
                                name="name"
                                required
                                maxLength={200}
                                defaultValue={initial?.name}
                                placeholder="Masalan: Buxoro Tekstil"
                                className={INPUT}
                            />
                        </Field>

                        <Field label="Faoliyat sohasi" required error={errors.sphere}>
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
                    </div>
                </div>
            </Section>

            <Section icon="chart" tone="emerald" title="Asosiy raqamlar" hint="Ixtiyoriy, lekin ishonch beradi">
                <div className="grid gap-4 sm:grid-cols-3">
                    <Field label="Tashkil topgan yil" error={errors.founded_year}>
                        <input
                            type="number"
                            name="founded_year"
                            min={1900}
                            max={new Date().getFullYear()}
                            defaultValue={initial?.founded_year ?? ""}
                            placeholder="2019"
                            className={INPUT}
                        />
                    </Field>

                    <Field label="Xodimlar soni" error={errors.employees}>
                        <input
                            type="number"
                            name="employees"
                            min={1}
                            defaultValue={initial?.employees ?? ""}
                            placeholder="35"
                            className={INPUT}
                        />
                    </Field>

                    <Field label="STIR" hint="9 raqam" error={errors.stir}>
                        <input
                            name="stir"
                            inputMode="numeric"
                            maxLength={9}
                            defaultValue={initial?.stir}
                            placeholder="301234567"
                            className={INPUT}
                        />
                    </Field>
                </div>
            </Section>

            <Section icon="pin" tone="blue" title="Qayerda" hint="Hamkorlar sizni topa olsin">
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Viloyat" error={errors.region}>
                        <select
                            name="region"
                            defaultValue={initial?.region || defaultRegion}
                            className={INPUT}
                        >
                            <option value="">Tanlanmagan</option>
                            {regions.map((item) => (
                                <option key={item.value} value={item.value}>
                                    {item.label}
                                </option>
                            ))}
                        </select>
                    </Field>

                    <Field label="Tuman / shahar" error={errors.district}>
                        <input
                            name="district"
                            maxLength={100}
                            defaultValue={initial?.district}
                            placeholder="G'ijduvon"
                            className={INPUT}
                        />
                    </Field>

                    <Field label="Manzil" className="sm:col-span-2" error={errors.address}>
                        <input
                            name="address"
                            maxLength={250}
                            defaultValue={initial?.address}
                            placeholder="Ko'cha, uy"
                            className={INPUT}
                        />
                    </Field>
                </div>
            </Section>

            <Section icon="doc" tone="violet" title="Biznes haqida" hint="Nima qilasiz, kimga, qanday">
                <Field label="Tavsif" required error={errors.description}>
                    <textarea
                        name="description"
                        required
                        rows={5}
                        defaultValue={initial?.description}
                        placeholder="Nima ishlab chiqarasiz yoki qanday xizmat ko'rsatasiz, mijozlaringiz kim, nimasi bilan boshqalardan farq qilasiz"
                        className={TEXTAREA}
                    />
                </Field>
            </Section>

            <Section icon="phone" tone="cyan" title="Aloqa" hint="Bo'sh qoldirsangiz hisobdagi telefon olinadi">
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Telefon" error={errors.phone}>
                        <input
                            name="phone"
                            type="tel"
                            maxLength={25}
                            defaultValue={initial?.phone}
                            placeholder="+998 90 123 45 67"
                            className={INPUT}
                        />
                    </Field>

                    <Field label="Veb-sayt" error={errors.website}>
                        <input
                            name="website"
                            maxLength={200}
                            defaultValue={initial?.website}
                            placeholder="buxorotekstil.uz"
                            className={INPUT}
                        />
                    </Field>

                    <Field label="Telegram" error={errors.telegram}>
                        <input
                            name="telegram"
                            maxLength={100}
                            defaultValue={initial?.telegram}
                            placeholder="@buxorotekstil"
                            className={INPUT}
                        />
                    </Field>

                    <Field label="Instagram" error={errors.instagram}>
                        <input
                            name="instagram"
                            maxLength={100}
                            defaultValue={initial?.instagram}
                            placeholder="@buxorotekstil"
                            className={INPUT}
                        />
                    </Field>
                </div>
            </Section>

            <Section icon="image" tone="rose" title="Rasmlar" required hint="Ish joyi, mahsulot, jamoa — kamida 1, ko'pi bilan 8">
                <GalleryPicker
                    existing={gallery}
                    files={files}
                    error={errors.gallery}
                    onFiles={(next) => {
                        setFiles(next);
                        clearError("gallery");
                    }}
                    onDelete={initial ? removeImage : undefined}
                />
            </Section>

            <div className="pt-2">
                <SubmitBar busy={busy} label={submitLabel} error={error} />
            </div>
        </form>
    );
}
