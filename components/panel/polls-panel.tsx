"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";

import { Icon } from "@/components/icon";
import { Img } from "@/components/img";
import {
    EmptyState,
    Field,
    Flash,
    IconAction,
    INPUT,
    PanelHeader,
    refreshPublic,
    Toggle,
} from "@/components/panel/ui";
import { cn } from "@/lib/cn";
import { qualifies } from "@/components/polls/poll-ui";
import { foldText, formatNumber, formatShortDate, formatTime, toTashkentInput } from "@/lib/format";
import { shrinkImage } from "@/lib/shrink-image";
import type { Choice, PanelPoll, Poll } from "@/lib/types";

/**
 * Panel: so'rovnomalar (E'lonlar → So'rovnomalar).
 *
 * Bitta formada so'rovnoma va uning nomzodlari kiritiladi — mahalla
 * yetakchilari ro'yxatini bittalab yoki to'g'ridan-to'g'ri ro'yxatdan
 * (har qatorda bitta nomzod) qo'shish mumkin. Natijalar har bir
 * so'rovnomaning alohida sahifasida.
 */

type Row = {
    key: string;
    id: number | null;
    name: string;
    mahalla: string;
    district: string;
    note: string;
    /** Saqlangan rasm */
    photo: string | null;
    /** Yangi tanlangan rasm */
    file: File | null;
    preview: string | null;
    remove_photo: boolean;
    votes: number;
};

let sequence = 0;
const nextKey = () => `n${(sequence += 1)}${Date.now().toString(36)}`;

const emptyRow = (): Row => ({
    key: nextKey(),
    id: null,
    name: "",
    mahalla: "",
    district: "",
    note: "",
    photo: null,
    file: null,
    preview: null,
    remove_photo: false,
    votes: 0,
});

/**
 * Tuman nomini solishtirish kaliti: kichik harf, tutuq belgilarisiz,
 * qo'shimchasi bir xil — «Bulungur», «Bulung'ur t.», «Samarqand shahar» ham mos keladi.
 */
function districtKey(text: string) {
    return foldText(text.replace(/_/g, " "))
        .replace(/\.$/, "")
        .replace(/\s+(tumani|tuman|t)$/, " tumani")
        .replace(/\s+(shahri|shahar|sh)$/, " shahri");
}

/** «Urgut», «urgut tumani», «Samarqand sh.» -> tuman kodi. Topilmasa yoki ikkilansa — bo'sh. */
function matchDistrict(text: string, districts: Choice[]) {
    const value = districtKey(text);
    if (!value) return "";
    const keyed = districts.map((item) => ({
        value: item.value,
        label: districtKey(item.label),
        code: districtKey(item.value),
    }));
    // «Samarqand», «Kattaqo'rg'on» — shahar ham, tuman ham bor: ikkilanadi, bo'sh qoladi
    const stem = (key: string) => key.replace(/ (tumani|shahri)$/, "");
    if (keyed.filter((item) => stem(item.label) === value).length > 1) return "";
    const exact = keyed.find((item) => item.label === value || item.code === value);
    if (exact) return exact.value;
    if (value.length < 3) return "";
    const found = keyed.filter((item) => item.label.startsWith(value));
    return found.length === 1 ? found[0].value : "";
}

/** Har qatorda bitta nomzod: `F.I.O. | Mahalla | Tuman` (ajratuvchi: | ; yoki Tab). */
function parseBulk(text: string, districts: Choice[]): Row[] {
    return text
        .split(/\r?\n/)
        .filter((line) => line.trim())
        .map((line) => {
            // Tab — har biri alohida ustun (bo'sh katak ham); | va ; — oddiy ajratuvchi
            const [name = "", mahalla = "", district = "", note = ""] = line
                .split(/\t|\s*[|;]\s*/)
                .map((part) => part.trim());
            return {
                ...emptyRow(),
                name: name.slice(0, 150),
                mahalla: mahalla.slice(0, 150),
                district: matchDistrict(district, districts),
                note: note.slice(0, 300),
            };
        })
        .filter((row) => row.name);
}

