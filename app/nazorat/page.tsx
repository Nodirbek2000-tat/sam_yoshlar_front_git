import Link from "next/link";

import { Icon, type IconName } from "@/components/icon";
import { Reveal, Stagger, StaggerItem } from "@/components/motion-primitives";
import { formatShortDate } from "@/lib/format";
import { panelFetch } from "@/lib/panel";
import type { Event, Initiative } from "@/lib/types";

type Stat = { key: string; label: string; icon: string; value: number };
type Pending = Stat & { href: string };

type PanelOverview = {
    stats: Stat[];
    pending: Pending[];
    recent_users: {
        id: number;
        full_name: string;
        email: string;
        role_display: string;
        initials: string;
        is_verified: boolean;
        created_at: string;
    }[];
    top_initiatives: Initiative[];
    upcoming_events: Event[];
};

export default async function PanelDashboard() {
    const data = await panelFetch<PanelOverview>("/overview/");

    const needsAttention = data.pending.filter((row) => row.value > 0);

    return (
        <>
            <Reveal>
                <h1 className="text-2xl font-semibold tracking-tight">Boshqaruv</h1>
                <p className="mt-1.5 text-[14px] text-muted">
                    Platformaning umumiy holati va e&apos;tibor talab qiladigan ishlar.
                </p>
            </Reveal>

            {/* --- E'tibor talab qiladiganlar birinchi turadi --- */}
            {needsAttention.length > 0 && (
                <Reveal delay={0.05} className="mt-8">
                    <h2 className="text-[12px] font-medium uppercase tracking-[0.1em] text-faint">
                        E&apos;tibor kerak
                    </h2>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        {needsAttention.map((row) => (
                            <Link
                                key={row.key}
                                href={row.href}
                                className="group flex items-center gap-3.5 rounded-xl border border-line px-4 py-3.5 transition-colors hover:bg-surface"
                            >
                                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent-text">
                                    <Icon name={row.icon as IconName} size={17} />
                                </span>
                                <span className="min-w-0 flex-1 text-[13.5px]">{row.label}</span>
                                <span className="shrink-0 rounded-full bg-invert px-2 py-0.5 text-[12px] font-semibold tabular-nums text-on-invert">
                                    {row.value}
                                </span>
                                <Icon
                                    name="arrowRight"
                                    size={14}
                                    className="shrink-0 text-faint transition-transform group-hover:translate-x-0.5"
                                />
                            </Link>
                        ))}
                    </div>
                </Reveal>
            )}

            {/* --- Raqamlar --- */}
            <Stagger className="mt-10 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
                {data.stats.map((stat) => (
                    <StaggerItem key={stat.key} className="bg-page p-5">
                        <Icon
                            name={stat.icon as IconName}
                            size={16}
                            className="text-faint"
                            strokeWidth={1.6}
                        />
                        <div className="mt-3 text-[1.75rem] font-semibold tabular-nums tracking-tight">
                            {stat.value.toLocaleString("uz-UZ").replace(/,/g, " ")}
                        </div>
                        <div className="mt-0.5 text-[12.5px] text-faint">{stat.label}</div>
                    </StaggerItem>
                ))}
            </Stagger>

            <div className="mt-12 grid gap-10 lg:grid-cols-2">
                {/* --- Eng ko'p ovoz olganlar --- */}
                <Reveal>
                    <div className="flex items-end justify-between gap-4">
                        <h2 className="text-[15px] font-semibold">Eng ko&apos;p ovoz olganlar</h2>
                        <Link
                            href="/nazorat/tashabbuslar"
                            className="text-[12.5px] text-muted hover:text-text"
                        >
                            Barchasi
                        </Link>
                    </div>

                    <div className="mt-4 divide-y divide-line border-y border-line">
                        {data.top_initiatives.length ? (
                            data.top_initiatives.map((idea, index) => (
                                <div key={idea.id} className="flex items-center gap-4 py-3">
                                    <span className="w-5 shrink-0 text-[12px] tabular-nums text-faint">
                                        {index + 1}
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="line-clamp-1 block text-[13.5px] font-medium">
                                            {idea.title}
                                        </span>
                                        <span
                                            className="mt-0.5 block text-[12px]"
                                            style={{ color: idea.direction_info.color }}
                                        >
                                            {idea.direction_info.name}
                                        </span>
                                    </span>
                                    <span className="shrink-0 text-[13px] font-semibold tabular-nums">
                                        {idea.vote_count}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <Empty />
                        )}
                    </div>
                </Reveal>

                {/* --- Yangi foydalanuvchilar --- */}
                <Reveal delay={0.05}>
                    <div className="flex items-end justify-between gap-4">
                        <h2 className="text-[15px] font-semibold">Yangi foydalanuvchilar</h2>
                        <Link
                            href="/nazorat/foydalanuvchilar"
                            className="text-[12.5px] text-muted hover:text-text"
                        >
                            Barchasi
                        </Link>
                    </div>

                    <div className="mt-4 divide-y divide-line border-y border-line">
                        {data.recent_users.length ? (
                            data.recent_users.map((user) => (
                                <div key={user.id} className="flex items-center gap-3 py-3">
                                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-surface text-[11px] font-semibold text-muted">
                                        {user.initials}
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate text-[13.5px] font-medium">
                                            {user.full_name}
                                        </span>
                                        <span className="block text-[12px] text-faint">
                                            {user.role_display} · {formatShortDate(user.created_at)}
                                        </span>
                                    </span>
                                    {!user.is_verified && (
                                        <span className="shrink-0 rounded-full border border-line px-2 py-0.5 text-[11px] text-faint">
                                            Tugallanmagan
                                        </span>
                                    )}
                                </div>
                            ))
                        ) : (
                            <Empty />
                        )}
                    </div>
                </Reveal>
            </div>
        </>
    );
}

function Empty() {
    return <p className="py-8 text-center text-[13px] text-faint">Ma&apos;lumot yo&apos;q.</p>;
}
