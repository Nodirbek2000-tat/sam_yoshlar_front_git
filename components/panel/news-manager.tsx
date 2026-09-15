"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";

import { Icon } from "@/components/icon";
import { DeleteAllButton } from "@/components/panel/delete-all";
import { cn } from "@/lib/cn";
import { formatShortDate } from "@/lib/format";
import { toneClass } from "@/lib/tone";
import type { Choice } from "@/lib/types";

export type PanelNews = {
    id: number;
    slug: string;
    title: string;
    category: string;
    category_display: string;
    excerpt: string;
    body: string;
    image_url: string | null;
    author_name: string;
    author_display: string;
    published_at: string;
    is_published: boolean;
    is_featured: boolean;
    views: number;
};

/** Sana maydoni uchun: ISO -> `2026-09-09T14:30`. */
function toLocalInput(value: string) {
    const date = new Date(value);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}


/** Ochiq sahifalar keshini tozalash — o'zgarish saytda darhol ko'rinsin. */
async function refreshPublic() {
    await fetch("/api/revalidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tag: "news" }),
    }).catch(() => null);
}

export function NewsManager({
    news,
    categories,
}: {
    news: PanelNews[];
    categories: Choice[];
}) {
    const router = useRouter();
    const [editing, setEditing] = useState<PanelNews | "new" | null>(null);
    const [busyId, setBusyId] = useState<number | null>(null);
    const [flash, setFlash] = useState<string | null>(null);

    async function remove(item: PanelNews) {
        if (!confirm(`«${item.title}» o'chirilsinmi?`)) return;

        setBusyId(item.id);
        try {
            const response = await fetch(`/api/proxy/panel/news/${item.id}`, {
                method: "DELETE",
            });
            if (response.ok) {
                await refreshPublic();
                setFlash("Yangilik o'chirildi.");
                router.refresh();
            }
        } finally {
            setBusyId(null);
        }
    }

    /** Chop etilgan / qoralama holatini bir bosishda almashtirish. */
    async function togglePublished(item: PanelNews) {
        setBusyId(item.id);
        try {
            const response = await fetch(`/api/proxy/panel/news/${item.id}/tahrir`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ is_published: !item.is_published }),
            });
            if (response.ok) {
                await refreshPublic();
                setFlash(item.is_published ? "Qoralamaga o'tkazildi." : "Chop etildi.");
                router.refresh();
            }
        } finally {
            setBusyId(null);
        }
    }

    return (
        <>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Yangiliklar</h1>
                    <p className="mt-1.5 text-[14px] text-muted">
                        Xabar qo&apos;shing, tahrirlang yoki vaqtincha qoralamaga oling.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                    <DeleteAllButton resource="news" count={news.length} onDeleted={setFlash} />
                    <button
                        type="button"
                        onClick={() => setEditing(editing === "new" ? null : "new")}
                        className="inline-flex items-center gap-2 rounded-full bg-invert px-4 py-2 text-[13.5px] font-medium text-on-invert transition-opacity hover:opacity-90"
                    >
                        <Icon name={editing === "new" ? "close" : "plus"} size={15} />
                        {editing === "new" ? "Bekor qilish" : "Yangilik qo'shish"}
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {flash && (
                    <motion.p
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        onAnimationComplete={() => setTimeout(() => setFlash(null), 2600)}
                        className="tone-emerald mt-5 inline-flex items-center gap-2 rounded-full bg-tone-soft px-4 py-2 text-[13px] text-tone-text"
                    >
                        <Icon name="check" size={14} />
                        {flash}
                    </motion.p>
                )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
                {editing && (
                    <motion.div
                        key={editing === "new" ? "new" : editing.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                    >
                        <NewsForm
                            item={editing === "new" ? null : editing}
                            categories={categories}
                            onDone={async (message) => {
                                setEditing(null);
                                setFlash(message);
                                await refreshPublic();
                                router.refresh();
                            }}
                            onCancel={() => setEditing(null)}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="mt-8">
                <h2 className="text-[12px] font-medium uppercase tracking-[0.1em] text-faint">
                    {news.length} ta xabar
                </h2>

                {news.length ? (
                    <ul className="mt-3 space-y-2.5">
                        {news.map((item) => (
                            <li
                                key={item.id}
                                className={cn(
                                    toneClass(item.category),
                                    "flex flex-col gap-4 rounded-2xl border border-line bg-raised p-4 transition-colors sm:flex-row sm:items-center",
                                    busyId === item.id && "opacity-60",
                                )}
                            >
                                <span className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl border border-tone-line bg-tone-soft text-tone-text">
                                    {item.image_url ? (
                                        /* eslint-disable-next-line @next/next/no-img-element */
                                        <img
                                            src={item.image_url}
                                            alt=""
                                            className="size-full object-cover"
                                        />
                                    ) : (
                                        <Icon name="news" size={20} />
                                    )}
                                </span>

                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="rounded-full bg-tone-soft px-2.5 py-0.5 text-[11px] font-medium text-tone-text">
                                            {item.category_display}
                                        </span>
                                        {!item.is_published && (
                                            <span className="rounded-full bg-surface px-2.5 py-0.5 text-[11px] text-faint">
                                                Qoralama
                                            </span>
                                        )}
                                        {item.is_featured && (
                                            <span className="tone-amber rounded-full bg-tone-soft px-2.5 py-0.5 text-[11px] font-medium text-tone-text">
                                                Asosiy
                                            </span>
                                        )}
                                    </div>

                                    <p className="mt-1.5 truncate text-[14.5px] font-medium">
                                        {item.title}
                                    </p>
                                    <p className="mt-1 flex flex-wrap items-center gap-x-3 text-[12px] text-faint">
                                        <span>{formatShortDate(item.published_at)}</span>
                                        {item.author_display && <span>{item.author_display}</span>}
                                        <span className="inline-flex items-center gap-1">
                                            <Icon name="eye" size={11} />
                                            {item.views}
                                        </span>
                                    </p>
                                </div>

                                <div className="flex shrink-0 items-center gap-1.5">
                                    <IconAction
                                        icon={item.is_published ? "eyeOff" : "eye"}
                                        title={item.is_published ? "Qoralamaga olish" : "Chop etish"}
                                        onClick={() => togglePublished(item)}
                                    />
                                    <IconAction
                                        icon="settings"
                                        title="Tahrirlash"
                                        onClick={() => setEditing(item)}
                                    />
                                    <Link
                                        href={`/yangiliklar/${item.slug}`}
                                        target="_blank"
                                        title="Saytda ochish"
                                        className="grid size-9 place-items-center rounded-lg border border-line text-muted transition-colors hover:bg-surface hover:text-text"
                                    >
                                        <Icon name="arrowRight" size={15} />
                                    </Link>
                                    <IconAction
                                        icon="trash"
                                        title="O'chirish"
                                        danger
                                        onClick={() => remove(item)}
                                    />
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="mt-3 rounded-2xl border border-dashed border-line py-14 text-center text-[14px] text-muted">
                        Hali yangilik yo&apos;q.
                    </p>
                )}
            </div>
        </>
    );
}

function IconAction({
    icon,
    title,
    danger,
    onClick,
}: {
    icon: "eye" | "eyeOff" | "settings" | "trash";
    title: string;
    danger?: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={title}
            aria-label={title}
            className={cn(
                "grid size-9 place-items-center rounded-lg border border-line transition-colors",
                danger
                    ? "text-muted hover:bg-warn-soft hover:text-warn-text"
                    : "text-muted hover:bg-surface hover:text-text",
            )}
        >
            <Icon name={icon} size={15} />
        </button>
    );
}

/* ------------------------------------------------------------------ */

function NewsForm({
    item,
    categories,
    onDone,
    onCancel,
}: {
    item: PanelNews | null;
    categories: Choice[];
    onDone: (message: string) => void | Promise<void>;
    onCancel: () => void;
}) {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [preview, setPreview] = useState<string | null>(item?.image_url ?? null);
    const fileRef = useRef<HTMLInputElement>(null);

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (busy) return;

        const form = event.currentTarget;
        const data = new FormData(form);

        // Rasm tanlanmagan bo'lsa maydonni umuman yubormaymiz —
        // aks holda tahrirlashda mavjud rasm o'chib ketadi.
        const file = data.get("image");
        if (file instanceof File && file.size === 0) data.delete("image");

        setBusy(true);
        setError(null);

        try {
            const response = await fetch(
                item ? `/api/proxy/panel/news/${item.id}/tahrir` : "/api/proxy/panel/news",
                { method: item ? "PATCH" : "POST", body: data },
            );

            if (!response.ok) {
                const payload = (await response.json().catch(() => null)) as Record<
                    string,
                    string[] | string
                > | null;
                const first = payload ? Object.values(payload)[0] : null;
                setError(
                    Array.isArray(first)
                        ? first[0]
                        : ((first as string) ?? "Saqlab bo'lmadi."),
                );
                return;
            }

            onDone(item ? "Yangilik saqlandi." : "Yangilik qo'shildi.");
        } catch {
            setError("Tarmoqda xatolik.");
        } finally {
            setBusy(false);
        }
    }

    return (
        <form
            onSubmit={submit}
            className="mt-6 rounded-2xl border border-line bg-surface p-5 md:p-6"
        >
            <h2 className="text-[15px] font-semibold">
                {item ? "Yangilikni tahrirlash" : "Yangi xabar"}
            </h2>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
                <Field label="Sarlavha" className="md:col-span-2">
                    <input
                        name="title"
                        required
                        defaultValue={item?.title}
                        placeholder="Xabar sarlavhasi"
                        className={INPUT}
                    />
                </Field>

                <Field label="Kategoriya">
                    <select
                        name="category"
                        required
                        defaultValue={item?.category ?? categories[0]?.value}
                        className={INPUT}
                    >
                        {categories.map((choice) => (
                            <option key={choice.value} value={choice.value}>
                                {choice.label}
                            </option>
                        ))}
                    </select>
                </Field>

                <Field label="Chop etish sanasi">
                    <input
                        type="datetime-local"
                        name="published_at"
                        defaultValue={toLocalInput(item?.published_at ?? new Date().toISOString())}
                        className={INPUT}
                    />
                </Field>

                <Field label="Qisqacha (ro'yxatda ko'rinadi)" className="md:col-span-2">
                    <textarea
                        name="excerpt"
                        required
                        rows={2}
                        maxLength={500}
                        defaultValue={item?.excerpt}
                        placeholder="Bir-ikki jumla"
                        className={`${INPUT} resize-y leading-relaxed`}
                    />
                </Field>

                <Field label="To'liq matn" className="md:col-span-2">
                    <textarea
                        name="body"
                        required
                        rows={8}
                        defaultValue={item?.body}
                        placeholder="Har bir xatboshini yangi qatordan yozing"
                        className={`${INPUT} resize-y leading-relaxed`}
                    />
                </Field>

                <Field label="Muallif ismi">
                    <input
                        name="author_name"
                        defaultValue={item?.author_name}
                        placeholder="Bo'sh qoldirsangiz — sizning ismingiz"
                        className={INPUT}
                    />
                </Field>

                <Field label="Rasm">
                    <div className="flex items-center gap-3">
                        <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-lg border border-line bg-page text-faint">
                            {preview ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img src={preview} alt="" className="size-full object-cover" />
                            ) : (
                                <Icon name="news" size={17} />
                            )}
                        </span>

                        <input
                            ref={fileRef}
                            type="file"
                            name="image"
                            accept="image/*"
                            onChange={(event) => {
                                const file = event.target.files?.[0];
                                setPreview(file ? URL.createObjectURL(file) : item?.image_url ?? null);
                            }}
                            className="min-w-0 flex-1 text-[12.5px] text-muted file:mr-3 file:rounded-full file:border file:border-line file:bg-page file:px-3.5 file:py-1.5 file:text-[12.5px] file:text-text hover:file:bg-surface"
                        />
                    </div>
                </Field>
            </div>

            <div className="mt-5 flex flex-wrap gap-5">
                <Check name="is_published" label="Chop etilsin" defaultChecked={item?.is_published ?? true} />
                <Check name="is_featured" label="Asosiy xabar" defaultChecked={item?.is_featured ?? false} />
            </div>

            {error && (
                <p className="mt-4 inline-flex items-start gap-2 rounded-xl bg-warn-soft px-4 py-2.5 text-[13px] text-warn-text">
                    <Icon name="alert" size={15} className="mt-0.5 shrink-0" />
                    {error}
                </p>
            )}

            <div className="mt-6 flex items-center gap-2">
                <button
                    type="submit"
                    disabled={busy}
                    className="inline-flex items-center gap-2 rounded-full bg-invert px-5 py-2.5 text-[13.5px] font-medium text-on-invert transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                    {busy ? "Saqlanmoqda…" : item ? "Saqlash" : "Qo'shish"}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-full border border-line px-5 py-2.5 text-[13.5px] text-muted transition-colors hover:text-text"
                >
                    Bekor qilish
                </button>
            </div>
        </form>
    );
}

const INPUT =
    "w-full rounded-xl border border-line bg-page px-3.5 py-2.5 text-[14px] outline-none transition-colors placeholder:text-faint focus:border-accent";

function Field({
    label,
    className,
    children,
}: {
    label: string;
    className?: string;
    children: React.ReactNode;
}) {
    return (
        <label className={cn("block", className)}>
            <span className="mb-1.5 block text-[12.5px] text-muted">{label}</span>
            {children}
        </label>
    );
}

/** Checkbox — yuborilmasa `false` bo'lishi uchun yashirin maydon bilan. */
function Check({
    name,
    label,
    defaultChecked,
}: {
    name: string;
    label: string;
    defaultChecked: boolean;
}) {
    const [on, setOn] = useState(defaultChecked);

    return (
        <label className="inline-flex cursor-pointer items-center gap-2.5 text-[13.5px]">
            <input type="hidden" name={name} value={on ? "true" : "false"} />
            <button
                type="button"
                role="switch"
                aria-checked={on}
                onClick={() => setOn((value) => !value)}
                className={cn(
                    "relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200",
                    on ? "bg-accent" : "bg-line",
                )}
            >
                <motion.span
                    layout
                    transition={{ type: "spring", stiffness: 500, damping: 32 }}
                    className={cn(
                        "absolute top-0.5 size-4 rounded-full bg-page shadow-sm",
                        on ? "right-0.5" : "left-0.5",
                    )}
                />
            </button>
            {label}
        </label>
    );
}
