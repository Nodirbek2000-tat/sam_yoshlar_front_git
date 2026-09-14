"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

import { Icon, type IconName } from "@/components/icon";
import { refreshPublic } from "@/components/panel/ui";
import { cn } from "@/lib/cn";
import { formatDate, formatNumber } from "@/lib/format";
import type { BusinessProfile, Peer, StartupProfile } from "@/lib/types";

/**
 * Foydalanuvchi kartochkasi — panelning o'ng tomonidan chiqadi.
 *
 * Tadbirkor bo'lsa biznesi va rasmlari, startupper bo'lsa startapi
 * ko'rinadi. Shu yerning o'zida anketani tasdiqlash yoki qaytarish
 * va hisobni butunlay o'chirish mumkin.
 */

type Detail = {
    user: {
        id: number;
        full_name: string;
        email: string;
        phone: string;
        role: string;
        role_display: string;
        region_display: string;
        district: string;
        initials: string;
        is_verified: boolean;
        is_admin: boolean;
        is_superuser: boolean;
        telegram_username: string;
        onboarding: string | null;
        age: number | null;
        study_location_display: string;
        created_at: string;
        last_login: string | null;
    };
    peer: Peer | null;
    business: BusinessProfile | null;
    startups: StartupProfile[];
    activity: { initiatives: number; votes: number; solutions: number; events: number };
};

const ONBOARDING_LABEL: Record<string, string> = {
    role: "Rol tanlamagan",
    business: "Biznes anketasini to'ldirmagan",
    startup: "Startap anketasini to'ldirmagan",
    study: "Qayerda o'qishini tanlamagan",
    peer: "Tengdosh anketasini to'ldirmagan",
};

