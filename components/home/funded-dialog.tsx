"use client";

import { Dialog } from "@/components/dialog";
import { Icon, type IconName } from "@/components/icon";
import { Img } from "@/components/img";
import { formatMoney } from "@/lib/format";
import type { FundedStartup } from "@/lib/types";

/** Kartaga bosilganda: rasm, qancha va kimdan mablag' olgani, qisqa tavsif. */
export default function FundedDialog({ item, onClose }: { item: FundedStartup | null; onClose: () => void }) {
    const paragraphs = (item?.about ?? "")
        .split(/\n+/)
        .map((line) => line.trim())
        .filter(Boolean);

    return (
        <Dialog
            open={Boolean(item)}
            onClose={onClose}
            label={item?.name ?? "Startap"}
            className="tone-emerald p-0 sm:max-w-xl sm:p-0"
        >
            {item && (
                <div>
                    <div className="relative aspect-[16/9] overflow-hidden rounded-t-3xl bg-surface">
                        {item.image ? (
                            <Img
                                src={item.image}
                                alt={item.name}
                                sizes="(min-width: 640px) 576px, 100vw"
                                maxWidth={1080}
                                priority
                                className="size-full object-cover"
                            />
                        ) : (
                            <div className="grid size-full place-items-center text-tone-text">
                                <Icon name="rocket" size={48} strokeWidth={1.3} />
                            </div>
                        )}
                        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/55 to-transparent" />
                        {item.amount ? (
                            <span className="absolute bottom-4 left-5 rounded-full bg-[#16a34a] px-3.5 py-1.5 text-[14px] font-semibold text-white shadow-lg">
                                {formatMoney(item.amount, item.currency)}
                            </span>
                        ) : null}
                    </div>

                    <div className="p-6 sm:p-7">
                        <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-tone-text">
                            Mablag&apos; olgan startap
                        </p>
                        <h3 className="mt-1.5 text-2xl font-semibold tracking-tight">{item.name}</h3>

                        <div className="mt-4 flex flex-wrap gap-2">
                            {item.funder && <Fact icon="building" text={item.funder} />}
                            {item.year && <Fact icon="calendar" text={`${item.year}-yil`} />}
                            {item.sphere && <Fact icon="spark" text={item.sphere} />}
                            {item.founder && <Fact icon="user" text={item.founder} />}
                        </div>

                        {paragraphs.length > 0 && (
                            <div className="mt-5 space-y-3 text-[14.5px] leading-relaxed text-muted">
                                {paragraphs.map((paragraph, index) => (
                                    <p key={index}>{paragraph}</p>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </Dialog>
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
