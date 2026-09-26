"use client";

import { useRef, useState } from "react";

import { Icon, type IconName } from "@/components/icon";
import { Field, Flash, INPUT, PanelHeader } from "@/components/panel/ui";
import { cn } from "@/lib/cn";
import { formatNumber, tashkentParts } from "@/lib/format";

/**
 * Excel'ga yuklab olish — har bir bo'lim alohida fayl.
 *
 * Davr tanlansa, faylning har bir varag'i o'z sanasi bo'yicha filtrlanadi:
 * «sentyabrda kim tashabbus yozdi, kim ovoz berdi» degan savolga javob.
 */

export type ExportSection = {
    key: string;
    title: string;
    description: string;
    icon: string;
    parts: string[];
    count: number;
};

type Period = { dan: string; gacha: string };

const pad = (value: number) => String(value).padStart(2, "0");
const isoDate = (year: number, month: number, day: number) => `${year}-${pad(month)}-${pad(day)}`;

/** Tayyor davrlar — Toshkent kalendari bo'yicha. */
const PRESETS: { key: string; label: string; period: () => Period }[] = [
    { key: "all", label: "Hammasi", period: () => ({ dan: "", gacha: "" }) },
    {
        key: "month",
        label: "Bu oy",
        period: () => {
            const { year, month, day } = tashkentParts(new Date());
            return { dan: isoDate(year, month, 1), gacha: isoDate(year, month, day) };
        },
    },
    {
        key: "last-month",
        label: "O'tgan oy",
        period: () => {
            const { year, month } = tashkentParts(new Date());
            const [y, m] = month === 1 ? [year - 1, 12] : [year, month - 1];
            const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate();
            return { dan: isoDate(y, m, 1), gacha: isoDate(y, m, lastDay) };
        },
    },
    {
        key: "year",
        label: "Bu yil",
        period: () => {
            const { year, month, day } = tashkentParts(new Date());
            return { dan: isoDate(year, 1, 1), gacha: isoDate(year, month, day) };
        },
    },
];

function toQuery({ dan, gacha }: Period) {
    const params = new URLSearchParams();
    if (dan) params.set("dan", dan);
    if (gacha) params.set("gacha", gacha);
    const query = params.toString();
    return query ? `?${query}` : "";
}