function rowsOf(poll: PanelPoll | null): Row[] {
    if (!poll) return [emptyRow(), emptyRow(), emptyRow()];
    return poll.editable.map((option) => ({
        key: `id${option.id}`,
        id: option.id,
        name: option.name,
        mahalla: option.mahalla,
        district: option.district,
        note: option.note,
        photo: option.photo,
        file: null,
        preview: null,
        remove_photo: false,
        votes: option.votes,
    }));
}

const initials = (name: string) =>
    name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("");

export function PollsPanel({ polls, districts }: { polls: PanelPoll[]; districts: Choice[] }) {
    const router = useRouter();
    const [editing, setEditing] = useState<PanelPoll | "new" | null>(null);
    const [busyId, setBusyId] = useState<number | null>(null);
    const [flash, setFlash] = useState<string | null>(null);

    async function toggleVisible(poll: PanelPoll) {
        setBusyId(poll.id);
        try {
            const response = await fetch(`/api/proxy/panel/polls/${poll.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ is_active: !poll.is_active }),
            });
            if (response.ok) {
                await refreshPublic("polls");
                setFlash(poll.is_active ? "Saytdan yashirildi." : "Saytda ko'rinadi.");
                router.refresh();
            }
        } finally {
            setBusyId(null);
        }
    }

    async function remove(poll: PanelPoll) {
        const votes = poll.total_votes
            ? ` Unga berilgan ${formatNumber(poll.total_votes)} ta ovoz ham o'chadi.`
            : "";
        if (!confirm(`«${poll.title}» o'chirilsinmi?${votes}`)) return;

        setBusyId(poll.id);
        try {
            const response = await fetch(`/api/proxy/panel/polls/${poll.id}`, {
                method: "DELETE",
            });
            if (response.ok) {
                await refreshPublic("polls");
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
                title="So'rovnomalar"
                description="Masalan, viloyatning eng yaxshi mahalla yetakchisi: nomzodlarni kiriting — yoshlar saytda ovoz beradi, reyting har ovoz bilan yangilanadi."
                action={
                    <button
                        type="button"
                        onClick={() => setEditing(editing === "new" ? null : "new")}
                        className="inline-flex items-center gap-2 rounded-full bg-invert px-4 py-2 text-[13.5px] font-medium text-on-invert transition-opacity hover:opacity-90"
                    >
                        <Icon name={editing === "new" ? "close" : "plus"} size={15} />
                        {editing === "new" ? "Bekor qilish" : "So'rovnoma qo'shish"}
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
                        <PollForm
                            poll={editing === "new" ? null : editing}
                            districts={districts}
                            onCancel={() => setEditing(null)}
                            onDone={(message) => {
                                setEditing(null);
                                setFlash(message);
                                router.refresh();
                            }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="mt-8">
                <h2 className="text-[12px] font-medium uppercase tracking-[0.1em] text-faint">
                    {polls.length} ta so&apos;rovnoma
                </h2>

                {polls.length ? (
                    <ul className="mt-3 space-y-3">
                        {polls.map((poll) => (
                            <PollRow
                                key={poll.id}
                                poll={poll}
                                busy={busyId === poll.id}
                                locked={
                                    editing !== null && editing !== "new" && editing.id === poll.id
                                }
                                onToggle={() => toggleVisible(poll)}
                                onEdit={() => {
                                    setEditing(poll);
                                    window.scrollTo({ top: 0, behavior: "smooth" });
                                }}
                                onRemove={() => remove(poll)}
                            />
                        ))}
                    </ul>
                ) : (
                    <EmptyState text="Hali so'rovnoma yo'q. «So'rovnoma qo'shish» tugmasini bosing." />
                )}
            </div>
        </>
    );
}

export function PollStatus({
    poll,
}: {
    poll: Pick<Poll, "is_active" | "is_closed" | "ends_at" | "show_results" | "podium_min_votes">;
}) {
    return (
        <>
            {!poll.is_active ? (
                <span className="rounded-full bg-surface px-2.5 py-0.5 text-[11px] text-faint">
                    Yashirilgan
                </span>
            ) : poll.is_closed ? (
                <span className="tone-slate rounded-full bg-tone-soft px-2.5 py-0.5 text-[11px] font-medium text-tone-text">
                    Yakunlangan
                </span>
            ) : (
                <span className="tone-emerald inline-flex items-center gap-1.5 rounded-full bg-tone-soft px-2.5 py-0.5 text-[11px] font-medium text-tone-text">
                    <span className="size-1.5 rounded-full bg-tone" />
                    Ovoz berish davom etmoqda
                </span>
            )}
            {poll.ends_at && !poll.is_closed && (
                <span className="rounded-full bg-surface px-2.5 py-0.5 text-[11px] text-muted">
                    {formatShortDate(poll.ends_at)}, {formatTime(poll.ends_at)} gacha
                </span>
            )}
            {!poll.show_results && (
                <span className="tone-amber rounded-full bg-tone-soft px-2.5 py-0.5 text-[11px] font-medium text-tone-text">
                    Natijalar yopiq
                </span>
            )}
            {poll.podium_min_votes > 0 && (
                <span className="rounded-full bg-surface px-2.5 py-0.5 text-[11px] text-muted">
                    1-2-3 o&apos;rin: {formatNumber(poll.podium_min_votes)}+ ovoz
                </span>
            )}
        </>
    );
}

function PollRow({
    poll,
    busy,
    locked,
    onToggle,
    onEdit,
    onRemove,
}: {
    poll: PanelPoll;
    busy: boolean;
    /** Forma ochiq — ko'rinish va o'chirish shu formadan (aks holda forma eski holatni qaytaradi) */
    locked: boolean;
    onToggle: () => void;
    onEdit: () => void;
    onRemove: () => void;
}) {
    const top = poll.options.slice(0, 3);
    const leader = poll.total_votes ? top[0] : null;
    // Kubok — faqat saytdagi zinapoya chegarasidan o'tgan bo'lsa
    const crowned = qualifies(leader ?? undefined, poll.podium_min_votes ?? 1000);
    const max = top[0]?.votes || 1;
    const resultsHref = `/nazorat/elonlar/sorovnomalar/${poll.id}`;

    return (
        <li
            className={cn(
                "tone-amber rounded-2xl border border-line bg-raised p-4 sm:p-5",
                busy && "opacity-60",
                !poll.is_active && "border-dashed",
            )}
        >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link
                    href={resultsHref}
                    className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl border border-tone-line bg-tone-soft text-tone-text"
                >
                    {poll.image ? (
                        <Img
                            src={poll.image}
                            sizes="64px"
                            maxWidth={256}
                            className="size-full object-cover"
                        />
                    ) : (
                        <Icon name="vote" size={22} />
                    )}
                </Link>

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <PollStatus poll={poll} />
                    </div>
                    <Link
                        href={resultsHref}
                        className="mt-1.5 block truncate text-[15px] font-medium hover:underline"
                    >
                        {poll.title}
                    </Link>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-faint">
                        <span>{poll.options_count} nomzod</span>
                        <span className="font-medium text-muted">
                            {formatNumber(poll.total_votes)} ovoz
                        </span>
                        {leader && (
                            <span className="inline-flex items-center gap-1">
                                {crowned ? (
                                    <Icon name="trophy" size={12} className="text-tone-text" />
                                ) : (
                                    "1."
                                )}{" "}
                                {leader.name}
                            </span>
                        )}
                    </p>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                    <Link
                        href={resultsHref}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-invert px-3.5 text-[13px] font-medium text-on-invert transition-opacity hover:opacity-90"
                    >
                        <Icon name="chart" size={15} />
                        Natijalar
                    </Link>
                    <IconAction
                        icon={poll.is_active ? "eyeOff" : "eye"}
                        title={
                            locked
                                ? "Forma ochiq — «Saytda ko'rinsin» kalitidan foydalaning"
                                : poll.is_active
                                  ? "Saytdan yashirish"
                                  : "Saytda ko'rsatish"
                        }
                        disabled={busy || locked}
                        onClick={onToggle}
                    />
                    <IconAction icon="settings" title="Tahrirlash" onClick={onEdit} />
                    <Link
                        href={poll.url}
                        target="_blank"
                        title="Saytda ochish"
                        className="grid size-9 shrink-0 place-items-center rounded-lg border border-line text-muted transition-colors hover:bg-surface hover:text-text"
                    >
                        <Icon name="arrowRight" size={15} />
                    </Link>
                    <IconAction
                        icon="trash"
                        title={locked ? "Avval tahrirlashni yoping" : "O'chirish"}
                        danger
                        disabled={busy || locked}
                        onClick={onRemove}
                    />
                </div>
            </div>

            {poll.total_votes > 0 && (
                <ol className="mt-4 grid gap-2 border-t border-line pt-4 sm:grid-cols-3">
                    {top.map((option) => (
                        <li key={option.id} className="min-w-0">
                            <div className="flex items-baseline justify-between gap-2 text-[12.5px]">
                                <span className="truncate">
                                    <span className="mr-1.5 font-semibold text-tone-text">
                                        {option.rank}.
                                    </span>
                                    {option.name}
                                </span>
                                <span className="shrink-0 tabular-nums text-faint">
                                    {formatNumber(option.votes ?? 0)}
                                </span>
                            </div>
                            <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-surface">
                                <span
                                    className="block h-full rounded-full bg-tone"
                                    style={{ width: `${((option.votes ?? 0) / max) * 100}%` }}
                                />
                            </span>
                        </li>
                    ))}
                </ol>
            )}
        </li>
    );
}

/* ------------------------------------------------------------------------ */
/* Forma                                                                     */
/* ------------------------------------------------------------------------ */

function PollForm({
    poll,
    districts,
    onCancel,
    onDone,
}: {
    poll: PanelPoll | null;
    districts: Choice[];
    onCancel: () => void;
    onDone: (message: string) => void;
}) {
    const [rows, setRows] = useState<Row[]>(() => rowsOf(poll));
    const [bulkOpen, setBulkOpen] = useState(false);
    const [bulk, setBulk] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const listRef = useRef<HTMLOListElement>(null);

    // Tanlangan rasmlarning vaqtinchalik havolalari xotirada qolib ketmasin
    const previews = useRef(new Set<string>());
    useEffect(() => {
        const urls = previews.current;
        return () => urls.forEach((url) => URL.revokeObjectURL(url));
    }, []);

    const filled = rows.filter((row) => row.name.trim()).length;

    function update(key: string, changes: Partial<Row>) {
        setRows((list) => list.map((row) => (row.key === key ? { ...row, ...changes } : row)));
    }

    function move(index: number, step: -1 | 1) {
        setRows((list) => {
            const target = index + step;
            if (target < 0 || target >= list.length) return list;
            const next = [...list];
            [next[index], next[target]] = [next[target], next[index]];
            return next;
        });
    }

    // Ovozi bor nomzod olib tashlansa, saqlashda server joriy ovoz soni bilan
    // alohida so'raydi — sahifadagi son eskirgan bo'lishi mumkin
    function removeRow(row: Row) {
        setRows((list) => list.filter((item) => item.key !== row.key));
    }

    function addRow() {
        setRows((list) => [...list, emptyRow()]);
        // Yangi qatorga o'tib, ism maydoniga kursor qo'yamiz
        requestAnimationFrame(() => {
            const inputs = listRef.current?.querySelectorAll<HTMLInputElement>("[data-name-input]");
            inputs?.[inputs.length - 1]?.focus();
        });
    }

    function addBulk() {
        const parsed = parseBulk(bulk, districts);
        if (!parsed.length) return;
        // Bo'sh qatorlar o'rniga ro'yxat tushadi
        setRows((list) => [...list.filter((row) => row.name.trim() || row.id), ...parsed]);
        setBulk("");
        setBulkOpen(false);
    }

    function pickPhoto(row: Row, file: File | undefined) {
        if (!file) return;
        const url = URL.createObjectURL(file);
        previews.current.add(url);
        update(row.key, { file, preview: url, remove_photo: false });
    }

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (busy) return;

        // Ismi yo'q, lekin boshqa narsasi to'ldirilgan qator — xatoni aynan o'sha raqam bilan
        const nameless = rows.findIndex(
            (row) =>
                !row.name.trim() &&
                (row.id || row.mahalla.trim() || row.note.trim() || row.district || row.file),
        );
        if (nameless >= 0) {
            setError(`${nameless + 1}-nomzod: ismini kiriting.`);
            return;
        }

        // Butunlay bo'sh yangi qatorlar hisobga olinmaydi; `pos` — formadagi qator raqami
        const options = rows
            .map((row, index) => ({ ...row, pos: index + 1 }))
            .filter((row) => row.name.trim());
        if (options.length < 2) {
            setError("Kamida 2 ta nomzod kiriting.");
            return;
        }

        setBusy(true);
        setError(null);

        try {
            const data = new FormData(event.currentTarget);

            const cover = data.get("image");
            if (cover instanceof File) {
                if (cover.size === 0) data.delete("image");
                else data.set("image", await shrinkImage(cover, 1600));
            }

            data.set(
                "options",
                JSON.stringify(
                    options.map((row) => ({
                        id: row.id,
                        key: row.key,
                        pos: row.pos,
                        name: row.name.trim(),
                        mahalla: row.mahalla.trim(),
                        district: row.district,
                        note: row.note.trim(),
                        remove_photo: row.remove_photo,
                    })),
                ),
            );
            for (const row of options) {
                if (row.file) data.set(`photo_${row.key}`, await shrinkImage(row.file, 800));
            }

            const send = () =>
                fetch(poll ? `/api/proxy/panel/polls/${poll.id}` : "/api/proxy/panel/polls", {
                    method: poll ? "PATCH" : "POST",
                    body: data,
                });

            let response = await send();

            // Ovozi bor nomzodlar olib tashlanmoqda — server joriy sonlarni aytadi
            if (response.status === 409) {
                const conflict = (await response
                    .clone()
                    .json()
                    .catch(() => null)) as {
                    detail?: string;
                    remove_voted?: { id: number; name: string; votes: number }[];
                } | null;
                if (conflict?.remove_voted?.length) {
                    const list = conflict.remove_voted
                        .map((item) => `• ${item.name} — ${formatNumber(item.votes)} ta ovoz`)
                        .join("\n");
                    if (
                        !confirm(
                            `Quyidagi nomzodlar ovozlari bilan birga o'chadi:\n${list}\n\nDavom etasizmi?`,
                        )
                    ) {
                        // Olib tashlangan ovozli nomzodlar formaga o'z joyiga qaytadi
                        const ids = new Set(conflict.remove_voted.map((item) => item.id));
                        const original = rowsOf(poll);
                        setRows((current) => {
                            const next = [...current];
                            original.forEach((row, index) => {
                                const missing = !next.some((item) => item.id === row.id);
                                if (row.id && ids.has(row.id) && missing) {
                                    next.splice(Math.min(index, next.length), 0, row);
                                }
                            });
                            return next;
                        });
                        setError("Saqlanmadi — ovozi bor nomzodlar ro'yxatga qaytarildi.");
                        return;
                    }
                    // Rozilik faqat ko'rsatilgan nomzodlar uchun: shu orada boshqasi ovoz
                    // olgan bo'lsa, server yana so'raydi
                    data.set(
                        "confirm_remove_voted",
                        JSON.stringify(conflict.remove_voted.map((item) => item.id)),
                    );
                    response = await send();
                }
            }

            if (!response.ok) {
                const payload = (await response.json().catch(() => null)) as Record<
                    string,
                    string[] | string
                > | null;
                const first = payload ? Object.values(payload)[0] : null;
                setError(
                    response.status === 413
                        ? "Rasmlar juda katta — kamroq rasm bilan saqlab, qolganini keyin qo'shing."
                        : Array.isArray(first)
                          ? first[0]
                          : ((first as string) ?? "Saqlab bo'lmadi."),
                );
                return;
            }

            await refreshPublic("polls");
            onDone(poll ? "Saqlandi." : "So'rovnoma qo'shildi.");
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
            <div className="grid gap-4 md:grid-cols-2">
                <Field label="Sarlavha" className="md:col-span-2">
                    <input
                        name="title"
                        required
                        minLength={5}
                        maxLength={250}
                        defaultValue={poll?.title ?? ""}
                        placeholder="Samarqand viloyatining eng yaxshi mahalla yetakchisi"
                        className={INPUT}
                    />
                </Field>

                <Field label="Tavsif (ixtiyoriy)" className="md:col-span-2">
                    <textarea
                        name="description"
                        rows={3}
                        defaultValue={poll?.description ?? ""}
                        placeholder="So'rovnoma nima haqida, g'olib qanday taqdirlanadi…"
                        className={INPUT}
                    />
                </Field>

                <Field label="Muqova rasmi (ixtiyoriy)">
                    <CoverInput current={poll?.image ?? null} />
                </Field>

                <Field label="Ovoz berish tugashi (ixtiyoriy)">
                    <input
                        type="datetime-local"
                        name="ends_at"
                        defaultValue={toTashkentInput(poll?.ends_at ?? null)}
                        className={INPUT}
                    />
                    <span className="mt-1.5 block text-[11.5px] text-faint">
                        Bo&apos;sh qolsa — o&apos;zingiz yashirguncha davom etadi.
                    </span>
                </Field>

                <Field label="1-2-3 o'rin uchun eng kam ovoz">
                    <input
                        type="number"
                        name="podium_min_votes"
                        required
                        min={0}
                        max={1000000}
                        step={1}
                        defaultValue={poll?.podium_min_votes ?? 1000}
                        className={INPUT}
                    />
                    <span className="mt-1.5 block text-[11.5px] text-faint">
                        Shuncha ovozga yetmagan nomzod ro&apos;yxatda ko&apos;rinadi, lekin saytdagi
                        peshqadamlar zinapoyasiga (1-2-3 o&apos;rin) chiqmaydi.
                    </span>
                </Field>
            </div>

            <div className="mt-5 flex flex-wrap gap-x-7 gap-y-3">
                <Toggle
                    name="is_active"
                    label="Saytda ko'rinsin"
                    defaultChecked={poll?.is_active ?? true}
                />
                <Toggle
                    name="show_results"
                    label="Natijalar hammaga ko'rinsin"
                    defaultChecked={poll?.show_results ?? true}
                />
            </div>

            {/* Nomzodlar */}
            <section className="mt-8 border-t border-line pt-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h3 className="text-[15px] font-semibold">
                            Nomzodlar{" "}
                            <span className="ml-1 rounded-full bg-page px-2 py-0.5 text-[12px] font-medium text-muted">
                                {filled}
                            </span>
                        </h3>
                        <p className="mt-1 text-[12.5px] text-muted">
                            Tartib — saytda natijalar yopiq bo&apos;lganda shu tartibda chiqadi.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => setBulkOpen((value) => !value)}
                            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-page px-3.5 py-1.5 text-[12.5px] font-medium transition-colors hover:bg-raised"
                        >
                            <Icon name="clipboard" size={14} />
                            Ro&apos;yxatdan qo&apos;shish
                        </button>
                        <button
                            type="button"
                            onClick={addRow}
                            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-page px-3.5 py-1.5 text-[12.5px] font-medium transition-colors hover:bg-raised"
                        >
                            <Icon name="plus" size={14} />
                            Nomzod qo&apos;shish
                        </button>
                    </div>
                </div>

                <AnimatePresence>
                    {bulkOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="mt-4 rounded-xl border border-line bg-page p-4">
                                <p className="text-[12.5px] text-muted">
                                    Har qatorga bitta nomzod:{" "}
                                    <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-[11.5px] text-text">
                                        F.I.O. | Mahalla | Tuman
                                    </code>{" "}
                                    — Excel&apos;dan ustunlarni nusxalab qo&apos;ysangiz ham
                                    bo&apos;ladi.
                                </p>
                                <textarea
                                    value={bulk}
                                    onChange={(event) => setBulk(event.target.value)}
                                    rows={6}
                                    placeholder={
                                        "Aliyev Vali | Navbahor | Urgut\nKarimova Zuhra | Bog'ishamol | Samarqand shahri"
                                    }
                                    className={cn(INPUT, "mt-3 font-mono text-[13px]")}
                                />
                                <div className="mt-3 flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={addBulk}
                                        disabled={!bulk.trim()}
                                        className="rounded-full bg-invert px-4 py-2 text-[13px] font-medium text-on-invert disabled:opacity-50"
                                    >
                                        {parseBulk(bulk, districts).length || ""} nomzodni
                                        qo&apos;shish
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setBulkOpen(false)}
                                        className="rounded-full px-4 py-2 text-[13px] text-muted hover:text-text"
                                    >
                                        Yopish
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <ol ref={listRef} className="mt-4 space-y-2.5">
                    {rows.map((row, index) => (
                        <li key={row.key} className="rounded-xl border border-line bg-page p-3">
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <div className="flex items-center gap-3 sm:flex-col sm:gap-2">
                                    <span className="text-[11px] font-semibold tabular-nums text-faint">
                                        {index + 1}
                                    </span>
                                    <PhotoPicker
                                        row={row}
                                        onPick={(file) => pickPhoto(row, file)}
                                        onRemove={() =>
                                            // Yangi tanlangani bekor qilinsa — eski rasm qaytadi
                                            update(
                                                row.key,
                                                row.file
                                                    ? { file: null, preview: null }
                                                    : { remove_photo: true },
                                            )
                                        }
                                    />
                                    {/* Telefonda tugmalar tepada, yonma-yon */}
                                    <RowActions
                                        className="ml-auto flex-row sm:hidden"
                                        first={index === 0}
                                        last={index === rows.length - 1}
                                        onUp={() => move(index, -1)}
                                        onDown={() => move(index, 1)}
                                        onRemove={() => removeRow(row)}
                                    />
                                </div>

                                <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
                                    <input
                                        data-name-input
                                        value={row.name}
                                        onChange={(event) =>
                                            update(row.key, { name: event.target.value })
                                        }
                                        maxLength={150}
                                        placeholder="F.I.O."
                                        aria-label={`${index + 1}-nomzod ismi`}
                                        className={cn(INPUT, "py-2 font-medium")}
                                    />
                                    <input
                                        value={row.mahalla}
                                        onChange={(event) =>
                                            update(row.key, { mahalla: event.target.value })
                                        }
                                        maxLength={150}
                                        placeholder="Mahalla"
                                        aria-label={`${index + 1}-nomzod mahallasi`}
                                        className={cn(INPUT, "py-2")}
                                    />
                                    <select
                                        value={row.district}
                                        onChange={(event) =>
                                            update(row.key, { district: event.target.value })
                                        }
                                        aria-label={`${index + 1}-nomzod tumani`}
                                        className={cn(INPUT, "py-2", !row.district && "text-faint")}
                                    >
                                        <option value="">Tuman / shahar</option>
                                        {districts.map((item) => (
                                            <option key={item.value} value={item.value}>
                                                {item.label}
                                            </option>
                                        ))}
                                    </select>
                                    <input
                                        value={row.note}
                                        onChange={(event) =>
                                            update(row.key, { note: event.target.value })
                                        }
                                        maxLength={300}
                                        placeholder="Qisqa ma'lumot (ixtiyoriy): yutuqlari, ish tajribasi…"
                                        aria-label={`${index + 1}-nomzod haqida`}
                                        className={cn(
                                            INPUT,
                                            "py-2 text-[13px] sm:col-span-2 lg:col-span-3",
                                        )}
                                    />
                                    {row.votes > 0 && (
                                        <p className="text-[11.5px] text-faint sm:col-span-2 lg:col-span-3">
                                            {formatNumber(row.votes)} ta ovoz olgan
                                        </p>
                                    )}
                                </div>

                                <RowActions
                                    className="hidden flex-col sm:flex"
                                    first={index === 0}
                                    last={index === rows.length - 1}
                                    onUp={() => move(index, -1)}
                                    onDown={() => move(index, 1)}
                                    onRemove={() => removeRow(row)}
                                />
                            </div>
                        </li>
                    ))}
                </ol>

                <button
                    type="button"
                    onClick={addRow}
                    className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-line py-3 text-[13px] text-muted transition-colors hover:border-accent hover:text-text"
                >
                    <Icon name="plus" size={14} />
                    Yana nomzod qo&apos;shish
                </button>
            </section>

            {error && (
                <p className="mt-5 inline-flex items-start gap-2 rounded-xl bg-warn-soft px-4 py-2.5 text-[13px] text-warn-text">
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
                    {busy ? "Saqlanmoqda…" : poll ? "Saqlash" : "So'rovnomani qo'shish"}
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

function RowActions({
    className,
    first,
    last,
    onUp,
    onDown,
    onRemove,
}: {
    className: string;
    first: boolean;
    last: boolean;
    onUp: () => void;
    onDown: () => void;
    onRemove: () => void;
}) {
    const button =
        "grid size-8 place-items-center rounded-lg border border-line text-muted hover:text-text disabled:opacity-30";
    return (
        <div className={cn("shrink-0 gap-1", className)}>
            <button
                type="button"
                onClick={onUp}
                disabled={first}
                title="Yuqoriga"
                className={button}
            >
                <Icon name="arrowRight" size={13} className="-rotate-90" />
            </button>
            <button
                type="button"
                onClick={onDown}
                disabled={last}
                title="Pastga"
                className={button}
            >
                <Icon name="arrowRight" size={13} className="rotate-90" />
            </button>
            <button
                type="button"
                onClick={onRemove}
                title="Olib tashlash"
                className={cn(button, "hover:bg-warn-soft hover:text-warn-text")}
            >
                <Icon name="trash" size={13} />
            </button>
        </div>
    );
}

/** Nomzod rasmi: bosilsa fayl tanlanadi, ustidagi × — olib tashlash. */
function PhotoPicker({
    row,
    onPick,
    onRemove,
}: {
    row: Row;
    onPick: (file: File | undefined) => void;
    onRemove: () => void;
}) {
    const src = row.preview ?? (row.remove_photo ? null : row.photo);

    return (
        <div className="relative">
            <label
                title="Rasm tanlash"
                className="grid size-12 cursor-pointer place-items-center overflow-hidden rounded-xl border border-dashed border-line bg-surface text-[12px] font-semibold text-faint transition-colors hover:border-accent"
            >
                {src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={src} alt="" className="size-full object-cover" />
                ) : row.name.trim() ? (
                    initials(row.name)
                ) : (
                    <Icon name="image" size={16} />
                )}
                <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(event) => {
                        onPick(event.target.files?.[0]);
                        event.target.value = "";
                    }}
                />
            </label>
            {src && (
                <button
                    type="button"
                    onClick={onRemove}
                    title="Rasmni olib tashlash"
                    className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-invert text-on-invert shadow"
                >
                    <Icon name="close" size={10} />
                </button>
            )}
        </div>
    );
}

/** Muqova rasmi: joriy rasm ko'rinib turadi, xohlasa olib tashlanadi. */
function CoverInput({ current }: { current: string | null }) {
    const [preview, setPreview] = useState<string | null>(current);
    const [removed, setRemoved] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        return () => {
            if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    return (
        <div className="flex items-center gap-3">
            <span className="grid h-16 w-24 shrink-0 place-items-center overflow-hidden rounded-xl border border-line bg-page text-faint">
                {preview && !removed ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={preview} alt="" className="size-full object-cover" />
                ) : (
                    <Icon name="image" size={20} />
                )}
            </span>
            <div className="min-w-0 flex-1">
                <input
                    ref={fileRef}
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        setPreview(URL.createObjectURL(file));
                        setRemoved(false);
                    }}
                    className="w-full text-[12.5px] text-muted file:mr-3 file:rounded-full file:border file:border-line file:bg-page file:px-3.5 file:py-1.5 file:text-[12.5px] file:text-text hover:file:bg-surface"
                />
                {current && (
                    <label className="mt-1.5 inline-flex items-center gap-1.5 text-[12px] text-muted">
                        <input
                            type="checkbox"
                            name="remove_image"
                            checked={removed}
                            onChange={(event) => {
                                // Tanlangan yangi fayl ham bekor — aks holda u baribir yuklanardi
                                if (event.target.checked && fileRef.current) {
                                    fileRef.current.value = "";
                                    setPreview(current);
                                }
                                setRemoved(event.target.checked);
                            }}
                        />
                        Rasmni olib tashlash
                    </label>
                )}
            </div>
        </div>
    );
}
