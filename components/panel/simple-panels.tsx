"use client";

import { ResourceList } from "@/components/panel/resource-list";
import { formatShortDate } from "@/lib/format";
import type { Peer, Problem, Startup } from "@/lib/types";

/**
 * Moderatsiyadan boshqa amali yo'q bo'limlar: muammolar, tengdoshlar,
 * startaplar. Har biri `ResourceList`ga faqat qatorni qanday ko'rsatishni
 * aytadi — qolgani umumiy.
 */

type Moderated<T> = T & { status: string | null; visible: boolean };

export function ProblemsPanel({ items }: { items: Moderated<Problem>[] }) {
    return (
        <ResourceList<Moderated<Problem>>
            resource="problems"
            title="Tashkilot muammolari"
            description="Tashkilotlar kiritgan muammolarni tekshiring va yoshlarga oching."
            emptyText="Hali muammo kiritilmagan."
            searchPlaceholder="Tavsif bo'yicha qidirish"
            icon="clipboard"
            items={items}
            render={(item) => ({
                title: item.question || item.category_display,
                subtitle: item.description,
                icon: item.icon,
                href: `/tashabbuslar/muammolar/${item.id}`,
                meta: (
                    <>
                        <span>{item.organization?.name}</span>
                        <span>{item.category_display}</span>
                        <span>{item.solution_count} taklif</span>
                        <span>{formatShortDate(item.created_at)}</span>
                    </>
                ),
            })}
        />
    );
}

export function PeersPanel({ items }: { items: Moderated<Peer>[] }) {
    return (
        <ResourceList<Moderated<Peer>>
            resource="peers"
            title="Chet eldagi tengdoshlar"
            description="Anketalarni tekshiring — tasdiqlangani saytda ko'rinadi."
            emptyText="Hali anketa yuborilmagan."
            searchPlaceholder="Ism bo'yicha qidirish"
            icon="globe"
            items={items}
            render={(item) => ({
                title: item.full_name,
                subtitle: item.about,
                icon: item.purpose_icon,
                href: `/tengdoshlar/${item.id}`,
                meta: (
                    <>
                        <span style={{ color: item.country_color }}>{item.country_name}</span>
                        <span>{item.purpose_display}</span>
                        {item.institution && <span>{item.institution}</span>}
                        <span>{formatShortDate(item.created_at)}</span>
                    </>
                ),
            })}
        />
    );
}

export function StartupsPanel({ items }: { items: Moderated<Startup>[] }) {
    return (
        <ResourceList<Moderated<Startup>>
            resource="startups"
            title="Startaplar"
            description="Startap anketalarini tekshiring va saytda ko'rsating."
            emptyText="Hali startap yuborilmagan."
            searchPlaceholder="Nomi bo'yicha qidirish"
            icon="rocket"
            items={items}
            render={(item) => ({
                title: item.name,
                subtitle: item.about,
                icon: item.sphere_icon,
                meta: (
                    <>
                        <span>{item.sphere_display}</span>
                        <span>{item.stage_display}</span>
                        <span>{item.team_size} kishi</span>
                        <span>{formatShortDate(item.created_at)}</span>
                    </>
                ),
            })}
        />
    );
}
