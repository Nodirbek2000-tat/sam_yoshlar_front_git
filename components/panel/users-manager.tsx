"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Icon } from "@/components/icon";
import { EmptyState, Flash, PanelHeader, SearchBox } from "@/components/panel/ui";
import { UserDrawer } from "@/components/panel/user-drawer";
import { cn } from "@/lib/cn";
import { formatShortDate } from "@/lib/format";
import type { Choice } from "@/lib/types";

export type PanelUser = {
    id: number;
    full_name: string;
    email: string;
    phone: string;
    role: string;
    role_display: string;
    region_display: string;
    initials: string;
    is_verified: boolean;
    is_admin: boolean;
    telegram_username: string;
    /** Ro'yxatdan o'tishning qolgan qadami */
    onboarding: string | null;
    /** Tadbirkor/startupper anketasining holati */
    profile_status: "pending" | "approved" | "rejected" | null;
    created_at: string;
};

const PROFILE_BADGE: Record<string, { tone: string; label: string }> = {
    pending: { tone: "tone-amber", label: "Anketa tekshiruvda" },
    approved: { tone: "tone-emerald", label: "Anketa tasdiqlangan" },
    rejected: { tone: "tone-rose", label: "Anketa qaytarilgan" },
};

/** Rolga qarab rang — ro'yxatda kim kimligi bir qarashda ko'rinsin. */
const ROLE_TONE: Record<string, string> = {
    yosh: "tone-blue",
    entrepreneur: "tone-amber",
    startupper: "tone-violet",
    organization: "tone-emerald",
    admin: "tone-rose",
};

