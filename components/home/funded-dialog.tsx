"use client";

import { useState } from "react";

import { Dialog } from "@/components/dialog";
import { Icon, type IconName } from "@/components/icon";
import { Img } from "@/components/img";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/format";
import type { FundedStartup } from "@/lib/types";

type Media = { key: string; kind: "image" | "video"; url: string };

/** Asosiy rasm, qo'shimcha rasmlar va video — bitta ro'yxat (video oxirida). */
function mediaOf(item: FundedStartup): Media[] {
    const list: Media[] = [];
    if (item.image) list.push({ key: "cover", kind: "image", url: item.image });
    // Eski keshlangan javobda `photos` bo'lmasligi mumkin
    for (const photo of item.photos ?? []) list.push({ key: `photo-${photo.id}`, kind: "image", url: photo.url });
    if (item.video) list.push({ key: "video", kind: "video", url: item.video });
    return list;
}

/** Kartaga bosilganda: rasmlar va video, qancha va kimdan mablag' olgani, qisqa tavsif. */
export default function FundedDialog({ item, onClose }: { item: FundedStartup | null; onClose: () => void }) {
    return (
        <Dialog
            open={Boolean(item)}
            onClose={onClose}
            label={item?.name ?? "Startap"}
            // Yopish tugmasi rasm ustida turadi — qoramtir fonda oq bo'lsin
            className="tone-emerald p-0 sm:max-w-2xl sm:p-0 [&_[data-dialog-close]]:bg-black/45 [&_[data-dialog-close]]:text-white [&_[data-dialog-close]]:hover:bg-black/65 [&_[data-dialog-close]]:hover:text-white"
        >
            {/* `key` — boshqa startap ochilsa galereya birinchi rasmdan boshlanadi */}
            {item && <Content key={item.id} item={item} />}
        </Dialog>
    );
}

function Content({ item }: { item: FundedStartup }) {
    const media = mediaOf(item);
    const [index, setIndex] = useState(0);
    const current = media[index];
    const paragraphs = item.about
        .split(/\n+/)
        .map((line) => line.trim())
        .filter(Boolean);

    const step = (delta: number) => setIndex((value) => (value + delta + media.length) % media.length);

    return (
        <div>
            <div className="relative aspect-[16/9] overflow-hidden rounded-t-3xl bg-black">
                {!current ? (
                    <div className="grid size-full place-items-center bg-tone-soft text-tone-text">
                        <Icon name="rocket" size={48} strokeWidth={1.3} />
                    </div>
                ) : current.kind === "video" ? (
                    <video
                        key={current.key}
                        src={current.url}
                        poster={item.image ?? undefined}
                        controls
                        autoPlay
                        playsInline
                        className="size-full object-contain"
                    />
                ) : (
                    <Img
                        key={current.key}
                        src={current.url}
                        alt={item.name}
                        sizes="(min-width: 640px) 672px, 100vw"
                        maxWidth={1280}
                        priority
                        className="size-full object-contain"
                    />
                )}

                {current?.kind !== "video" && (
                    <span className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/55 to-transparent" />
                )}
                {item.amount && current?.kind !== "video" ? (
                    <span className="absolute bottom-4 left-5 rounded-full bg-[#16a34a] px-3.5 py-1.5 text-[14px] font-semibold text-white shadow-lg">
                        {formatMoney(item.amount, item.currency)}
                    </span>
                ) : null}

                {media.length > 1 && (
                    <>
                        <Arrow side="left" onClick={() => step(-1)} />
                        <Arrow side="right" onClick={() => step(1)} />
                        <span className="absolute bottom-4 right-5 rounded-full bg-black/50 px-2.5 py-1 text-[12px] tabular-nums text-white backdrop-blur">
                            {index + 1} / {media.length}
                        </span>
                    </>
                )}
            </div>

            {/* Kichik rasmlar: qaysi biri ko'rinayotgani belgilanadi */}
            {media.length > 1 && (
                <div className="flex gap-2 overflow-x-auto px-6 pt-4 [scrollbar-width:thin] sm:px-7">
                    {media.map((entry, position) => (
                        <button
                            key={entry.key}
                            type="button"
                            onClick={() => setIndex(position)}
                            aria-label={entry.kind === "video" ? "Video" : `${position + 1}-rasm`}
                            aria-current={position === index}
                            className={cn(
                                "relative h-14 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all",
                                position === index ? "border-tone" : "border-transparent opacity-70 hover:opacity-100",
                            )}
                        >
                            {entry.kind === "video" ? (
                                <span className="grid size-full place-items-center bg-black text-white">
                                    <svg aria-hidden viewBox="0 0 12 12" className="size-4 fill-current">
                                        <path d="M3 1.8v8.4L10 6z" />
                                    </svg>
                                </span>
                            ) : (
                                <Img src={entry.url} alt="" sizes="80px" maxWidth={256} className="size-full object-cover" />
                            )}
                        </button>
                    ))}
                </div>
            )}

            <div className="p-6 sm:p-7">
                <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-tone-text">
                    Mablag&apos; olgan startap
                </p>
                <h3 className="mt-1.5 text-2xl font-semibold tracking-tight">{item.name}</h3>

                <div className="mt-4 flex flex-wrap gap-2">
                    {item.amount ? (
                        <span className="tone-emerald inline-flex items-center gap-1.5 rounded-full bg-tone-soft px-3 py-1.5 text-[13px] font-semibold text-tone-text">
                            <Icon name="bank" size={14} />
                            {formatMoney(item.amount, item.currency)}
                        </span>
                    ) : null}
                    {item.funder && <Fact icon="building" text={item.funder} />}
                    {item.year && <Fact icon="calendar" text={`${item.year}-yil`} />}
                    {item.sphere && <Fact icon="spark" text={item.sphere} />}
                    {item.founder && <Fact icon="user" text={item.founder} />}
                </div>

                {paragraphs.length > 0 && (
                    <div className="mt-5 space-y-3 text-[14.5px] leading-relaxed text-muted">
                        {paragraphs.map((paragraph, position) => (
                            <p key={position}>{paragraph}</p>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function Arrow({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={side === "left" ? "Oldingi" : "Keyingi"}
            className={cn(
                "absolute top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white backdrop-blur transition-colors hover:bg-black/65",
                side === "left" ? "left-3" : "right-3",
            )}
        >
            <Icon name={side === "left" ? "arrowLeft" : "arrowRight"} size={18} />
        </button>
    );
}

function Fact({ icon, text }: { icon: IconName; text: string }) {
    return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-[13px] text-muted">
            <Icon name={icon} size={14} />
            {text}
        </span>
    );
}
