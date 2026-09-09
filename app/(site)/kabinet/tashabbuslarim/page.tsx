import Link from "next/link";

import { DeleteInitiative } from "@/components/cabinet/delete-initiative";
import { EmptyState, PageHead, RowList } from "@/components/cabinet/ui";
import { Icon } from "@/components/icon";
import { formatShortDate } from "@/lib/format";
import { meFetch } from "@/lib/me";
import type { Initiative } from "@/lib/types";

export default async function MyInitiativesPage() {
    const data = await meFetch<{ count: number; results: Initiative[] }>(
        "/initiatives/",
        "/kabinet/tashabbuslarim",
    );

    return (
        <>
            <PageHead
                title="Tashabbuslarim"
                subtitle={
                    data.count
                        ? `${data.count} ta tashabbus bildirgansiz`
                        : "Hali tashabbus bildirmagansiz"
                }
                action={
                    <Link
                        href="/tashabbuslar/bildirish"
                        className="inline-flex items-center gap-2 rounded-full bg-invert px-4 py-2 text-[13px] font-medium text-on-invert transition-opacity hover:opacity-90"
                    >
                        <Icon name="plus" size={14} />
                        Yangi
                    </Link>
                }
            />

            {data.results.length ? (
                <RowList>
                    {data.results.map((idea) => (
                        <div key={idea.id} className="flex flex-wrap items-center gap-4 py-4">
                            <Link
                                href={`/tashabbuslar/${idea.id}`}
                                className="min-w-0 flex-1 transition-opacity hover:opacity-70"
                            >
                                <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px]">
                                    <span
                                        className="inline-flex items-center gap-1.5"
                                        style={{ color: idea.direction_info.color }}
                                    >
                                        <span className="size-1.5 rounded-full bg-current" />
                                        {idea.direction_info.name}
                                    </span>
                                    <span className="text-faint">
                                        {formatShortDate(idea.created_at)}
                                    </span>
                                </span>

                                <span className="mt-1.5 block text-[14.5px] font-medium leading-snug">
                                    {idea.title}
                                </span>

                                <span className="mt-1.5 flex flex-wrap items-center gap-x-4 text-[12.5px] text-faint">
                                    <span className="inline-flex items-center gap-1.5">
                                        <Icon name="chat" size={12} />
                                        {idea.comment_count} taklif
                                    </span>
                                    {idea.rank && <span>Reytingda #{idea.rank}</span>}
                                </span>
                            </Link>

                            <div className="flex shrink-0 items-center gap-4">
                                <span className="text-right">
                                    <span className="block text-[16px] font-semibold tabular-nums">
                                        {idea.vote_count}
                                    </span>
                                    <span className="text-[11.5px] text-faint">ovoz</span>
                                </span>

                                <DeleteInitiative id={idea.id} title={idea.title} />
                            </div>
                        </div>
                    ))}
                </RowList>
            ) : (
                <EmptyState
                    icon="spark"
                    title="Hali tashabbus yo'q"
                    text="Muammo, g'oya yoki startap fikringizni bildiring — u reytingga tushadi va ovoz to'playdi."
                    href="/tashabbuslar/bildirish"
                    action="Tashabbus bildirish"
                />
            )}
        </>
    );
}