export function UsersManager({
    users,
    roles = [],
    page,
    pages,
    role,
    review = false,
    pendingProfiles = 0,
}: {
    users: PanelUser[];
    roles?: Choice[];
    page: number;
    pages: number;
    role?: string;
    /** Faqat anketasi tekshiruv kutayotganlar */
    review?: boolean;
    pendingProfiles?: number;
}) {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [busyId, setBusyId] = useState<number | null>(null);
    const [flash, setFlash] = useState<string | null>(null);
    const [openId, setOpenId] = useState<number | null>(null);

    const rows = query.trim()
        ? users.filter((user) =>
              `${user.full_name} ${user.email}`.toLowerCase().includes(query.trim().toLowerCase()),
          )
        : users;

    async function toggleAdmin(user: PanelUser) {
        const action = user.is_admin ? "olib tashlansinmi" : "berilsinmi";
        if (!confirm(`${user.full_name} uchun admin huquqi ${action}?`)) return;

        setBusyId(user.id);
        try {
            const response = await fetch(`/api/proxy/panel/users/${user.id}/admin`, {
                method: "POST",
            });
            if (response.ok) {
                setFlash(user.is_admin ? "Admin huquqi olindi." : "Admin huquqi berildi.");
                router.refresh();
            } else {
                const data = (await response.json().catch(() => null)) as { detail?: string } | null;
                setFlash(data?.detail ?? "Bajarib bo'lmadi.");
            }
        } finally {
            setBusyId(null);
        }
    }

    return (
        <>
            <PanelHeader
                title="Foydalanuvchilar"
                description="Ro'yxatdan o'tganlar: anketasini ko'rib chiqing, tasdiqlang yoki o'chiring."
                action={
                    pendingProfiles > 0 && !review ? (
                        <Link
                            href="/nazorat/foydalanuvchilar?tekshiruv=1"
                            className="tone-amber inline-flex items-center gap-2 rounded-full border border-tone-line bg-tone-soft px-4 py-2 text-[13px] font-medium text-tone-text transition-opacity hover:opacity-90"
                        >
                            <Icon name="alert" size={14} />
                            {pendingProfiles} ta anketa tekshiruvda
                        </Link>
                    ) : undefined
                }
            />

            <Flash text={flash} onDone={() => setFlash(null)} />

            <div className="mt-6 flex flex-wrap items-center gap-3">
                <SearchBox value={query} onChange={setQuery} placeholder="Ism yoki email" />

                <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <RoleChip
                        href="/nazorat/foydalanuvchilar"
                        active={!role && !review}
                        label="Barchasi"
                    />
                    <RoleChip
                        href="/nazorat/foydalanuvchilar?tekshiruv=1"
                        active={review}
                        label={`Tekshiruvda${pendingProfiles ? ` · ${pendingProfiles}` : ""}`}
                        tone="tone-amber"
                    />
                    {roles.map((item) => (
                        <RoleChip
                            key={item.value}
                            href={`/nazorat/foydalanuvchilar?rol=${item.value}`}
                            active={role === item.value}
                            label={item.label}
                            tone={ROLE_TONE[item.value]}
                        />
                    ))}
                </div>
            </div>

            {rows.length ? (
                <ul className="mt-5 space-y-2.5">
                    {rows.map((user) => (
                        <li
                            key={user.id}
                            className={cn(
                                ROLE_TONE[user.role] ?? "tone-slate",
                                "flex flex-col gap-4 rounded-2xl border border-line bg-raised p-4 sm:flex-row sm:items-center",
                                busyId === user.id && "opacity-60",
                            )}
                        >
                            <button
                                type="button"
                                onClick={() => setOpenId(user.id)}
                                className="flex min-w-0 flex-1 items-center gap-4 text-left"
                            >
                            <span className="grid size-11 shrink-0 place-items-center rounded-full border border-tone-line bg-tone-soft text-[12.5px] font-semibold text-tone-text">
                                {user.initials}
                            </span>

                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="rounded-full bg-tone-soft px-2.5 py-0.5 text-[11px] font-medium text-tone-text">
                                        {user.role_display}
                                    </span>
                                    {user.is_admin && (
                                        <span className="tone-rose rounded-full bg-tone-soft px-2.5 py-0.5 text-[11px] font-medium text-tone-text">
                                            Admin
                                        </span>
                                    )}
                                    {user.profile_status && PROFILE_BADGE[user.profile_status] && (
                                        <span
                                            className={cn(
                                                PROFILE_BADGE[user.profile_status].tone,
                                                "rounded-full bg-tone-soft px-2.5 py-0.5 text-[11px] font-medium text-tone-text",
                                            )}
                                        >
                                            {PROFILE_BADGE[user.profile_status].label}
                                        </span>
                                    )}
                                    {user.onboarding && (
                                        <span className="rounded-full bg-surface px-2.5 py-0.5 text-[11px] text-faint">
                                            Ro&apos;yxatni tugatmagan
                                        </span>
                                    )}
                                </div>

                                <p className="mt-1.5 truncate text-[14.5px] font-medium">
                                    {user.full_name || "Ismi yo'q"}
                                </p>
                                <p className="mt-1 flex flex-wrap items-center gap-x-3 text-[12px] text-faint">
                                    <span className="truncate">{user.email}</span>
                                    {user.phone && <span>{user.phone}</span>}
                                    {user.telegram_username && <span>@{user.telegram_username}</span>}
                                    {user.region_display && <span>{user.region_display}</span>}
                                    <span>{formatShortDate(user.created_at)}</span>
                                </p>
                            </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => setOpenId(user.id)}
                                className="inline-flex shrink-0 items-center gap-2 rounded-full border border-line px-3.5 py-2 text-[12.5px] text-muted transition-colors hover:bg-surface hover:text-text"
                            >
                                <Icon name="eye" size={14} />
                                Ko&apos;rish
                            </button>

                            <button
                                type="button"
                                onClick={() => toggleAdmin(user)}
                                disabled={busyId === user.id}
                                className={cn(
                                    "inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-[12.5px] transition-colors disabled:opacity-50",
                                    user.is_admin
                                        ? "border-line text-muted hover:bg-warn-soft hover:text-warn-text"
                                        : "border-line text-muted hover:bg-surface hover:text-text",
                                )}
                            >
                                <Icon name={user.is_admin ? "ban" : "shield"} size={14} />
                                {user.is_admin ? "Adminlikni olish" : "Admin qilish"}
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <EmptyState text={query ? "Qidiruv bo'yicha topilmadi." : "Foydalanuvchi yo'q."} />
            )}

            <UserDrawer
                userId={openId}
                onClose={() => setOpenId(null)}
                onChanged={(message) => {
                    setFlash(message);
                    router.refresh();
                }}
                onDeleted={(message) => {
                    setOpenId(null);
                    setFlash(message);
                    router.refresh();
                }}
            />

            {pages > 1 && (
                <nav className="mt-6 flex items-center justify-center gap-2">
                    <PageLink
                        href={pageHref(page - 1, role, review)}
                        disabled={page <= 1}
                        label="Oldingi"
                        icon="arrowLeft"
                    />
                    <span className="text-[13px] tabular-nums text-muted">
                        {page} / {pages}
                    </span>
                    <PageLink
                        href={pageHref(page + 1, role, review)}
                        disabled={page >= pages}
                        label="Keyingi"
                        icon="arrowRight"
                    />
                </nav>
            )}
        </>
    );
}

function pageHref(page: number, role?: string, review?: boolean) {
    const params = new URLSearchParams();
    if (page > 1) params.set("sahifa", String(page));
    if (role) params.set("rol", role);
    if (review) params.set("tekshiruv", "1");
    const query = params.toString();
    return `/nazorat/foydalanuvchilar${query ? `?${query}` : ""}`;
}

function PageLink({
    href,
    disabled,
    label,
    icon,
}: {
    href: string;
    disabled: boolean;
    label: string;
    icon: "arrowLeft" | "arrowRight";
}) {
    if (disabled) {
        return (
            <span className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-full border border-line px-3.5 py-1.5 text-[12.5px] text-faint opacity-50">
                {icon === "arrowLeft" && <Icon name={icon} size={13} />}
                {label}
                {icon === "arrowRight" && <Icon name={icon} size={13} />}
            </span>
        );
    }

    return (
        <Link
            href={href}
            className="inline-flex items-center gap-1.5 rounded-full border border-line px-3.5 py-1.5 text-[12.5px] text-muted transition-colors hover:bg-surface hover:text-text"
        >
            {icon === "arrowLeft" && <Icon name={icon} size={13} />}
            {label}
            {icon === "arrowRight" && <Icon name={icon} size={13} />}
        </Link>
    );
}

function RoleChip({
    href,
    active,
    label,
    tone,
}: {
    href: string;
    active: boolean;
    label: string;
    tone?: string;
}) {
    return (
        <Link
            href={href}
            scroll={false}
            className={cn(
                tone ?? "tone-slate",
                "shrink-0 rounded-full border px-3.5 py-2 text-[12.5px] transition-colors",
                active
                    ? "border-tone-line bg-tone-soft font-medium text-tone-text"
                    : "border-line text-muted hover:bg-tone-soft hover:text-tone-text",
            )}
        >
            {label}
        </Link>
    );
}
