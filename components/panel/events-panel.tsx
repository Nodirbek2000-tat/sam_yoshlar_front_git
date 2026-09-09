"use client";

import { ContentManager } from "@/components/panel/content-manager";
import { Field, INPUT, Toggle } from "@/components/panel/ui";
import { formatShortDate, formatTime } from "@/lib/format";
import type { Choice } from "@/lib/types";

export type PanelEvent = {
    id: number;
    slug: string;
    title: string;
    description: string;
    starts_at: string;
    ends_at: string | null;
    location: string;
    region: string;
    region_display: string;
    capacity: number;
    image_url: string | null;
    is_published: boolean;
    registered_count: number;
    is_past: boolean;
    visible: boolean;
};

/** `datetime-local` maydoni uchun ISO sanani mahalliy ko'rinishga o'tkazish. */
function toLocalInput(value: string | null) {
    if (!value) return "";
    const date = new Date(value);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function EventsPanel({
    events,
    regions,
}: {
    events: PanelEvent[];
    regions: Choice[];
}) {
    return (
        <ContentManager<PanelEvent>
            resource="events"
            tag="events"
            title="Tadbirlar"
            description="Trening, forum va uchrashuvlarni kiriting — joylar soni bilan."
            addLabel="Tadbir qo'shish"
            emptyText="Hali tadbir yo'q."
            icon="calendar"
            hideLabel="Saytda yashirish"
            showLabel="Saytda ko'rsatish"
            items={events}
            render={(item) => ({
                title: item.title,
                image: item.image_url,
                href: `/tadbirlar/${item.slug}`,
                icon: "calendar",
                badges: item.is_past ? (
                    <span className="rounded-full bg-surface px-2.5 py-0.5 text-[11px] text-faint">
                        O&apos;tgan
                    </span>
                ) : (
                    <span className="tone-blue rounded-full bg-tone-soft px-2.5 py-0.5 text-[11px] font-medium text-tone-text">
                        Yaqinda
                    </span>
                ),
                meta: (
                    <>
                        <span>
                            {formatShortDate(item.starts_at)} · {formatTime(item.starts_at)}
                        </span>
                        <span className="truncate">{item.location}</span>
                        <span>
                            {item.registered_count}/{item.capacity} ishtirokchi
                        </span>
                    </>
                ),
            })}
            renderForm={(item) => (
                <>
                    <h2 className="text-[15px] font-semibold">
                        {item ? "Tadbirni tahrirlash" : "Yangi tadbir"}
                    </h2>

                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                        <Field label="Nomi" className="md:col-span-2">
                            <input
                                name="title"
                                required
                                defaultValue={item?.title}
                                placeholder="Tadbir nomi"
                                className={INPUT}
                            />
                        </Field>

                        <Field label="Boshlanish vaqti">
                            <input
                                type="datetime-local"
                                name="starts_at"
                                required
                                defaultValue={toLocalInput(item?.starts_at ?? null)}
                                className={INPUT}
                            />
                        </Field>

                        <Field label="Tugash vaqti (ixtiyoriy)">
                            <input
                                type="datetime-local"
                                name="ends_at"
                                defaultValue={toLocalInput(item?.ends_at ?? null)}
                                className={INPUT}
                            />
                        </Field>

                        <Field label="Manzil">
                            <input
                                name="location"
                                required
                                defaultValue={item?.location}
                                placeholder="Shahar, ko'cha, bino"
                                className={INPUT}
                            />
                        </Field>

                        <Field label="Hudud">
                            <select name="region" defaultValue={item?.region ?? ""} className={INPUT}>
                                <option value="">Tanlanmagan</option>
                                {regions.map((choice) => (
                                    <option key={choice.value} value={choice.value}>
                                        {choice.label}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        <Field label="Joylar soni">
                            <input
                                type="number"
                                name="capacity"
                                min={1}
                                required
                                defaultValue={item?.capacity ?? 50}
                                className={INPUT}
                            />
                        </Field>

                        <Field label="Rasm">
                            <input
                                type="file"
                                name="image"
                                accept="image/*"
                                className="w-full text-[12.5px] text-muted file:mr-3 file:rounded-full file:border file:border-line file:bg-page file:px-3.5 file:py-1.5 file:text-[12.5px] file:text-text hover:file:bg-surface"
                            />
                        </Field>

                        <Field label="Tavsif" className="md:col-span-2">
                            <textarea
                                name="description"
                                required
                                rows={6}
                                defaultValue={item?.description}
                                placeholder="Tadbir haqida batafsil"
                                className={`${INPUT} resize-y leading-relaxed`}
                            />
                        </Field>
                    </div>

                    <div className="mt-5">
                        <Toggle
                            name="is_published"
                            label="Saytda ko'rinsin"
                            defaultChecked={item?.is_published ?? true}
                        />
                    </div>
                </>
            )}
        />
    );
}
