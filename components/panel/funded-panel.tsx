"use client";

import { useEffect, useState } from "react";

import { Icon } from "@/components/icon";
import { Img } from "@/components/img";
import { ContentManager } from "@/components/panel/content-manager";
import { ImageField } from "@/components/panel/office-panel";
import { Field, INPUT, Toggle } from "@/components/panel/ui";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/format";
import type { FundedStartup } from "@/lib/types";

/**
 * Panel: mablag' (grant, investitsiya) olgan startaplar — bosh sahifaning
 * eng tepasidagi lenta. Asosiy rasm, qo'shimcha rasmlar, video, nomi,
 * qancha va kimdan olgani. Qo'shilganda botga «mablag' oldi» xabari ketadi.
 */

/** Backend bilan bir xil cheklovlar */
const PHOTO_LIMIT = 20;
const VIDEO_MAX_MB = 50;

export type PanelFundedStartup = FundedStartup & {
    // Panel har doim yangi javob oladi — rasmlar va video maydoni bor
    photos: { id: number; url: string }[];
    video: string | null;
    order: number;
    is_published: boolean;
    visible: boolean;
};

export function FundedPanel({ items }: { items: PanelFundedStartup[] }) {
    return (
        <ContentManager<PanelFundedStartup>
            resource="funded"
            tag="funded"
            title="Mablag' olgan startuplar"
            description="Bosh sahifaning eng tepasidagi lentada chiqadi, bosilsa — rasmlar va video bilan oyna ochiladi. Qo'shilganda botga «mablag' oldi» xabari ketadi."
            addLabel="Startap qo'shish"
            emptyText="Hali startap qo'shilmagan — bosh sahifada bo'lim ko'rinmaydi."
            icon="bank"
            hideLabel="Saytdan yashirish"
            showLabel="Saytda ko'rsatish"
            items={items}
            render={(item) => ({
                title: item.name,
                icon: "rocket",
                image: item.image,
                href: "/",
                badges: (
                    <>
                        {item.amount ? (
                            <span className="tone-emerald rounded-full bg-tone-soft px-2.5 py-0.5 text-[11px] font-semibold text-tone-text">
                                {formatMoney(item.amount, item.currency)}
                            </span>
                        ) : null}
                        {item.year ? (
                            <span className="rounded-full bg-surface px-2.5 py-0.5 text-[11px] tabular-nums">{item.year}</span>
                        ) : null}
                        {item.photos.length ? (
                            <span className="rounded-full bg-surface px-2.5 py-0.5 text-[11px]">
                                +{item.photos.length} rasm
                            </span>
                        ) : null}
                        {item.video ? (
                            <span className="rounded-full bg-surface px-2.5 py-0.5 text-[11px]">Video</span>
                        ) : null}
                    </>
                ),
                meta: (
                    <>
                        {item.funder ? <span className="font-medium text-muted">{item.funder}</span> : null}
                        {item.founder ? <span>{item.founder}</span> : null}
                        <span>Tartib: {item.order}</span>
                    </>
                ),
            })}
            renderForm={(item) => <FundedForm item={item} />}
        />
    );
}

function FundedForm({ item }: { item: PanelFundedStartup | null }) {
    return (
        <div className="grid gap-4 md:grid-cols-2">
            <Field label="Startap nomi">
                <input name="name" required maxLength={200} defaultValue={item?.name ?? ""} className={INPUT} />
            </Field>
            <Field label="Yo'nalish (ixtiyoriy)">
                <input name="sphere" maxLength={100} defaultValue={item?.sphere ?? ""} placeholder="AgroTech" className={INPUT} />
            </Field>
            <Field label="Olgan mablag'i">
                <input
                    type="number"
                    name="amount"
                    min={0}
                    step={1}
                    defaultValue={item?.amount ?? ""}
                    placeholder="500000000"
                    className={INPUT}
                />
            </Field>
            <Field label="Valyuta">
                <select name="currency" defaultValue={item?.currency ?? "UZS"} className={INPUT}>
                    <option value="UZS">so&apos;m</option>
                    <option value="USD">AQSH dollari ($)</option>
                </select>
            </Field>
            <Field label="Mablag' bergan tashkilot">
                <input name="funder" maxLength={200} defaultValue={item?.funder ?? ""} placeholder="IT Park, grant…" className={INPUT} />
            </Field>
            <Field label="Yili">
                <input type="number" name="year" min={2000} max={2100} defaultValue={item?.year ?? ""} className={INPUT} />
            </Field>
            <Field label="Asoschi (ixtiyoriy)">
                <input name="founder" maxLength={200} defaultValue={item?.founder ?? ""} className={INPUT} />
            </Field>
            <Field label="Tartib (kichigi oldinda)">
                <input type="number" name="order" min={0} defaultValue={item?.order ?? 0} className={INPUT} />
            </Field>
            <Field label="Startap haqida (bosilganda ko'rinadi)" className="md:col-span-2">
                <textarea name="about" rows={4} defaultValue={item?.about ?? ""} className={INPUT} />
            </Field>
            <Field label="Asosiy rasm (lentadagi kartada)" className="md:col-span-2">
                <ImageField name="image_file" removeName="remove_image" current={item?.image ?? null} />
            </Field>
            <GalleryField photos={item?.photos ?? []} />
            <VideoField current={item?.video ?? null} />
            <div className="md:col-span-2">
                <Toggle name="is_published" label="Saytda ko'rinsin" defaultChecked={item?.is_published ?? true} />
            </div>
        </div>
    );
}

