"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { Icon, type IconName } from "@/components/icon";
import { cn } from "@/lib/cn";
import type { GalleryImage } from "@/lib/types";

/**
 * Anketa bloklari — biznes va startap formalari shulardan yig'iladi.
 *
 * Xatolar maydon nomi bo'yicha keladi (Django `{"stir": ["..."]}` qaytaradi),
 * shuning uchun har bir `Field` o'z xatosini o'zi ko'rsatadi.
 */

export type FieldErrors = Record<string, string>;

export const INPUT =
    "h-11 w-full rounded-xl border border-line bg-page px-3.5 text-[14.5px] text-text outline-none transition-colors placeholder:text-faint focus:border-accent";

export const TEXTAREA =
    "w-full resize-y rounded-xl border border-line bg-page px-3.5 py-3 text-[14.5px] leading-relaxed text-text outline-none transition-colors placeholder:text-faint focus:border-accent";

/** Rangli sarlavhali blok. */
export function Section({
    icon,
    tone,
    title,
    hint,
    required,
    children,
}: {
    icon: IconName;
    tone: string;
    title: string;
    hint?: string;
    required?: boolean;
    children: ReactNode;
}) {
    return (
        <section className="rounded-2xl border border-line bg-raised p-5 sm:p-6">
            <header className="mb-5 flex items-start gap-3">
                <span
                    className={cn(
                        `tone-${tone}`,
                        "grid size-9 shrink-0 place-items-center rounded-xl border border-tone-line bg-tone-soft text-tone-text",
                    )}
                >
                    <Icon name={icon} size={17} />
                </span>
                <div className="min-w-0">
                    <h2 className="text-[15px] font-semibold tracking-tight">
                        {title}
                        {required && <span className="ml-0.5 text-warn">*</span>}
                    </h2>
                    {hint && <p className="mt-0.5 text-[12.5px] text-muted">{hint}</p>}
                </div>
            </header>
            {children}
        </section>
    );
}

export function Field({
    label,
    hint,
    error,
    required,
    className,
    children,
}: {
    label: string;
    hint?: string;
    error?: string;
    required?: boolean;
    className?: string;
    children: ReactNode;
}) {
    return (
        <label className={cn("block", className)}>
            <span className="mb-1.5 flex flex-wrap items-baseline gap-x-2">
                <span className="text-[13px] font-medium">
                    {label}
                    {required && <span className="ml-0.5 text-warn">*</span>}
                </span>
                {hint && <span className="text-[12px] text-faint">{hint}</span>}
            </span>
            {children}
            <AnimatePresence>
                {error && (
                    <motion.span
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-1.5 flex items-center gap-1.5 text-[12.5px] text-warn-text"
                    >
                        <Icon name="alert" size={13} />
                        {error}
                    </motion.span>
                )}
            </AnimatePresence>
        </label>
    );
}

/**
 * Logotip tanlash: bosilganda fayl oynasi ochiladi, tanlangani darhol
 * ko'rinadi. Forma yuborilganda `name` maydoni bilan ketadi.
 */
