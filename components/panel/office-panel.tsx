"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Icon } from "@/components/icon";
import { OFFICE_SPHERES, OFFICE_STAGES, SpherePill, stageOf } from "@/components/office/office-ui";
import { ContentManager } from "@/components/panel/content-manager";
import { Field, INPUT, refreshPublic, Toggle } from "@/components/panel/ui";
import { cn } from "@/lib/cn";
import type { Choice, OfficeStartup } from "@/lib/types";

/**
 * Panel: Samarqand startuplar ofisi startaperlari.
 *
 * Tepada — Excel reestrni yuklash (faqat kerakli ustunlar va ichidagi
 * rasmlar olinadi), pastda — loyihalar ro'yxati: tahrirlash, yashirish, o'chirish.
 */

export type PanelOfficeStartup = OfficeStartup & {
    phone: string;
    telegram: string;
    birth_date: string | null;
    is_published: boolean;
    visible: boolean;
};

type ImportResult = {
    created: number;
    duplicates: number;
    empty: number;
    problems: string[];
};

export function OfficePanel({ items, districts }: { items: PanelOfficeStartup[]; districts: Choice[] }) {
    return (
        <>
            <ImportBox />
            <div className="mt-10">
                <ContentManager<PanelOfficeStartup>
                    resource="office-startups"
                    tag="office-startups"
                    title="Samarqand startuplar ofisi startaperlari"
                    description="Loyiha va uning asoschisi. Saytdagi «Startuplar ofisi» bo'limida ko'rinadi."
                    addLabel="Loyiha qo'shish"
                    emptyText="Hali loyiha yo'q — yuqoridan Excel reestrni yuklang."
                    icon="rocket"
                    hideLabel="Saytdan yashirish"
                    showLabel="Saytda ko'rsatish"
                    items={items}
                    render={(item) => ({
                        title: item.name,
                        icon: OFFICE_SPHERES.find((sphere) => sphere.value === item.sphere)?.tone ?? "spark",
                        image: item.project_image ?? item.photo,
                        href: `/startuplar-ofisi/${item.id}`,
                        badges: (
                            <>
                                <SpherePill value={item.sphere} className="py-0.5" />
                                <span
                                    className={cn(
                                        stageOf(item.stage).tone,
                                        "rounded-full bg-tone-soft px-2.5 py-0.5 text-[11px] font-medium text-tone-text",
                                    )}
                                >
                                    {item.stage_display}
                                </span>
                            </>
                        ),
                        meta: (
                            <>
                                <span className="font-medium text-muted">{item.full_name}</span>
                                {item.age ? <span>{item.age} yosh</span> : null}
                                {item.district_display ? <span>{item.district_display}</span> : null}
                                {item.phone ? <span>{item.phone}</span> : null}
                                {!item.contact_url && <span className="text-warn-text">Aloqa yo&apos;q</span>}
                            </>
                        ),
                    })}
                    renderForm={(item) => <OfficeForm item={item} districts={districts} />}
                />
            </div>
        </>
    );
}

