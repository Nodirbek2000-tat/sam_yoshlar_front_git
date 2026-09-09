"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";

import { Icon, type IconName } from "@/components/icon";
import {
    EmptyState,
    Flash,
    IconAction,
    PanelHeader,
    SearchBox,
    StatusPill,
    refreshPublic,
} from "@/components/panel/ui";
import { cn } from "@/lib/cn";
import { toneClass } from "@/lib/tone";

/** Panel ro'yxatidagi bitta yozuv — bo'limlar uchun umumiy shakl. */
export type ResourceRow = {
    id: number;
    status: string | null;
    visible: boolean;
};

export type RowView = {
    title: string;
    subtitle?: ReactNode;
    meta?: ReactNode;
    icon?: string;
    href?: string;
};

/**
 * Moderatsiya qilinadigan bo'limlar uchun umumiy ro'yxat:
 * tashabbuslar, muammolar, tengdoshlar, startaplar.
 *
 * Har bir qatorda: tasdiqlash / rad etish, saytda ko'rsatish va o'chirish.
 * Bo'limga xos ustunlarni `render` beradi — shunda kod takrorlanmaydi.
 */
export function ResourceList<T extends ResourceRow>({
    resource,
    title,
    description,
    emptyText,
    searchPlaceholder,
    icon,
    items,
    render,
    extra,
}: {
    /** Backenddagi bo'lim nomi: `initiatives`, `problems`, `peers`, `startups`. */
    resource: string;
    title: string;
    description: string;
    emptyText: string;
    searchPlaceholder: string;
    icon: IconName;
    items: T[];
    render: (item: T) => RowView;
    /** Qatorning o'ng tomoniga qo'shimcha tugma (masalan, ovoz sozlash). */
    extra?: (item: T) => ReactNode;
}) {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [busyId, setBusyId] = useState<number | null>(null);
    const [flash, setFlash] = useState<string | null>(null);

    const rows = useMemo(() => {
        const needle = query.trim().toLowerCase();
        if (!needle) return items;
        return items.filter((item) => render(item).title.toLowerCase().includes(needle));
    }, [items, query, render]);

    const pending = items.filter((item) => item.status === "pending").length;

    async function moderate(item: T, body: Record<string, unknown>, message: string) {
        setBusyId(item.id);
        try {
            const response = await fetch(`/api/proxy/panel/${resource}/${item.id}/holat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            if (response.ok) {
                await refreshPublic(resource);
                setFlash(message);
                router.refresh();
            }
        } finally {
            setBusyId(null);
        }
    }

    async function remove(item: T) {
        const view = render(item);
        if (!confirm(`«${view.title}» o'chirilsinmi?`)) return;

        setBusyId(item.id);
        try {
            const response = await fetch(`/api/proxy/panel/${resource}/${item.id}`, {
                method: "DELETE",
            });
            if (response.ok) {
                await refreshPublic(resource);
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
                    pending > 0 ? (
                        <span className="tone-amber inline-flex items-center gap-2 rounded-full bg-tone-soft px-3.5 py-1.5 text-[13px] font-medium text-tone-text">
                            <Icon name="alert" size={14} />
                            {pending} ta kutilmoqda
                        </span>
                    ) : undefined
                }
            />

            <Flash text={flash} onDone={() => setFlash(null)} />

            <div className="mt-6 flex flex-wrap items-center gap-3">
                <SearchBox value={query} onChange={setQuery} placeholder={searchPlaceholder} />
                <span className="text-[13px] text-faint">{rows.length} ta yozuv</span>
            </div>

            {rows.length ? (
                <ul className="mt-5 space-y-2.5">
                    {rows.map((item) => {
                        const view = render(item);

                        return (
                            <li
                                key={item.id}
                                className={cn(
                                    toneClass(view.icon ?? resource),
                                    "flex flex-col gap-4 rounded-2xl border border-line bg-raised p-4 transition-opacity sm:flex-row sm:items-center",
                                    busyId === item.id && "opacity-60",
                                    !item.visible && "border-dashed",
                                )}
                            >
                                <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-tone-line bg-tone-soft text-tone-text">
                                    <Icon name={icon} size={19} />
                                </span>

                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <StatusPill status={item.status} />
                                        {!item.visible && (
                                            <span className="rounded-full bg-surface px-2.5 py-0.5 text-[11px] text-faint">
                                                Saytda yashirilgan
                                            </span>
                                        )}
                                    </div>

                                    <p className="mt-1.5 line-clamp-2 text-[14.5px] font-medium">
                                        {view.title}
                                    </p>
                                    {view.subtitle && (
                                        <p className="mt-1 line-clamp-1 text-[13px] text-muted">
                                            {view.subtitle}
                                        </p>
                                    )}
                                    {view.meta && (
                                        <p className="mt-1 flex flex-wrap items-center gap-x-3 text-[12px] text-faint">
                                            {view.meta}
                                        </p>
                                    )}
                                </div>

                                <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                                    {extra?.(item)}

                                    {item.status && item.status !== "approved" && (
                                        <IconAction
                                            icon="check"
                                            title="Tasdiqlash"
                                            disabled={busyId === item.id}
                                            onClick={() =>
                                                moderate(item, { status: "approved" }, "Tasdiqlandi.")
                                            }
                                        />
                                    )}
                                    {item.status && item.status !== "rejected" && (
                                        <IconAction
                                            icon="ban"
                                            title="Rad etish"
                                            disabled={busyId === item.id}
                                            onClick={() =>
                                                moderate(item, { status: "rejected" }, "Rad etildi.")
                                            }
                                        />
                                    )}

                                    <IconAction
                                        icon={item.visible ? "eyeOff" : "eye"}
                                        title={item.visible ? "Saytda yashirish" : "Saytda ko'rsatish"}
                                        disabled={busyId === item.id}
                                        onClick={() =>
                                            moderate(
                                                item,
                                                { visible: !item.visible },
                                                item.visible ? "Yashirildi." : "Saytda ko'rinadi.",
                                            )
                                        }
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
                <EmptyState text={query ? "Qidiruv bo'yicha topilmadi." : emptyText} />
            )}
        </>
    );
}
