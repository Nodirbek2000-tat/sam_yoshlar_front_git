"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";

import { Icon, type IconName } from "@/components/icon";
import {
    EmptyState,
    Flash,
    IconAction,
    PanelHeader,
    refreshPublic,
} from "@/components/panel/ui";
import { cn } from "@/lib/cn";
import { toneClass } from "@/lib/tone";

/**
 * Kontent bo'limlari uchun umumiy boshqaruv: ro'yxat + qo'shish/tahrirlash.
 *
 * Tadbirlar va e'lonlar shu komponentdan foydalanadi. Formaning ichini
 * har bir bo'lim o'zi beradi (`renderForm`), qolgan hammasi umumiy:
 * yuborish, xatolar, kesh tozalash va o'chirish.
 */

export type ContentRow = { id: number; visible: boolean };

export function ContentManager<T extends ContentRow>({
    resource,
    tag,
    title,
    description,
    addLabel,
    emptyText,
    icon,
    items,
    render,
    renderForm,
    hideLabel,
    showLabel,
}: {
    /** Backend bo'limi: `events` yoki `announcements`. */
    resource: string;
    /** Kesh yorlig'i — ochiq sahifalarni yangilash uchun. */
    tag: string;
    title: string;
    description: string;
    addLabel: string;
    emptyText: string;
    icon: IconName;
    items: T[];
    render: (item: T) => {
        title: string;
        badges?: ReactNode;
        meta?: ReactNode;
        icon?: string;
        image?: string | null;
        href?: string;
    };
    renderForm: (item: T | null) => ReactNode;
    hideLabel: string;
    showLabel: string;
}) {
    const router = useRouter();
    const [editing, setEditing] = useState<T | "new" | null>(null);
    const [busyId, setBusyId] = useState<number | null>(null);
    const [flash, setFlash] = useState<string | null>(null);

    async function toggleVisible(item: T) {
        setBusyId(item.id);
        try {
            const response = await fetch(`/api/proxy/panel/${resource}/${item.id}/holat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ visible: !item.visible }),
            });
            if (response.ok) {
                await refreshPublic(tag);
                setFlash(item.visible ? "Yashirildi." : "Saytda ko'rinadi.");
                router.refresh();
            }
        } finally {
            setBusyId(null);
        }
    }

    async function remove(item: T) {
        if (!confirm(`«${render(item).title}» o'chirilsinmi?`)) return;

        setBusyId(item.id);
        try {
            const response = await fetch(`/api/proxy/panel/${resource}/${item.id}`, {
                method: "DELETE",
            });
            if (response.ok) {
                await refreshPublic(tag);
                setFlash("O'chirildi.");
                router.refresh();
            }
        } finally {
            setBusyId(null);
        }
    }

    return (
        <>
            <PanelHeader
                title={title}
                description={description}
                action={
                    <button
                        type="button"
                        onClick={() => setEditing(editing === "new" ? null : "new")}
                        className="inline-flex items-center gap-2 rounded-full bg-invert px-4 py-2 text-[13.5px] font-medium text-on-invert transition-opacity hover:opacity-90"
                    >
                        <Icon name={editing === "new" ? "close" : "plus"} size={15} />
                        {editing === "new" ? "Bekor qilish" : addLabel}
                    </button>
                }
            />

            <Flash text={flash} onDone={() => setFlash(null)} />

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
                        <ContentForm
                            resource={resource}
                            tag={tag}
                            item={editing === "new" ? null : editing}
                            onDone={(message) => {
                                setEditing(null);
                                setFlash(message);
                                router.refresh();
                            }}
                            onCancel={() => setEditing(null)}
                        >
                            {renderForm(editing === "new" ? null : editing)}
                        </ContentForm>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="mt-8">
                <h2 className="text-[12px] font-medium uppercase tracking-[0.1em] text-faint">
                    {items.length} ta yozuv
                </h2>

                {items.length ? (
                    <ul className="mt-3 space-y-2.5">
                        {items.map((item) => {
                            const view = render(item);

                            return (
                                <li
                                    key={item.id}
                                    className={cn(
                                        toneClass(view.icon ?? resource),
                                        "flex flex-col gap-4 rounded-2xl border border-line bg-raised p-4 sm:flex-row sm:items-center",
                                        busyId === item.id && "opacity-60",
                                        !item.visible && "border-dashed",
                                    )}
                                >
                                    <span className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl border border-tone-line bg-tone-soft text-tone-text">
                                        {view.image ? (
                                            /* eslint-disable-next-line @next/next/no-img-element */
                                            <img
                                                src={view.image}
                                                alt=""
                                                className="size-full object-cover"
                                            />
                                        ) : (
                                            <Icon name={icon} size={20} />
                                        )}
                                    </span>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            {view.badges}
                                            {!item.visible && (
                                                <span className="rounded-full bg-surface px-2.5 py-0.5 text-[11px] text-faint">
                                                    Yashirilgan
                                                </span>
                                            )}
                                        </div>

                                        <p className="mt-1.5 truncate text-[14.5px] font-medium">
                                            {view.title}
                                        </p>
                                        {view.meta && (
                                            <p className="mt-1 flex flex-wrap items-center gap-x-3 text-[12px] text-faint">
                                                {view.meta}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex shrink-0 items-center gap-1.5">
                                        <IconAction
                                            icon={item.visible ? "eyeOff" : "eye"}
                                            title={item.visible ? hideLabel : showLabel}
                                            disabled={busyId === item.id}
                                            onClick={() => toggleVisible(item)}
                                        />
                                        <IconAction
                                            icon="settings"
                                            title="Tahrirlash"
                                            onClick={() => setEditing(item)}
                                        />
                                        {view.href && (
                                            <Link
                                                href={view.href}
                                                target="_blank"
                                                title="Saytda ochish"
                                                className="grid size-9 shrink-0 place-items-center rounded-lg border border-line text-muted transition-colors hover:bg-surface hover:text-text"
                                            >
                                                <Icon name="arrowRight" size={15} />
                                            </Link>
                                        )}
                                        <IconAction
                                            icon="trash"
                                            title="O'chirish"
                                            danger
                                            disabled={busyId === item.id}
                                            onClick={() => remove(item)}
                                        />
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <EmptyState text={emptyText} />
                )}
            </div>
        </>
    );
}

/** Formani yuborish: bo'sh fayl maydonlari olib tashlanadi, xato ko'rsatiladi. */
function ContentForm({
    resource,
    tag,
    item,
    onDone,
    onCancel,
    children,
}: {
    resource: string;
    tag: string;
    item: ContentRow | null;
    onDone: (message: string) => void;
    onCancel: () => void;
    children: ReactNode;
}) {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (busy) return;

        const data = new FormData(event.currentTarget);

        // Fayl tanlanmagan bo'lsa maydonni yubormaymiz — aks holda
        // tahrirlashda mavjud fayl o'chib ketadi.
        for (const [key, value] of [...data.entries()]) {
            if (value instanceof File && value.size === 0) data.delete(key);
        }

        setBusy(true);
        setError(null);

        try {
            const response = await fetch(
                item
                    ? `/api/proxy/panel/${resource}/${item.id}/tahrir`
                    : `/api/proxy/panel/${resource}`,
                { method: item ? "PATCH" : "POST", body: data },
            );

            if (!response.ok) {
                const payload = (await response.json().catch(() => null)) as Record<
                    string,
                    string[] | string
                > | null;
                const first = payload ? Object.values(payload)[0] : null;
                setError(
                    Array.isArray(first) ? first[0] : ((first as string) ?? "Saqlab bo'lmadi."),
                );
                return;
            }

            await refreshPublic(tag);
            onDone(item ? "Saqlandi." : "Qo'shildi.");
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
            {children}

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