export function LogoPicker({
    name,
    current,
    label,
    icon,
    required,
    error,
}: {
    name: string;
    current?: string | null;
    label: string;
    icon: IconName;
    required?: boolean;
    error?: string;
}) {
    const [preview, setPreview] = useState<string | null>(current ?? null);
    const input = useRef<HTMLInputElement>(null);

    // Tanlangan faylning vaqtinchalik manzilini tozalaymiz
    useEffect(() => {
        return () => {
            if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    return (
        <div className="flex items-center gap-4">
            <button
                type="button"
                onClick={() => input.current?.click()}
                className={cn(
                    "group relative grid size-20 shrink-0 place-items-center overflow-hidden rounded-2xl border border-dashed bg-surface text-faint transition-colors hover:border-accent hover:text-accent",
                    error ? "border-warn" : "border-line",
                )}
            >
                {preview ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={preview} alt="" className="size-full object-cover" />
                ) : (
                    <Icon name={icon} size={26} strokeWidth={1.5} />
                )}
                <span className="absolute inset-x-0 bottom-0 bg-black/55 py-1 text-center text-[10.5px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                    {preview ? "Almashtirish" : "Tanlash"}
                </span>
            </button>

            <div className="min-w-0 text-[12.5px] leading-relaxed text-muted">
                <p className="text-[13px] font-medium text-text">
                    {label}
                    {required && <span className="ml-0.5 text-warn">*</span>}
                </p>
                <p>PNG yoki JPG, 5 MB gacha. Kvadrat rasm yaxshi chiqadi.</p>
                {error && (
                    <p className="mt-1 flex items-center gap-1.5 font-medium text-warn-text">
                        <Icon name="alert" size={13} />
                        {error}
                    </p>
                )}
            </div>

            <input
                ref={input}
                type="file"
                name={name}
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={(event) => {
                    const file = event.target.files?.[0];
                    setPreview(file ? URL.createObjectURL(file) : (current ?? null));
                }}
            />
        </div>
    );
}

/**
 * Biznes rasmlari. Yangi tanlanganlar hali yuklanmagan — ular `files`
 * orqali ota formaga beriladi va biznes saqlangach yuboriladi.
 * Mavjud rasmlarni (kabinetda) shu yerning o'zida o'chirish mumkin.
 */
export function GalleryPicker({
    existing = [],
    files,
    onFiles,
    onDelete,
    limit = 8,
    error,
}: {
    existing?: GalleryImage[];
    files: File[];
    onFiles: (files: File[]) => void;
    onDelete?: (id: number) => Promise<void>;
    limit?: number;
    error?: string;
}) {
    const input = useRef<HTMLInputElement>(null);
    const [removing, setRemoving] = useState<number | null>(null);

    // Tanlangan fayllarning vaqtinchalik manzillari; ro'yxat almashganda
    // eskilari xotiradan bo'shatiladi
    const previews = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);
    useEffect(() => () => previews.forEach((url) => URL.revokeObjectURL(url)), [previews]);

    const room = limit - existing.length - files.length;

    return (
        <div>
            <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
                {existing.map((image) => (
                    <div
                        key={image.id}
                        className={cn(
                            "group relative aspect-square overflow-hidden rounded-xl border border-line bg-surface",
                            removing === image.id && "opacity-50",
                        )}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={image.url} alt="" className="size-full object-cover" />
                        {onDelete && (
                            <button
                                type="button"
                                title="O'chirish"
                                disabled={removing === image.id}
                                onClick={async () => {
                                    setRemoving(image.id);
                                    try {
                                        await onDelete(image.id);
                                    } finally {
                                        setRemoving(null);
                                    }
                                }}
                                className="absolute right-1.5 top-1.5 grid size-7 place-items-center rounded-lg bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                            >
                                <Icon name="trash" size={13} />
                            </button>
                        )}
                    </div>
                ))}

                {previews.map((url, index) => (
                    <div
                        key={url}
                        className="group relative aspect-square overflow-hidden rounded-xl border border-accent/40 bg-surface"
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="" className="size-full object-cover" />
                        <span className="absolute left-1.5 top-1.5 rounded-md bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-white">
                            Yangi
                        </span>
                        <button
                            type="button"
                            title="Olib tashlash"
                            onClick={() => onFiles(files.filter((_, i) => i !== index))}
                            className="absolute right-1.5 top-1.5 grid size-7 place-items-center rounded-lg bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                        >
                            <Icon name="close" size={13} />
                        </button>
                    </div>
                ))}

                {room > 0 && (
                    <button
                        type="button"
                        onClick={() => input.current?.click()}
                        className={cn(
                            "grid aspect-square place-items-center rounded-xl border border-dashed text-faint transition-colors hover:border-accent hover:bg-accent-soft hover:text-accent",
                            error ? "border-warn" : "border-line",
                        )}
                    >
                        <span className="grid place-items-center gap-1 text-[11.5px]">
                            <Icon name="plus" size={20} />
                            Rasm qo&apos;shish
                        </span>
                    </button>
                )}
            </div>

            {error ? (
                <p className="mt-2.5 flex items-center gap-1.5 text-[12.5px] font-medium text-warn-text">
                    <Icon name="alert" size={13} />
                    {error}
                </p>
            ) : (
                <p className="mt-2.5 text-[12px] text-faint">
                    {existing.length + files.length} / {limit} — kamida bitta: ish joyi, mahsulot
                    yoki jamoa. Har biri 5 MB gacha.
                </p>
            )}

            <input
                ref={input}
                type="file"
                multiple
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={(event) => {
                    const picked = Array.from(event.target.files ?? []).slice(0, room);
                    onFiles([...files, ...picked]);
                    event.target.value = "";
                }}
            />
        </div>
    );
}

/** Django xatolarini `{maydon: "birinchi xabar"}` ko'rinishiga keltiradi. */
export function toFieldErrors(payload: unknown): { fields: FieldErrors; general: string | null } {
    const fields: FieldErrors = {};
    let general: string | null = null;

    if (payload && typeof payload === "object") {
        for (const [key, value] of Object.entries(payload as Record<string, unknown>)) {
            const message = Array.isArray(value) ? String(value[0]) : String(value);
            if (key === "detail" || key === "non_field_errors") general = message;
            else fields[key] = message;
        }
    }

    if (!general && Object.keys(fields).length === 0) general = "Saqlab bo'lmadi.";
    return { fields, general };
}

/**
 * Formadan `FormData` yig'adi.
 *
 * Bo'sh fayl maydonlari tashlab yuboriladi — aks holda tahrirlashda mavjud
 * logo o'chib ketadi. `skipEmpty` dagi maydonlar ham bo'sh bo'lsa
 * yuborilmaydi (masalan, bo'sh qoldirib bo'lmaydigan raqamlar).
 */
export function collectForm(form: HTMLFormElement, skipEmpty: string[] = []) {
    const data = new FormData(form);
    for (const [key, value] of [...data.entries()]) {
        if (value instanceof File && value.size === 0) data.delete(key);
        else if (skipEmpty.includes(key) && String(value).trim() === "") data.delete(key);
    }
    return data;
}

/** Saqlash tugmasi. */
export function SubmitBar({
    busy,
    label,
    error,
    children,
}: {
    busy: boolean;
    label: string;
    error: string | null;
    children?: ReactNode;
}) {
    return (
        <div className="space-y-4">
            <AnimatePresence>
                {error && (
                    <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-start gap-2.5 rounded-xl bg-warn-soft px-4 py-3 text-[13.5px] text-warn-text"
                    >
                        <Icon name="alert" size={16} className="mt-0.5 shrink-0" />
                        {error}
                    </motion.p>
                )}
            </AnimatePresence>

            <div className="flex flex-wrap items-center gap-3">
                <button
                    type="submit"
                    disabled={busy}
                    className="inline-flex items-center gap-2 rounded-full bg-invert px-6 py-3 text-[14.5px] font-semibold text-on-invert transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                    {busy && (
                        <span className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
                    )}
                    {busy ? "Saqlanmoqda…" : label}
                    {!busy && <Icon name="arrowRight" size={15} />}
                </button>
                {children}
            </div>
        </div>
    );
}
