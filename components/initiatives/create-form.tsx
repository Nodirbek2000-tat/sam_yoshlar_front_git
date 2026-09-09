"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Icon, type IconName } from "@/components/icon";
import { LiveScene } from "@/components/initiatives/live-scene";
import { cn } from "@/lib/cn";
import type { Choice, Direction } from "@/lib/types";

/**
 * Tashabbus bildirish formasi.
 *
 * Uch qadam: yo'nalish → tur → matn. Yo'nalish tanlanishi bilan o'ng
 * tomonda o'sha yo'nalishning tirik sahnasi paydo bo'ladi — odam nimaga
 * qo'shilayotganini ko'rib tursin.
 */

const KIND_ICONS: Record<string, IconName> = {
    idea: "bulb",
    problem: "alert",
    proposal: "clipboard",
    startup: "rocket",
};

const KIND_HINTS: Record<string, string> = {
    idea: "Boshimga kelgan fikr, hali ishlanmagan",
    problem: "Hal qilinishi kerak bo'lgan muammo",
    proposal: "Aniq taklif — nima qilish kerakligi ma'lum",
    startup: "Biznes g'oyasi yoki mavjud loyiha",
};

export function CreateInitiativeForm({
    directions,
    kinds,
    regions,
    fullName,
    phone,
}: {
    directions: Direction[];
    kinds: Choice[];
    regions: Choice[];
    fullName: string;
    phone: string;
}) {
    const router = useRouter();
    const [direction, setDirection] = useState<Direction | null>(null);
    const [kind, setKind] = useState(kinds[0]?.value ?? "idea");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [done, setDone] = useState<number | null>(null);

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (busy || !direction) return;

        const form = new FormData(event.currentTarget);
        setBusy(true);
        setError(null);

        try {
            const response = await fetch("/api/proxy/initiatives", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    direction: direction.id,
                    kind,
                    title: form.get("title"),
                    summary: form.get("summary") ?? "",
                    description: form.get("description"),
                    expected_result: form.get("expected_result") ?? "",
                    author_name: form.get("author_name"),
                    author_phone: form.get("author_phone") ?? "",
                    region: form.get("region") ?? "",
                }),
            });

            if (!response.ok) {
                const payload = (await response.json().catch(() => null)) as Record<
                    string,
                    string[] | string
                > | null;
                const first = payload ? Object.values(payload)[0] : null;
                setError(
                    Array.isArray(first) ? first[0] : ((first as string) ?? "Yuborib bo'lmadi."),
                );
                return;
            }

            const created = (await response.json()) as { id?: number };
            setDone(created.id ?? 0);
            router.refresh();
        } catch {
            setError("Tarmoqda xatolik.");
        } finally {
            setBusy(false);
        }
    }

    if (done !== null) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass mx-auto max-w-lg rounded-2xl p-8 text-center"
            >
                <span className="tone-emerald mx-auto grid size-14 place-items-center rounded-2xl bg-tone-soft">
                    <Icon name="check" size={26} className="text-tone-text" strokeWidth={2} />
                </span>

                <h2 className="mt-5 text-2xl font-semibold tracking-tight">
                    Tashabbusingiz ro&apos;yxatga qo&apos;shildi
                </h2>
                <p className="mt-3 text-[14.5px] leading-relaxed text-muted">
                    U hoziroq ro&apos;yxatda turibdi va ovoz yig&apos;a boshladi. Har bir
                    ovoz sahnani bir qadam o&apos;stiradi.
                </p>

                <div className="mt-7 flex flex-wrap justify-center gap-2">
                    <Link
                        href={done ? `/tashabbuslar/${done}` : "/tashabbuslar/yoshlar"}
                        className="inline-flex items-center gap-2 rounded-full bg-invert px-5 py-2.5 text-[13.5px] font-medium text-on-invert transition-opacity hover:opacity-90"
                    >
                        Ko&apos;rish
                        <Icon name="arrowRight" size={14} />
                    </Link>
                    <Link
                        href="/kabinet/tashabbuslarim"
                        className="rounded-full border border-line px-5 py-2.5 text-[13.5px] text-muted transition-colors hover:text-text"
                    >
                        Tashabbuslarim
                    </Link>
                </div>
            </motion.div>
        );
    }

    return (
        <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-12">
            <div className="min-w-0">
                {/* ---------- 1. Yo'nalish ---------- */}
                <Step number={1} title="Yo'nalishni tanlang">
                    <div className="grid gap-2 sm:grid-cols-2">
                        {directions.map((item) => {
                            const active = direction?.id === item.id;

                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setDirection(item)}
                                    className={cn(
                                        "flex items-center gap-3 rounded-xl border p-3 text-left transition-all duration-200",
                                        active
                                            ? "border-transparent"
                                            : "border-line hover:border-current",
                                    )}
                                    style={
                                        active
                                            ? {
                                                  background: `color-mix(in oklab, ${item.color} 12%, transparent)`,
                                                  boxShadow: `inset 0 0 0 1px ${item.color}`,
                                              }
                                            : { color: "var(--muted)" }
                                    }
                                >
                                    <span
                                        className="size-2.5 shrink-0 rounded-full"
                                        style={{ background: item.color }}
                                    />
                                    <span className="min-w-0 flex-1">
                                        <span
                                            className="block truncate text-[13.5px] font-medium"
                                            style={active ? { color: item.color } : undefined}
                                        >
                                            {item.name}
                                        </span>
                                        <span className="block truncate text-[11.5px] text-faint">
                                            {item.title}
                                        </span>
                                    </span>
                                    {active && (
                                        <span style={{ color: item.color }}>
                                            <Icon name="check" size={15} strokeWidth={2.4} />
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </Step>

                {/* ---------- 2. Turi ---------- */}
                <Step number={2} title="Bu nima?">
                    <div className="grid gap-2 sm:grid-cols-2">
                        {kinds.map((item) => (
                            <button
                                key={item.value}
                                type="button"
                                onClick={() => setKind(item.value)}
                                className={cn(
                                    "flex items-start gap-3 rounded-xl border p-3.5 text-left transition-colors duration-200",
                                    kind === item.value
                                        ? "border-accent bg-accent-soft"
                                        : "border-line hover:bg-surface",
                                )}
                            >
                                <Icon
                                    name={KIND_ICONS[item.value] ?? "bulb"}
                                    size={18}
                                    className={
                                        kind === item.value ? "text-accent-text" : "text-faint"
                                    }
                                />
                                <span className="min-w-0">
                                    <span className="block text-[13.5px] font-medium">
                                        {item.label}
                                    </span>
                                    <span className="mt-0.5 block text-[12px] leading-snug text-muted">
                                        {KIND_HINTS[item.value] ?? ""}
                                    </span>
                                </span>
                            </button>
                        ))}
                    </div>
                </Step>

                {/* ---------- 3. Matn ---------- */}
                <Step number={3} title="Mazmuni">
                    <div className="grid gap-4">
                        <Field label="Sarlavha" hint="Qisqa va aniq — bir jumlada">
                            <input
                                name="title"
                                required
                                maxLength={200}
                                placeholder="Masalan: Maktablarda plastik yig'ish punktlari"
                                className={INPUT}
                            />
                        </Field>

                        <Field label="Bir qatorli izoh" hint="Ixtiyoriy — ro'yxatda ko'rinadi">
                            <input
                                name="summary"
                                maxLength={200}
                                placeholder="Eng muhim fikr bir jumlada"
                                className={INPUT}
                            />
                        </Field>

                        <Field label="Batafsil" hint="Muammo nimada, qanday hal qilinadi">
                            <textarea
                                name="description"
                                required
                                rows={7}
                                placeholder="Nima bo'lyapti, kimga tegishli, qanday yechim taklif qilasiz"
                                className={`${INPUT} resize-y leading-relaxed`}
                            />
                        </Field>

                        <Field label="Kutilayotgan natija" hint="Ixtiyoriy">
                            <textarea
                                name="expected_result"
                                rows={3}
                                placeholder="Nima o'zgaradi, qancha odamga foyda beradi"
                                className={`${INPUT} resize-y leading-relaxed`}
                            />
                        </Field>
                    </div>
                </Step>

                {/* ---------- 4. Siz ---------- */}
                <Step number={4} title="Aloqa" last>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="F.I.O.">
                            <input
                                name="author_name"
                                required
                                defaultValue={fullName}
                                placeholder="Familiya Ism"
                                className={INPUT}
                            />
                        </Field>

                        <Field label="Telefon" hint="Ixtiyoriy">
                            <input
                                name="author_phone"
                                defaultValue={phone}
                                placeholder="+998 90 123 45 67"
                                className={INPUT}
                            />
                        </Field>

                        <Field label="Hudud" className="sm:col-span-2">
                            <select name="region" className={INPUT} defaultValue="">
                                <option value="">Tanlanmagan</option>
                                {regions.map((item) => (
                                    <option key={item.value} value={item.value}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                        </Field>
                    </div>
                </Step>

                {error && (
                    <p className="mt-6 inline-flex items-start gap-2 rounded-xl bg-warn-soft px-4 py-3 text-[13px] text-warn-text">
                        <Icon name="alert" size={15} className="mt-0.5 shrink-0" />
                        {error}
                    </p>
                )}

                <div className="mt-8 flex flex-wrap items-center gap-3">
                    <button
                        type="submit"
                        disabled={busy || !direction}
                        className="inline-flex items-center gap-2 rounded-full bg-invert px-6 py-3 text-[14.5px] font-medium text-on-invert transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {busy ? "Yuborilmoqda…" : "Tashabbusni yuborish"}
                        {!busy && <Icon name="arrowRight" size={15} />}
                    </button>

                    {!direction && (
                        <span className="text-[13px] text-faint">
                            Avval yo&apos;nalishni tanlang
                        </span>
                    )}
                </div>
            </div>

            {/* ---------- Yon panel: tanlangan sahna ---------- */}
            <aside className="lg:sticky lg:top-24 lg:self-start">
                <AnimatePresence mode="wait">
                    {direction ? (
                        <motion.div
                            key={direction.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.35 }}
                        >
                            <LiveScene direction={direction} votes={direction.votes} />

                            <p
                                className="mt-3 text-[11px] font-semibold uppercase tracking-[0.12em]"
                                style={{ color: direction.color }}
                            >
                                {direction.title}
                            </p>
                            <p className="mt-2 text-[13.5px] leading-relaxed text-muted">
                                {direction.tagline}
                            </p>
                            <p className="mt-3 text-[12.5px] text-faint">
                                Hozir {direction.ideas} ta tashabbus, {direction.votes} ovoz.
                                Sizniki qo&apos;shilsa, sahna yana bir qadam o&apos;sadi.
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="rounded-2xl border border-dashed border-line p-6 text-center"
                        >
                            <Icon
                                name="spark"
                                size={22}
                                className="mx-auto text-faint"
                                strokeWidth={1.5}
                            />
                            <p className="mt-3 text-[13.5px] leading-relaxed text-muted">
                                Yo&apos;nalishni tanlaganingizda o&apos;sha yo&apos;nalishning
                                tirik sahnasi shu yerda ko&apos;rinadi.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </aside>
        </form>
    );
}

/* ------------------------------------------------------------------ */

const INPUT =
    "w-full rounded-xl border border-line bg-page px-3.5 py-2.5 text-[14px] outline-none transition-colors placeholder:text-faint focus:border-accent";

function Step({
    number,
    title,
    last,
    children,
}: {
    number: number;
    title: string;
    last?: boolean;
    children: React.ReactNode;
}) {
    return (
        <section className={cn("relative pl-10", !last && "pb-9")}>
            {/* Qadamlar zanjiri */}
            <span className="absolute left-0 top-0 grid size-7 place-items-center rounded-full border border-line bg-page text-[12px] font-semibold tabular-nums text-muted">
                {number}
            </span>
            {!last && (
                <span
                    aria-hidden
                    className="absolute left-[13px] top-8 h-[calc(100%-2rem)] w-px bg-line"
                />
            )}

            <h2 className="text-[15.5px] font-semibold tracking-tight">{title}</h2>
            <div className="mt-4">{children}</div>
        </section>
    );
}

function Field({
    label,
    hint,
    className,
    children,
}: {
    label: string;
    hint?: string;
    className?: string;
    children: React.ReactNode;
}) {
    return (
        <label className={cn("block", className)}>
            <span className="mb-1.5 flex flex-wrap items-baseline gap-x-2">
                <span className="text-[13px] font-medium">{label}</span>
                {hint && <span className="text-[12px] text-faint">{hint}</span>}
            </span>
            {children}
        </label>
    );
}