export function UserDrawer({
    userId,
    onClose,
    onChanged,
    onDeleted,
}: {
    userId: number | null;
    onClose: () => void;
    onChanged: (message: string) => void;
    onDeleted: (message: string) => void;
}) {
    // Esc bilan yopiladi
    useEffect(() => {
        if (userId === null) return;
        const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [userId, onClose]);

    return (
        <AnimatePresence>
            {userId !== null && (
                <>
                    <motion.div
                        key="shade"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
                    />

                    <motion.aside
                        key="drawer"
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", stiffness: 320, damping: 36 }}
                        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col border-l border-line bg-page shadow-2xl"
                        role="dialog"
                        aria-label="Foydalanuvchi"
                    >
                        <header className="flex items-center justify-between border-b border-line px-6 py-4">
                            <span className="text-[13px] font-medium text-muted">Foydalanuvchi</span>
                            <button
                                type="button"
                                onClick={onClose}
                                aria-label="Yopish"
                                className="grid size-9 place-items-center rounded-lg border border-line text-muted transition-colors hover:text-text"
                            >
                                <Icon name="close" size={16} />
                            </button>
                        </header>

                        <div className="flex-1 overflow-y-auto px-6 py-6">
                            {/* `key` — boshqa user ochilganda holat boshidan boshlanadi */}
                            <DrawerBody
                                key={userId}
                                userId={userId}
                                onChanged={onChanged}
                                onDeleted={onDeleted}
                            />
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}

function DrawerBody({
    userId,
    onChanged,
    onDeleted,
}: {
    userId: number;
    onChanged: (message: string) => void;
    onDeleted: (message: string) => void;
}) {
    const [data, setData] = useState<Detail | null>(null);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [note, setNote] = useState("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        fetch(`/api/proxy/panel/users/${userId}`)
            .then((response) => (response.ok ? response.json() : null))
            .then((payload) => {
                if (!cancelled) setData(payload);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [userId]);

    async function moderate(status: "approved" | "rejected") {
        if (!data || busy) return;
        if (status === "rejected" && !note.trim()) {
            setError("Qaytarish sababini yozing — foydalanuvchi shuni ko'radi.");
            return;
        }

        setBusy(true);
        setError(null);
        try {
            const response = await fetch(`/api/proxy/panel/users/${data.user.id}/profil`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status, note }),
            });
            const payload = await response.json().catch(() => null);
            if (!response.ok) {
                setError(payload?.detail ?? "Bajarib bo'lmadi.");
                return;
            }

            setData((current) =>
                current
                    ? {
                          ...current,
                          business: current.business ? { ...current.business, status } : null,
                          startups: current.startups.map((item, index) =>
                              index === 0 ? { ...item, status, admin_note: note } : item,
                          ),
                      }
                    : current,
            );
            // Ochiq ro'yxat darhol yangilansin
            await refreshPublic(data.business ? "businesses" : "startups");
            onChanged(status === "approved" ? "Anketa tasdiqlandi." : "Anketa qaytarildi.");
        } finally {
            setBusy(false);
        }
    }

    async function remove() {
        if (!data || busy) return;
        const name = data.user.full_name || data.user.email;
        if (
            !confirm(
                `«${name}» hisobi butunlay o'chirilsinmi?\n\nBiznes, startap, rasmlar va bildirishnomalar ham o'chadi. Buni qaytarib bo'lmaydi.`,
            )
        )
            return;

        setBusy(true);
        setError(null);
        try {
            const response = await fetch(`/api/proxy/panel/users/${data.user.id}`, {
                method: "DELETE",
            });
            const payload = await response.json().catch(() => null);
            if (!response.ok) {
                setError(payload?.detail ?? "O'chirib bo'lmadi.");
                return;
            }
            onDeleted(`«${name}» o'chirildi.`);
        } finally {
            setBusy(false);
        }
    }

    const profile = data?.business ?? data?.startups[0] ?? null;
    const status = profile?.status;

    if (loading || !data) return <DrawerSkeleton />;

    return (
            <div className="space-y-6">
                {/* Kim */}
                <div className="flex items-start gap-4">
                    <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-surface text-[15px] font-semibold text-muted">
                        {data.user.initials}
                    </span>
                    <div className="min-w-0">
                        <h2 className="text-xl font-semibold tracking-tight">
                            {data.user.full_name || "Ismi yo'q"}
                        </h2>
                        <p className="mt-1 flex flex-wrap gap-x-3 text-[13px] text-muted">
                            <span>{data.user.role_display}</span>
                            {data.user.region_display && (
                                <span>{data.user.region_display}</span>
                            )}
                            {data.user.is_admin && (
                                <span className="text-accent-text">Admin</span>
                            )}
                        </p>
                    </div>
                </div>

                {data.user.onboarding && (
                    <p className="tone-amber flex items-center gap-2 rounded-xl bg-tone-soft px-3.5 py-2.5 text-[13px] text-tone-text">
                        <Icon name="alert" size={14} />
                        {ONBOARDING_LABEL[data.user.onboarding]}
                    </p>
                )}

                <dl className="grid gap-x-6 gap-y-3 text-[13.5px] sm:grid-cols-2">
                    <Info label="Telefon" value={data.user.phone} />
                    <Info
                        label="Telegram"
                        value={
                            data.user.telegram_username
                                ? `@${data.user.telegram_username}`
                                : ""
                        }
                    />
                    <Info label="Email" value={data.user.email} />
                    <Info label="Ro'yxatdan o'tgan" value={formatDate(data.user.created_at)} />
                    <Info label="Yoshi" value={data.user.age ? `${data.user.age} yosh` : ""} />
                    <Info label="Ta'lim" value={data.user.study_location_display ?? ""} />
                </dl>

                {data.peer && (
                    <a
                        href={`/tengdoshlar/${data.peer.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="group flex items-center gap-3.5 rounded-2xl border border-line p-4 transition-colors hover:border-accent"
                    >
                        <span
                            className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl text-[13px] font-semibold text-white"
                            style={{ background: data.peer.country_color }}
                        >
                            {data.peer.photo ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img src={data.peer.photo} alt="" className="size-full object-cover" />
                            ) : (
                                data.peer.initials
                            )}
                        </span>
                        <span className="min-w-0 flex-1">
                            <span className="block text-[13.5px] font-semibold">
                                Chet eldagi tengdosh
                            </span>
                            <span className="mt-0.5 block truncate text-[12.5px] text-muted">
                                {[
                                    data.peer.country_name,
                                    data.peer.institution,
                                    data.peer.course ? `${data.peer.course}-kurs` : "",
                                ]
                                    .filter(Boolean)
                                    .join(" · ")}
                            </span>
                        </span>
                        <Icon
                            name="arrowRight"
                            size={15}
                            className="shrink-0 text-faint transition-transform group-hover:translate-x-0.5"
                        />
                    </a>
                )}

                <div className="grid grid-cols-4 gap-2">
                    <Stat icon="spark" value={data.activity.initiatives} label="Tashabbus" />
                    <Stat icon="vote" value={data.activity.votes} label="Ovoz" />
                    <Stat icon="bulb" value={data.activity.solutions} label="Taklif" />
                    <Stat icon="calendar" value={data.activity.events} label="Tadbir" />
                </div>

                {/* Anketa */}
                {data.business && <BusinessCard business={data.business} />}
                {data.startups[0] && <StartupCard startup={data.startups[0]} />}

                {profile && (
                    <div className="rounded-2xl border border-line p-4">
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-[13.5px] font-semibold">
                                Anketa holati
                            </span>
                            <StatusPill status={status ?? "pending"} />
                        </div>

                        <textarea
                            value={note}
                            onChange={(event) => setNote(event.target.value)}
                            rows={2}
                            placeholder="Qaytarsangiz — sababini yozing (masalan: logotip yo'q, tavsif juda qisqa)"
                            className="mt-3 w-full resize-y rounded-xl border border-line bg-page px-3.5 py-2.5 text-[13.5px] outline-none placeholder:text-faint focus:border-accent"
                        />

                        <div className="mt-3 flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => moderate("approved")}
                                disabled={busy || status === "approved"}
                                className="tone-emerald inline-flex items-center gap-2 rounded-full bg-tone px-4 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                            >
                                <Icon name="check" size={14} />
                                Tasdiqlash
                            </button>
                            <button
                                type="button"
                                onClick={() => moderate("rejected")}
                                disabled={busy || status === "rejected"}
                                className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-[13px] text-muted transition-colors hover:bg-warn-soft hover:text-warn-text disabled:opacity-40"
                            >
                                <Icon name="ban" size={14} />
                                Qaytarish
                            </button>
                        </div>
                    </div>
                )}

                {error && (
                    <p className="flex items-start gap-2 rounded-xl bg-warn-soft px-4 py-2.5 text-[13px] text-warn-text">
                        <Icon name="alert" size={15} className="mt-0.5 shrink-0" />
                        {error}
                    </p>
                )}

                {/* Xavfli qism */}
                {!data.user.is_superuser && (
                    <div className="rounded-2xl border border-warn/30 p-4">
                        <p className="text-[13.5px] font-semibold text-warn-text">
                            Hisobni o&apos;chirish
                        </p>
                        <p className="mt-1 text-[12.5px] leading-relaxed text-muted">
                            Biznes, startap, rasmlar, bildirishnomalar ham o&apos;chadi.
                            Tashabbus va takliflari muallif ismi bilan qoladi.
                        </p>
                        <button
                            type="button"
                            onClick={remove}
                            disabled={busy}
                            className="mt-3 inline-flex items-center gap-2 rounded-full bg-warn px-4 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                        >
                            <Icon name="trash" size={14} />
                            O&apos;chirish
                        </button>
                    </div>
                )}
            </div>
    );
}

/* ------------------------------------------------------------------ */

function BusinessCard({ business }: { business: BusinessProfile }) {
    return (
        <section className="tone-amber overflow-hidden rounded-2xl border border-tone-line">
            <div className="flex items-center gap-3.5 bg-tone-soft p-4">
                <Logo url={business.logo_url} icon="briefcase" />
                <div className="min-w-0">
                    <p className="truncate text-[15px] font-semibold">{business.name}</p>
                    <p className="text-[12.5px] text-tone-text">{business.sphere_display}</p>
                </div>
            </div>

            <div className="space-y-4 p-4">
                <p className="whitespace-pre-line text-[13.5px] leading-relaxed text-muted">
                    {business.description}
                </p>

                <dl className="grid gap-x-6 gap-y-2.5 text-[13px] sm:grid-cols-2">
                    <Info label="Tashkil topgan" value={business.founded_year ? String(business.founded_year) : ""} />
                    <Info label="Xodimlar" value={business.employees ? String(business.employees) : ""} />
                    <Info label="STIR" value={business.stir} />
                    <Info
                        label="Manzil"
                        value={[business.region_display, business.district, business.address]
                            .filter(Boolean)
                            .join(", ")}
                    />
                    <Info label="Telefon" value={business.phone} />
                    <Info label="Sayt" value={business.website} link={business.website} />
                    <Info label="Telegram" value={business.telegram ? `@${business.telegram}` : ""} />
                    <Info label="Instagram" value={business.instagram ? `@${business.instagram}` : ""} />
                </dl>

                {business.gallery.length > 0 && (
                    <div className="grid grid-cols-4 gap-2">
                        {business.gallery.map((image) => (
                            <a
                                key={image.id}
                                href={image.url}
                                target="_blank"
                                rel="noreferrer"
                                className="aspect-square overflow-hidden rounded-lg border border-line"
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={image.url} alt="" className="size-full object-cover" />
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

function StartupCard({ startup }: { startup: StartupProfile }) {
    return (
        <section className="tone-orange overflow-hidden rounded-2xl border border-tone-line">
            <div className="flex items-center gap-3.5 bg-tone-soft p-4">
                <Logo url={startup.logo_url} icon="rocket" />
                <div className="min-w-0">
                    <p className="truncate text-[15px] font-semibold">{startup.name}</p>
                    <p className="text-[12.5px] text-tone-text">
                        {startup.sphere_display} · {startup.stage_display}
                    </p>
                </div>
            </div>

            <div className="space-y-4 p-4">
                <p className="whitespace-pre-line text-[13.5px] leading-relaxed text-muted">
                    {startup.about}
                </p>
                {startup.problem_solved && (
                    <p className="whitespace-pre-line text-[13px] leading-relaxed">
                        <span className="text-faint">Muammo: </span>
                        {startup.problem_solved}
                    </p>
                )}

                <dl className="grid gap-x-6 gap-y-2.5 text-[13px] sm:grid-cols-2">
                    <Info label="Jamoa" value={`${startup.team_size} kishi`} />
                    <Info
                        label="Investitsiya"
                        value={
                            startup.needed_investment
                                ? `${formatNumber(Math.round(Number(startup.needed_investment)))} so'm`
                                : ""
                        }
                    />
                    <Info label="Sayt" value={startup.website} link={startup.website} />
                    <Info label="Pitch" value={startup.pitch_url ? "Ochish" : ""} link={startup.pitch_url} />
                </dl>
            </div>
        </section>
    );
}

function Logo({ url, icon }: { url: string | null; icon: IconName }) {
    return (
        <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl border border-tone-line bg-page text-tone-text">
            {url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={url} alt="" className="size-full object-cover" />
            ) : (
                <Icon name={icon} size={20} />
            )}
        </span>
    );
}

function Info({ label, value, link }: { label: string; value: string; link?: string | null }) {
    return (
        <div className="min-w-0">
            <dt className="text-[11.5px] text-faint">{label}</dt>
            <dd className="mt-0.5 truncate">
                {!value ? (
                    <span className="text-faint">—</span>
                ) : link ? (
                    <a href={link} target="_blank" rel="noreferrer" className="text-accent-text hover:underline">
                        {value.replace(/^https?:\/\//, "")}
                    </a>
                ) : (
                    value
                )}
            </dd>
        </div>
    );
}

function Stat({ icon, value, label }: { icon: IconName; value: number; label: string }) {
    return (
        <div className="rounded-xl border border-line p-3 text-center">
            <Icon name={icon} size={15} className="mx-auto text-faint" />
            <p className="mt-1.5 text-[16px] font-semibold tabular-nums">{value}</p>
            <p className="text-[11px] text-faint">{label}</p>
        </div>
    );
}

function StatusPill({ status }: { status: string }) {
    const map: Record<string, { tone: string; label: string }> = {
        pending: { tone: "tone-amber", label: "Tekshiruv kutmoqda" },
        approved: { tone: "tone-emerald", label: "Tasdiqlangan" },
        rejected: { tone: "tone-rose", label: "Qaytarilgan" },
    };
    const info = map[status] ?? map.pending;
    return (
        <span className={cn(info.tone, "rounded-full bg-tone-soft px-2.5 py-1 text-[11.5px] font-medium text-tone-text")}>
            {info.label}
        </span>
    );
}

function DrawerSkeleton() {
    return (
        <div className="animate-pulse space-y-5">
            <div className="flex items-center gap-4">
                <div className="size-14 rounded-2xl bg-surface" />
                <div className="space-y-2">
                    <div className="h-5 w-48 rounded bg-surface" />
                    <div className="h-3.5 w-32 rounded bg-surface" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="h-10 rounded-lg bg-surface" />
                ))}
            </div>
            <div className="h-48 rounded-2xl bg-surface" />
        </div>
    );
}
