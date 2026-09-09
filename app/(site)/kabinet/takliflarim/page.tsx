import Link from "next/link";

import { EmptyState, PageHead, RowList } from "@/components/cabinet/ui";
import { Icon } from "@/components/icon";
import { formatShortDate } from "@/lib/format";
import { meFetch } from "@/lib/me";

type MyComment = {
    id: number;
    text: string;
    created_at: string;
    initiative: { id: number; title: string; vote_count: number };
};

export default async function MyCommentsPage() {
    const data = await meFetch<{ count: number; results: MyComment[] }>(
        "/comments/",
        "/kabinet/takliflarim",
    );

    return (
        <>
            <PageHead
                title="Takliflarim"
                subtitle={
                    data.count
                        ? `Boshqalarning tashabbuslariga ${data.count} ta taklif yozgansiz`
                        : "Hali taklif yozmagansiz"
                }
            />

            {data.results.length ? (
                <RowList>
                    {data.results.map((comment) => (
                        <div key={comment.id} className="py-4">
                            <Link
                                href={`/tashabbuslar/${comment.initiative.id}#takliflar`}
                                className="group block transition-opacity hover:opacity-70"
                            >
                                <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-faint">
                                    <span className="inline-flex items-center gap-1.5">
                                        <Icon name="spark" size={12} />
                                        <span className="line-clamp-1 max-w-sm text-muted">
                                            {comment.initiative.title}
                                        </span>
                                    </span>
                                    <span>{formatShortDate(comment.created_at)}</span>
                                </span>

                                <p className="mt-2 text-[14px] leading-relaxed">{comment.text}</p>
                            </Link>
                        </div>
                    ))}
                </RowList>
            ) : (
                <EmptyState
                    icon="chat"
                    title="Taklif yozmagansiz"
                    text="Yoqqan tashabbusni oching va qanday hal qilish mumkinligini yozing — muallifga bildirishnoma boradi."
                    href="/tashabbuslar/yoshlar"
                    action="Tashabbuslarni ko'rish"
                />
            )}
        </>
    );
}