function ImportBox() {
    const router = useRouter();
    const input = useRef<HTMLInputElement>(null);
    const [file, setFile] = useState<File | null>(null);
    const [busy, setBusy] = useState(false);
    const [result, setResult] = useState<ImportResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function upload() {
        if (!file || busy) return;
        setBusy(true);
        setError(null);
        setResult(null);
        try {
            const data = new FormData();
            data.set("file", file);
            const response = await fetch("/api/proxy/panel/office-startups/import", { method: "POST", body: data });
            const payload = (await response.json().catch(() => null)) as (ImportResult & { detail?: string }) | null;
            if (!response.ok || !payload) {
                setError(payload?.detail ?? "Yuklab bo'lmadi.");
                return;
            }
            setResult(payload);
            setFile(null);
            if (input.current) input.current.value = "";
            await refreshPublic("office-startups");
            router.refresh();
        } catch {
            setError("Tarmoqda xatolik.");
        } finally {
            setBusy(false);
        }
    }

    return (
        <section className="tone-emerald relative overflow-hidden rounded-3xl border border-tone-line bg-tone-soft p-5 md:p-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-center">
                <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-tone text-page">
                    <Icon name="download" size={24} />
                </span>
                <div className="min-w-0 flex-1">
                    <h2 className="text-[17px] font-semibold">Excel reestrni yuklash</h2>
                    <p className="mt-1 text-[13px] leading-relaxed text-muted">
                        Faqat kerakli ustunlar o&apos;qiladi: <b>Hudud, F.I.Sh, Yoshi, Rasmi, Loyiha haqida, StartUp sohasi,
                        StartUp bosqichi, Loyiha rasmi, Telefon</b>. Qolganlari e&apos;tiborsiz qoladi. Rasmlar Excel
                        ichidan olinadi. Bir xil loyiha ikki marta yuklanmaydi.
                    </p>
                </div>
            </div>

            <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:items-center">
                <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-tone-line bg-page px-4 py-3 transition-colors hover:border-tone">
                    <Icon name="doc" size={18} className="shrink-0 text-tone-text" />
                    <span className={cn("truncate text-[13.5px]", file ? "font-medium" : "text-muted")}>
                        {file ? file.name : ".xlsx faylni tanlang"}
                    </span>
                    {file && <span className="ml-auto shrink-0 text-[12px] text-faint">{(file.size / 1024 / 1024).toFixed(1)} MB</span>}
                    <input
                        ref={input}
                        type="file"
                        accept=".xlsx,.xlsm,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        className="sr-only"
                        onChange={(event) => {
                            setFile(event.target.files?.[0] ?? null);
                            setResult(null);
                            setError(null);
                        }}
                    />
                </label>
                <button
                    type="button"
                    onClick={upload}
                    disabled={!file || busy}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-invert px-6 py-3 text-[14px] font-medium text-on-invert transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                    {busy ? "Yuklanmoqda…" : "Import qilish"}
                </button>
            </div>

            {error && (
                <p className="mt-4 inline-flex items-start gap-2 rounded-xl bg-warn-soft px-4 py-2.5 text-[13px] text-warn-text">
                    <Icon name="alert" size={15} className="mt-0.5 shrink-0" />
                    {error}
                </p>
            )}

            {result && (
                <div className="mt-4 rounded-2xl bg-page p-4">
                    <div className="flex flex-wrap gap-2.5">
                        <Stat value={result.created} label="qo'shildi" tone="tone-emerald" />
                        <Stat value={result.duplicates} label="oldin bor edi — o'tkazildi" tone="tone-slate" />
                        {result.empty > 0 && <Stat value={result.empty} label="bo'sh qator" tone="tone-amber" />}
                        {result.problems.length > 0 && (
                            <Stat value={result.problems.length} label="xato" tone="tone-rose" />
                        )}
                    </div>
                    {result.problems.length > 0 && (
                        <ul className="mt-3 space-y-1 text-[12.5px] text-warn-text">
                            {result.problems.map((problem) => (
                                <li key={problem}>• {problem}</li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </section>
    );
}

function Stat({ value, label, tone }: { value: number; label: string; tone: string }) {
    return (
        <span className={cn(tone, "inline-flex items-baseline gap-1.5 rounded-xl bg-tone-soft px-3 py-2")}>
            <span className="text-lg font-semibold tabular-nums text-tone-text">{value}</span>
            <span className="text-[12.5px] text-muted">{label}</span>
        </span>
    );
}

function OfficeForm({ item, districts }: { item: PanelOfficeStartup | null; districts: Choice[] }) {
    return (
        <div className="grid gap-4 md:grid-cols-2">
            <Field label="Loyiha nomi" className="md:col-span-2">
                <input name="name" required maxLength={200} defaultValue={item?.name ?? ""} className={INPUT} />
            </Field>
            <Field label="Loyiha haqida" className="md:col-span-2">
                <textarea name="about" rows={5} defaultValue={item?.about ?? ""} className={INPUT} />
            </Field>
            <Field label="Soha">
                <select name="sphere" defaultValue={item?.sphere ?? "other"} className={INPUT}>
                    {OFFICE_SPHERES.map((sphere) => (
                        <option key={sphere.value} value={sphere.value}>
                            {sphere.emoji} {sphere.label}
                        </option>
                    ))}
                </select>
            </Field>
            <Field label="Bosqich">
                <select name="stage" defaultValue={item?.stage ?? "idea"} className={INPUT}>
                    {OFFICE_STAGES.map((stage) => (
                        <option key={stage.value} value={stage.value}>
                            {stage.label} — {stage.hint}
                        </option>
                    ))}
                </select>
            </Field>

            <Field label="Asoschi F.I.Sh.">
                <input name="full_name" required maxLength={150} defaultValue={item?.full_name ?? ""} className={INPUT} />
            </Field>
            <Field label="Tuman / shahar">
                <select name="district" defaultValue={item?.district ?? ""} className={INPUT}>
                    <option value="">—</option>
                    {districts.map((district) => (
                        <option key={district.value} value={district.value}>
                            {district.label}
                        </option>
                    ))}
                </select>
            </Field>
            <Field label="Tug'ilgan sana">
                <input type="date" name="birth_date" defaultValue={item?.birth_date ?? ""} className={INPUT} />
            </Field>
            <Field label="Telefon">
                <input name="phone" defaultValue={item?.phone ?? ""} placeholder="+998 90 123 45 67" className={INPUT} />
            </Field>
            <Field label="Telegram username (bo'lsa — aloqa shu orqali)" className="md:col-span-2">
                <input name="telegram" defaultValue={item?.telegram ?? ""} placeholder="@username" className={INPUT} />
            </Field>

            <Field label="Asoschi rasmi">
                <ImageField name="photo_file" removeName="remove_photo" current={item?.photo ?? null} round />
            </Field>
            <Field label="Loyiha rasmi">
                <ImageField name="project_image_file" removeName="remove_project_image" current={item?.project_image ?? null} />
            </Field>

            <div className="md:col-span-2">
                <Toggle name="is_published" label="Saytda ko'rinsin" defaultChecked={item?.is_published ?? true} />
            </div>
        </div>
    );
}

/** Rasm tanlash: joriysi ko'rinadi, yangisi tanlansa — oldindan ko'rish, xohlasa olib tashlash. */
function ImageField({
    name,
    removeName,
    current,
    round = false,
}: {
    name: string;
    removeName: string;
    current: string | null;
    round?: boolean;
}) {
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
            <span
                className={cn(
                    "grid size-16 shrink-0 place-items-center overflow-hidden border border-line bg-page text-faint",
                    round ? "rounded-full" : "rounded-xl",
                )}
            >
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
                    name={name}
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
                            name={removeName}
                            checked={removed}
                            onChange={(event) => {
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
