import Link from "next/link";

import { MarkAllRead } from "@/components/cabinet/mark-all-read";
import { EmptyState, PageHead, RowList } from "@/components/cabinet/ui";
import { Icon, type IconName } from "@/components/icon";
import { formatShortDate } from "@/lib/format";
import { meFetch } from "@/lib/me";

type Notification = {
    id: number;
    title: string;
    message: string;
    type: string;
    link: string;
    is_read: boolean;
    created_at: string;
};

const TONE: Record<string, { icon: IconName; color: string }> = {
    success: { icon: "check", color: "text-accent" },
    warning: { icon: "alert", color: "text-amber-600 dark:text-amber-400" },
    event: { icon: "calendar", color: "text-muted" },
    info: { icon: "bell", color: "text-muted" },
};

export default async function NotificationsPage() {
    const data = await meFetch<{
        count: number;
        unread: number;
        results: Notification[];
    }>("/notifications/", "/kabinet/bildirishnomalar");

    return (
        <>
            <PageHead
                title="Bildirishnomalar"
                subtitle={
                    data.unread
                        ? `${data.unread} ta o'qilmagan`
                        : data.count
                          ? "Hammasi o'qilgan"
                          : "Bildirishnoma yo'q"
                }
                action={data.unread > 0 ? <MarkAllRead /> : undefined}
            />

            {data.results.length ? (
                <RowList>
                    {data.results.map((item) => {
                        const tone = TONE[item.type] ?? TONE.info;
                        const body = (
                            <div className="flex gap-3.5 py-4">
                                <span className={`mt-0.5 shrink-0 ${tone.color}`}>
                                    <Icon name={tone.icon} size={17} />
                                </span>

                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-baseline gap-x-3">
                                        <span
                                            className={`text-[14px] ${item.is_read ? "font-normal text-muted" : "font-medium"}`}
                                        >
                                            {item.title}
                                        </span>
                                        <span className="text-[12px] text-faint">
                                            {formatShortDate(item.created_at)}
                                        </span>
                                    </div>

                                    {item.message && (
                                        <p className="mt-1 text-[13px] leading-relaxed text-muted">
                                            {item.message}
                                        </p>
                                    )}
                                </div>

                                {!item.is_read && (
                                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                                )}
                            </div>
                        );

                        return item.link ? (
                            <Link
                                key={item.id}
                                href={item.link}
                                className="block transition-opacity hover:opacity-70"
                            >
                                {body}
                            </Link>
                        ) : (
                            <div key={item.id}>{body}</div>
                        );
                    })}
                </RowList>
            ) : (
                <EmptyState
                    icon="bell"
                    title="Bildirishnoma yo'q"
                    text="Tashabbusingizga ovoz berilganda yoki taklif yozilganda shu yerda ko'rinadi."
                />
            )}
        </>
    );
}