/** Qo'shimcha rasmlar: mavjudlari (o'chirish belgilanadi) va yangilari (bir nechtasi birdan). */
function GalleryField({ photos }: { photos: { id: number; url: string }[] }) {
    const [removing, setRemoving] = useState<number[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [warning, setWarning] = useState<string | null>(null);
    const room = PHOTO_LIMIT - (photos.length - removing.length);

    useEffect(() => () => previews.forEach((url) => URL.revokeObjectURL(url)), [previews]);

    return (
        <div className="md:col-span-2">
            <span className="mb-1.5 flex items-center justify-between text-[12.5px] text-muted">
                <span>Qo&apos;shimcha rasmlar (oynada galereya)</span>
                <span className="tabular-nums text-faint">
                    {photos.length - removing.length + previews.length} / {PHOTO_LIMIT}
                </span>
            </span>

            {(photos.length > 0 || previews.length > 0) && (
                <div className="mb-2.5 grid grid-cols-4 gap-2 sm:grid-cols-6">
                    {photos.map((photo) => {
                        const gone = removing.includes(photo.id);
                        return (
                            <div
                                key={photo.id}
                                className={cn(
                                    "relative aspect-square overflow-hidden rounded-xl border border-line bg-page",
                                    gone && "opacity-35",
                                )}
                            >
                                <Img src={photo.url} sizes="96px" maxWidth={256} className="size-full object-cover" />
                                {gone && <input type="hidden" name="remove_photos" value={photo.id} />}
                                <button
                                    type="button"
                                    aria-label={gone ? "Qaytarish" : "O'chirish"}
                                    title={gone ? "Qaytarish" : "O'chirish"}
                                    onClick={() =>
                                        setRemoving((current) =>
                                            gone ? current.filter((id) => id !== photo.id) : [...current, photo.id],
                                        )
                                    }
                                    className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80"
                                >
                                    <Icon name={gone ? "plus" : "close"} size={12} />
                                </button>
                            </div>
                        );
                    })}
                    {previews.map((url) => (
                        <div key={url} className="relative aspect-square overflow-hidden rounded-xl border border-accent/50 bg-page">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={url} alt="" className="size-full object-cover" />
                            <span className="absolute bottom-1 left-1 rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-medium text-white">
                                yangi
                            </span>
                        </div>
                    ))}
                </div>
            )}

            <input
                type="file"
                name="new_photos"
                accept="image/*"
                multiple
                onChange={(event) => {
                    const files = [...(event.target.files ?? [])];
                    if (files.length > room) {
                        event.target.value = "";
                        setPreviews([]);
                        setWarning(`Ko'pi bilan ${PHOTO_LIMIT} ta — yana ${Math.max(room, 0)} ta qo'shish mumkin.`);
                        return;
                    }
                    setWarning(null);
                    setPreviews(files.map((file) => URL.createObjectURL(file)));
                }}
                className="w-full text-[12.5px] text-muted file:mr-3 file:rounded-full file:border file:border-line file:bg-page file:px-3.5 file:py-1.5 file:text-[12.5px] file:text-text hover:file:bg-surface"
            />
            <p className={cn("mt-1.5 text-[11.5px]", warning ? "text-warn-text" : "text-faint")}>
                {warning ?? "Bir nechtasini birdan tanlang (Ctrl bilan). Har biri 10 MB gacha."}
            </p>
        </div>
    );
}

/** Video: bitta, 50 MB gacha. Tanlangan katta fayl darhol rad etiladi. */
function VideoField({ current }: { current: string | null }) {
    const [picked, setPicked] = useState<string | null>(null);
    const [remove, setRemove] = useState(false);
    const [warning, setWarning] = useState<string | null>(null);

    return (
        <div className="md:col-span-2">
            <span className="mb-1.5 block text-[12.5px] text-muted">Video (ixtiyoriy)</span>
            <div className="flex flex-col gap-3 rounded-xl border border-line bg-page p-3 sm:flex-row sm:items-center">
                {current && !remove && !picked ? (
                    <video src={current} controls preload="metadata" className="aspect-video w-full rounded-lg bg-black sm:w-56" />
                ) : (
                    <span className="grid aspect-video w-full place-items-center rounded-lg bg-surface px-3 text-center text-[12px] text-faint sm:w-56">
                        {picked ?? "Video tanlanmagan"}
                    </span>
                )}
                <div className="flex flex-1 flex-col gap-2">
                    <input
                        type="file"
                        name="video_file"
                        accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov,.m4v"
                        onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (file && file.size > VIDEO_MAX_MB * 1024 * 1024) {
                                event.target.value = "";
                                setPicked(null);
                                setWarning(
                                    `Video ${VIDEO_MAX_MB} MB dan oshmasin (tanlangani ${(file.size / 1024 / 1024).toFixed(1)} MB).`,
                                );
                                return;
                            }
                            setWarning(null);
                            setPicked(file ? `${file.name} · ${(file.size / 1024 / 1024).toFixed(1)} MB` : null);
                            if (file) setRemove(false);
                        }}
                        className="w-full text-[12.5px] text-muted file:mr-3 file:rounded-full file:border file:border-line file:bg-page file:px-3.5 file:py-1.5 file:text-[12.5px] file:text-text hover:file:bg-surface"
                    />
                    {current && !picked && (
                        <label className="inline-flex w-fit cursor-pointer items-center gap-2 text-[12.5px] text-muted">
                            <input
                                type="checkbox"
                                name="remove_video"
                                value="true"
                                checked={remove}
                                onChange={(event) => setRemove(event.target.checked)}
                            />
                            Videoni olib tashlash
                        </label>
                    )}
                    <p className={cn("text-[11.5px]", warning ? "text-warn-text" : "text-faint")}>
                        {warning ?? `MP4, WEBM yoki MOV — ${VIDEO_MAX_MB} MB gacha.`}
                    </p>
                </div>
            </div>
        </div>
    );
}
