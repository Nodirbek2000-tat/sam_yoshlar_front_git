"use client";

import { ContentManager } from "@/components/panel/content-manager";
import { Field, INPUT, Toggle } from "@/components/panel/ui";
import { formatShortDate } from "@/lib/format";
import type { Choice } from "@/lib/types";

export type PanelAnnouncement = {
    id: number;
    slug: string;
    title: string;
    type: string;
    type_display: string;
    icon: string;
    body: string;
    file_url: string | null;
    posted_at: string;
    deadline: string | null;
    is_active: boolean;
    is_expired: boolean;
    visible: boolean;
};

/** Matn qanday yozilsa, saytda qanday chiqadi. */
const MARKUP = [
    { code: "# Matn", text: "Katta sarlavha" },
    { code: "## Matn", text: "Kichik sarlavha" },
    { code: "**Matn**", text: "Qalin" },
    { code: "*Matn*", text: "Qiya" },
    { code: "- Matn", text: "Ro'yxat qatori" },
    { code: "[Matn](https://sayt.uz)", text: "Havola — bosilsa saytga o'tadi" },
    { code: ">> Matn", text: "O'ng tomonda" },
    { code: "---", text: "Ajratuvchi chiziq" },
];

function MarkupHelp() {
    return (
        <div className="mt-3 rounded-xl border border-line bg-surface p-3.5">
            <p className="text-[12px] font-medium">Matnni bezash belgilari</p>
            <dl className="mt-2.5 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
                {MARKUP.map((row) => (
                    <div key={row.code} className="flex items-baseline gap-2 text-[12px]">
                        <dt className="shrink-0 rounded bg-page px-1.5 py-0.5 font-mono text-[11.5px] text-text">
                            {row.code}
                        </dt>
                        <dd className="text-muted">{row.text}</dd>
                    </div>
                ))}
            </dl>
            <p className="mt-2.5 text-[11.5px] text-faint">
                Bo&apos;sh qator — yangi xatboshi. Belgisiz yozsangiz oddiy matn bo&apos;lib chiqadi.
            </p>
        </div>
    );
}

/** `date` maydoni uchun: `2026-09-09`. */
function toDateInput(value: string | null) {
    if (!value) return "";
    return value.slice(0, 10);
}

export function AnnouncementsPanel({
    announcements,
    types,
}: {
    announcements: PanelAnnouncement[];
    types: Choice[];
}) {
    return (
        <ContentManager<PanelAnnouncement>
            resource="announcements"
            tag="announcements"
            title="E'lonlar"
            description="Grant, kredit, tanlov, trening va vakansiyalarni muddati bilan kiriting."
            addLabel="E'lon qo'shish"
            emptyText="Hali e'lon yo'q."
            icon="megaphone"
            hideLabel="Faolsizlantirish"
            showLabel="Faollashtirish"
            items={announcements}
            render={(item) => ({
                title: item.title,
                icon: item.icon,
                href: `/elonlar/${item.slug}`,
                badges: (
                    <>
                        <span className="rounded-full bg-tone-soft px-2.5 py-0.5 text-[11px] font-medium text-tone-text">
                            {item.type_display}
                        </span>
                        {item.is_expired && (
                            <span className="rounded-full bg-warn-soft px-2.5 py-0.5 text-[11px] font-medium text-warn-text">
                                Muddati tugagan
                            </span>
                        )}
                    </>
                ),
                meta: (
                    <>
                        <span>{formatShortDate(item.posted_at)}</span>
                        {item.deadline && <span>Muddat: {formatShortDate(item.deadline)}</span>}
                        {item.file_url && <span>Hujjat bor</span>}
                    </>
                ),
            })}
            renderForm={(item) => (
                <>
                    <h2 className="text-[15px] font-semibold">
                        {item ? "E'lonni tahrirlash" : "Yangi e'lon"}
                    </h2>

                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                        <Field label="Sarlavha" className="md:col-span-2">
                            <input
                                name="title"
                                required
                                defaultValue={item?.title}
                                placeholder="E'lon sarlavhasi"
                                className={INPUT}
                            />
                        </Field>

                        <Field label="Turi">
                            <select
                                name="type"
                                required
                                defaultValue={item?.type ?? types[0]?.value}
                                className={INPUT}
                            >
                                {types.map((choice) => (
                                    <option key={choice.value} value={choice.value}>
                                        {choice.label}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        <Field label="E'lon sanasi">
                            <input
                                type="date"
                                name="posted_at"
                                defaultValue={toDateInput(
                                    item?.posted_at ?? new Date().toISOString(),
                                )}
                                className={INPUT}
                            />
                        </Field>

                        <Field label="Muddat (ixtiyoriy)">
                            <input
                                type="date"
                                name="deadline"
                                defaultValue={toDateInput(item?.deadline ?? null)}
                                className={INPUT}
                            />
                        </Field>

                        <Field label="Hujjat (ixtiyoriy)">
                            <input
                                type="file"
                                name="file"
                                className="w-full text-[12.5px] text-muted file:mr-3 file:rounded-full file:border file:border-line file:bg-page file:px-3.5 file:py-1.5 file:text-[12.5px] file:text-text hover:file:bg-surface"
                            />
                        </Field>

                        <Field label="Matn" className="md:col-span-2">
                            <textarea
                                name="body"
                                required
                                rows={10}
                                defaultValue={item?.body}
                                placeholder={"# Katta sarlavha\n## Kichik sarlavha\nOddiy matn, ichida **qalin** so'z.\n- ro'yxat qatori\n[Havola matni](https://sayt.uz)\n>> o'ng tomonda"}
                                className={`${INPUT} resize-y font-mono text-[13px] leading-relaxed`}
                            />
                            <MarkupHelp />
                        </Field>
                    </div>

                    <div className="mt-5">
                        <Toggle
                            name="is_active"
                            label="Faol (saytda ko'rinadi)"
                            defaultChecked={item?.is_active ?? true}
                        />
                    </div>
                </>
            )}
        />
    );
}
