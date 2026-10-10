"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";

import { Icon } from "@/components/icon";
import { Img } from "@/components/img";
import { DeleteAllButton } from "@/components/panel/delete-all";
import { cn } from "@/lib/cn";
import { formatShortDate, toTashkentInput } from "@/lib/format";
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
    video_url: string | null;
    photos: { id: number; url: string }[];
    author_name: string;
    author_display: string;
    published_at: string;
    is_published: boolean;
    is_featured: boolean;
    views: number;
};

/** Backend bilan bir xil cheklovlar */
const VIDEO_MAX_MB = 25;
const PHOTO_LIMIT = 20;

type Sent = { ok: boolean; payload: Record<string, string[] | string> | null };

/** Fayllar katta bo'lishi mumkin — yuklanish foizini ko'rsatish uchun XHR. */
function send(url: string, method: string, body: FormData, onProgress: (percent: number) => void) {
    return new Promise<Sent>((resolve, reject) => {
        const request = new XMLHttpRequest();
        request.open(method, url);
        request.upload.onprogress = (event) => {
            if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
        };
        request.onload = () => {
            let payload = null;
            try {
                payload = request.responseText ? JSON.parse(request.responseText) : null;
            } catch {
                payload = null;
            }
            resolve({ ok: request.status >= 200 && request.status < 300, payload });
        };
        request.onerror = () => reject(new Error("network"));
        request.send(body);
    });
}