export function ExportsPanel({ initial }: { initial: ExportSection[] }) {
    const [sections, setSections] = useState(initial);
    const [period, setPeriod] = useState<Period>({ dan: "", gacha: "" });
    const [preset, setPreset] = useState<string | null>("all");
    const [counting, setCounting] = useState(false);
    const [busyKey, setBusyKey] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [flash, setFlash] = useState<string | null>(null);
    // Tez-tez o'zgartirilsa, faqat oxirgi so'rov javobi olinadi
    const request = useRef(0);

    async function changePeriod(next: Period, presetKey: string | null) {
        setPeriod(next);
        setPreset(presetKey);
        setError(null);

        const id = ++request.current;
        setCounting(true);
        try {
            const response = await fetch(`/api/proxy/panel/eksport${toQuery(next)}`);
            const data = await response.json().catch(() => null);
            if (id !== request.current) return;
            if (response.ok && data?.results) {
                setSections(data.results);
            } else {
                setError(data?.detail ?? "Sonlarni olib bo'lmadi.");
            }
        } catch {
            if (id === request.current) setError("Internet aloqasini tekshiring.");
        } finally {
            if (id === request.current) setCounting(false);
        }
    }

    async function download(section: ExportSection) {
        setBusyKey(section.key);
        setError(null);
        try {
            const response = await fetch(`/api/eksport/${section.key}${toQuery(period)}`);
            if (!response.ok) {
                const data = await response.json().catch(() => null);
                setError(data?.detail ?? "Faylni yuklab bo'lmadi. Qayta urinib ko'ring.");
                return;
            }

            const blob = await response.blob();
            const disposition = response.headers.get("content-disposition") ?? "";
            const name = /filename="([^"]+)"/.exec(disposition)?.[1] ?? `${section.key}.xlsx`;

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = name;
            document.body.append(link);
            link.click();
            link.remove();
            setTimeout(() => URL.revokeObjectURL(url), 10_000);

            setFlash(`«${section.title}» yuklab olindi.`);
        } catch {
            setError("Internet aloqasini tekshiring.");
        } finally {
            setBusyKey(null);
        }
    }

    return (
        <>
            <PanelHeader
                title="Excel yuklab olish"
                description="Har bir bo'lim — alohida fayl. Ichida kim nima qilgani: mualliflar, telefonlar, ovozlar va takliflar."
            />

            <Flash text={flash} onDone={() => setFlash(null)} />

            {/* --- Davr --- */}
            <section className="mt-6 rounded-2xl border border-line p-4 sm:p-5">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="mr-1 text-[12px] font-medium uppercase tracking-[0.1em] text-faint">
                        Davr
                    </span>
                    {PRESETS.map((item) => (
                        <button
                            key={item.key}
                            type="button"
                            onClick={() => changePeriod(item.period(), item.key)}
                            aria-pressed={preset === item.key}
                            className={cn(
                                "rounded-full border px-3.5 py-1.5 text-[13px] transition-colors",
                                preset === item.key
                                    ? "border-transparent bg-invert text-on-invert"
                                    : "border-line text-muted hover:text-text",
                            )}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                <div className="mt-4 grid gap-3 sm:max-w-md sm:grid-cols-2">
                    <Field label="Dan">
                        <input
                            type="date"
                            value={period.dan}
                            max={period.gacha || undefined}
                            onChange={(event) => changePeriod({ ...period, dan: event.target.value }, null)}
                            className={INPUT}
                        />
                    </Field>
                    <Field label="Gacha">
                        <input
                            type="date"
                            value={period.gacha}
                            min={period.dan || undefined}
                            onChange={(event) => changePeriod({ ...period, gacha: event.target.value }, null)}
                            className={INPUT}
                        />
                    </Field>
                </div>

                <p className="mt-3 text-[12.5px] leading-relaxed text-faint">
                    Davr tanlansa, har bir varaq o&apos;z sanasi bo&apos;yicha olinadi: tashabbus — yozilgan
                    kuni, ovoz — berilgan kuni, foydalanuvchi — ro&apos;yxatdan o&apos;tgan kuni, tadbir —
                    o&apos;tadigan kuni.
                </p>
            </section>

            {error && (
                <p className="tone-rose mt-5 inline-flex items-center gap-2 rounded-full bg-tone-soft px-4 py-2 text-[13px] text-tone-text">
                    <Icon name="alert" size={14} />
                    {error}
                </p>
            )}

            {/* --- Bo'limlar --- */}
            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {sections.map((section) => {
                    const busy = busyKey === section.key;
                    return (
                        <article
                            key={section.key}
                            className="flex flex-col rounded-2xl border border-line bg-raised p-5"
                        >
                            <div className="flex items-start gap-3.5">
                                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent-text">
                                    <Icon name={section.icon as IconName} size={18} />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <h2 className="text-[15px] font-semibold">{section.title}</h2>
                                    <p
                                        className={cn(
                                            "mt-0.5 text-[13px] tabular-nums text-muted transition-opacity",
                                            counting && "opacity-40",
                                        )}
                                    >
                                        {formatNumber(section.count)} ta yozuv
                                    </p>
                                </div>
                            </div>

                            <p className="mt-3.5 text-[13.5px] leading-relaxed text-muted">
                                {section.description}
                            </p>

                            <ul className="mt-3 flex flex-wrap gap-1.5">
                                {section.parts.map((part) => (
                                    <li
                                        key={part}
                                        className="rounded-md border border-line px-2 py-0.5 text-[11.5px] text-faint"
                                    >
                                        {part}
                                    </li>
                                ))}
                            </ul>

                            {/* Kartalar balandligi har xil — tugmalar bir qatorda tursin */}
                            <div className="mt-auto pt-5">
                                <button
                                    type="button"
                                    onClick={() => download(section)}
                                    disabled={busyKey !== null}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-invert px-4 py-2.5 text-[13.5px] font-medium text-on-invert transition-opacity hover:opacity-90 disabled:opacity-40"
                                >
                                    <Icon name="download" size={15} className={cn(busy && "animate-bounce")} />
                                    {busy ? "Tayyorlanmoqda…" : "Excel yuklab olish"}
                                </button>
                            </div>
                        </article>
                    );
                })}
            </div>
        </>
    );
}
