"use client";

import { ResourceList } from "@/components/panel/resource-list";
import { VoteAdjust } from "@/components/panel/vote-adjust";
import { formatShortDate } from "@/lib/format";
import type { Initiative } from "@/lib/types";

type Row = Initiative & { status: string | null; visible: boolean };

export function InitiativesPanel({ items }: { items: Row[] }) {
    return (
        <ResourceList<Row>
            resource="initiatives"
            title="Tashabbuslar"
            description="Yoshlar bildirgan g'oyalarni tasdiqlang, yashiring yoki ovozini sozlang."
            emptyText="Hali tashabbus yo'q."
            searchPlaceholder="Sarlavha bo'yicha qidirish"
            icon="spark"
            items={items}
            render={(item) => ({
                title: item.title,
                subtitle: item.summary || item.description,
                icon: item.kind_icon,
                href: `/tashabbuslar/${item.id}`,
                meta: (
                    <>
                        <span style={{ color: item.direction_info?.color }}>
                            {item.direction_info?.name}
                        </span>
                        <span>{item.author_label}</span>
                        {item.region_display && <span>{item.region_display}</span>}
                        <span>{formatShortDate(item.created_at)}</span>
                    </>
                ),
            })}
            extra={(item) => <VoteAdjust id={item.id} votes={item.vote_count} />}
        />
    );
}