/** Sana maydoni uchun: ISO -> `2026-09-09T14:30` (Toshkent vaqti). */
const toLocalInput = (value: string) => toTashkentInput(value);


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
                                        <Img
                                            src={item.image_url}
                                            sizes="64px"
                                            maxWidth={256}
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
    const [progress, setProgress] = useState<number | null>(null);

    // Qo'shimcha rasmlar: mavjudlaridan o'chiriladiganlar va yangi tanlanganlar
    const [removing, setRemoving] = useState<number[]>([]);
    const [added, setAdded] = useState<{ file: File; url: string }[]>([]);
    const kept = (item?.photos.length ?? 0) - removing.length;
    const room = PHOTO_LIMIT - kept - added.length;

    // Video: yangisi tanlansa — almashadi, «olib tashlash» belgilansa — o'chadi
    const [video, setVideo] = useState<File | null>(null);
    const [removeVideo, setRemoveVideo] = useState(false);

    function pickPhotos(files: FileList | null) {
        if (!files?.length) return;
        const list = [...files].filter((file) => file.type.startsWith("image/"));
        setError(
            list.length > room
                ? `Ko'pi bilan ${PHOTO_LIMIT} ta rasm — yana ${Math.max(room, 0)} ta qo'shish mumkin.`
                : null,
        );
        setAdded((current) => [
            ...current,
            ...list.slice(0, Math.max(room, 0)).map((file) => ({ file, url: URL.createObjectURL(file) })),
        ]);
    }

    function pickVideo(file: File | undefined) {
        if (!file) return;
        if (file.size > VIDEO_MAX_MB * 1024 * 1024) {
            const size = (file.size / 1024 / 1024).toFixed(1);
            setError(`Video ${VIDEO_MAX_MB} MB dan oshmasin (tanlangani ${size} MB).`);
            return;
        }
        setError(null);
        setVideo(file);
        setRemoveVideo(false);
    }

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (busy) return;

        const form = event.currentTarget;
        const data = new FormData(form);

        // Rasm tanlanmagan bo'lsa maydonni umuman yubormaymiz —
        // aks holda tahrirlashda mavjud rasm o'chib ketadi.
        const file = data.get("image");
        if (file instanceof File && file.size === 0) data.delete("image");

        for (const photo of added) data.append("new_photos", photo.file);
        for (const id of removing) data.append("remove_photos", String(id));
        if (video) data.append("video", video);
        else if (removeVideo) data.append("remove_video", "true");

        setBusy(true);
        setError(null);
        setProgress(0);

        try {
            const { ok, payload } = await send(
                item ? `/api/proxy/panel/news/${item.id}/tahrir` : "/api/proxy/panel/news",
                item ? "PATCH" : "POST",
                data,
                setProgress,
            );

            if (!ok) {
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
            setProgress(null);
        }
    }

    const existingVideo = item?.video_url && !removeVideo && !video ? item.video_url : null;

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

                {/* ---------------------------------------- qo'shimcha rasmlar */}
                <div className="md:col-span-2">
                    <span className="mb-1.5 flex items-center justify-between text-[12.5px] text-muted">
                        <span>Qo&apos;shimcha rasmlar (fotolavha)</span>
                        <span className="tabular-nums text-faint">
                            {kept + added.length} / {PHOTO_LIMIT}
                        </span>
                    </span>
                    <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5 lg:grid-cols-6">
                        {item?.photos.map((photo) => {
                            const gone = removing.includes(photo.id);
                            return (
                                <div
                                    key={photo.id}
                                    className={cn(
                                        "relative aspect-square overflow-hidden rounded-xl border border-line bg-page",
                                        gone && "opacity-35",
                                    )}
                                >
                                    <Img src={photo.url} sizes="120px" maxWidth={256} className="size-full object-cover" />
                                    <button
                                        type="button"
                                        title={gone ? "Qaytarish" : "O'chirish"}
                                        aria-label={gone ? "Qaytarish" : "O'chirish"}
                                        onClick={() =>
                                            setRemoving((current) =>
                                                gone ? current.filter((id) => id !== photo.id) : [...current, photo.id],
                                            )
                                        }
                                        className="absolute right-1.5 top-1.5 grid size-7 place-items-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
                                    >
                                        <Icon name={gone ? "plus" : "close"} size={13} />
                                    </button>
                                </div>
                            );
                        })}
                        {added.map((photo, index) => (
                            <div
                                key={photo.url}
                                className="relative aspect-square overflow-hidden rounded-xl border border-accent/50 bg-page"
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={photo.url} alt="" className="size-full object-cover" />
                                <span className="absolute bottom-1.5 left-1.5 rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-medium text-white">
                                    yangi
                                </span>
                                <button
                                    type="button"
                                    aria-label="Olib tashlash"
                                    onClick={() => setAdded((current) => current.filter((_, i) => i !== index))}
                                    className="absolute right-1.5 top-1.5 grid size-7 place-items-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
                                >
                                    <Icon name="close" size={13} />
                                </button>
                            </div>
                        ))}
                        {room > 0 && (
                            <label className="grid aspect-square cursor-pointer place-items-center rounded-xl border border-dashed border-line bg-page text-center text-faint transition-colors hover:border-accent hover:text-accent">
                                <span className="flex flex-col items-center gap-1 text-[11.5px]">
                                    <Icon name="plus" size={18} />
                                    Rasm qo&apos;shish
                                </span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="sr-only"
                                    onChange={(event) => {
                                        pickPhotos(event.target.files);
                                        event.target.value = "";
                                    }}
                                />
                            </label>
                        )}
                    </div>
                    <p className="mt-1.5 text-[11.5px] text-faint">
                        Bir nechtasini birdan tanlash mumkin. Har biri 10 MB gacha.
                    </p>
                </div>

                {/* ---------------------------------------- video */}
                <div className="md:col-span-2">
                    <span className="mb-1.5 block text-[12.5px] text-muted">Video (ixtiyoriy)</span>
                    <div className="flex flex-col gap-3 rounded-xl border border-line bg-page p-3 sm:flex-row sm:items-center">
                        {existingVideo ? (
                            <video
                                src={existingVideo}
                                controls
                                preload="metadata"
                                className="aspect-video w-full rounded-lg bg-black sm:w-56"
                            />
                        ) : (
                            <span className="grid aspect-video w-full place-items-center rounded-lg bg-surface text-faint sm:w-56">
                                {video ? (
                                    <span className="px-3 text-center text-[12px] text-text">
                                        {video.name}
                                        <span className="mt-0.5 block text-faint">
                                            {(video.size / 1024 / 1024).toFixed(1)} MB
                                        </span>
                                    </span>
                                ) : (
                                    <Icon name="image" size={22} />
                                )}
                            </span>
                        )}

                        <div className="flex flex-1 flex-col gap-2">
                            <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-full border border-line bg-raised px-4 py-2 text-[12.5px] transition-colors hover:bg-surface">
                                <Icon name="plus" size={14} />
                                {item?.video_url || video ? "Boshqa video tanlash" : "Video tanlash"}
                                <input
                                    type="file"
                                    accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov,.m4v"
                                    className="sr-only"
                                    onChange={(event) => {
                                        pickVideo(event.target.files?.[0]);
                                        event.target.value = "";
                                    }}
                                />
                            </label>
                            {video && (
                                <button
                                    type="button"
                                    onClick={() => setVideo(null)}
                                    className="w-fit text-[12.5px] text-muted hover:text-text"
                                >
                                    Tanlovni bekor qilish
                                </button>
                            )}
                            {item?.video_url && !video && (
                                <label className="inline-flex w-fit cursor-pointer items-center gap-2 text-[12.5px] text-muted">
                                    <input
                                        type="checkbox"
                                        checked={removeVideo}
                                        onChange={(event) => setRemoveVideo(event.target.checked)}
                                    />
                                    Videoni olib tashlash
                                </label>
                            )}
                            <p className="text-[11.5px] text-faint">
                                MP4, WEBM yoki MOV — {VIDEO_MAX_MB} MB gacha.
                            </p>
                        </div>
                    </div>
                </div>
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
                    {busy
                        ? progress !== null && progress < 100
                            ? `Yuklanmoqda… ${progress}%`
                            : "Saqlanmoqda…"
                        : item
                          ? "Saqlash"
                          : "Qo'shish"}
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
