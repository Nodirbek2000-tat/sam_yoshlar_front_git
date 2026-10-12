"use client";

import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";

import { Icon, type IconName } from "@/components/icon";
import { EmptyState, PanelHeader, SearchBox } from "@/components/panel/ui";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";

type Counts = { users: number; initiatives: number; votes: number };
type MahallaRow = Counts & { name: string };

export type RegionStats = {
    totals: Counts & { mahallas: number; users_with_mahalla: number };
    districts: (Counts & {
        value: string;
        label: string;
        mahalla_count: number;
        without_mahalla: Counts;
        mahallas: MahallaRow[];
    })[];
    unknown: Counts;
};

type Metric = keyof Counts;

const METRICS: { value: Metric; label: string; icon: IconName }[] = [
    { value: "users", label: "Foydalanuvchilar", icon: "users" },
    { value: "initiatives", label: "Tashabbuslar", icon: "bulb" },
    { value: "votes", label: "Ovozlar", icon: "vote" },
];

/**
 * Hududlar statistikasi: tumanlar ro'yxati (tanlangan ko'rsatkich bo'yicha
 * tartiblangan, chiziqli ulush bilan), tuman bosilsa — mahallalari.
 */
export function RegionStatsPanel({ data }: { data: RegionStats }) {
    const [metric, setMetric] = useState<Metric>("users");
    const [open, setOpen] = useState<string | null>(null);
    const [query, setQuery] = useState("");

    const needle = query.trim().toLowerCase();
    const rows = useMemo(() => {
        const list = data.districts.map((district) => ({
            ...district,
            // Qidiruv mahalla nomi bo'yicha: mos mahallasi bor tumanlar qoladi
            mahallas: needle
                ? district.mahallas.filter((row) => row.name.toLowerCase().includes(needle))
                : district.mahallas,
        }));
        const filtered = needle
            ? list.filter((district) => district.mahallas.length || district.label.toLowerCase().includes(needle))
            : list;
        return filtered.sort((a, b) => b[metric] - a[metric] || a.label.localeCompare(b.label));
    }, [data.districts, metric, needle]);

    const peak = Math.max(1, ...data.districts.map((district) => district[metric]));
    const share = data.totals.users
        ? Math.round((data.totals.users_with_mahalla / data.totals.users) * 100)
        : 0;

    return (
        <>
            <PanelHeader
                title="Hududlar statistikasi"
                description="Samarqand viloyati: tuman va mahallalar kesimida foydalanuvchilar, tashabbuslar va ovozlar."
            />

            {/* Umumiy sonlar */}
            <div className="mt-6 grid grid-cols-2 gap-2.5 md:grid-cols-5">
                <Tile label="Foydalanuvchilar" value={data.totals.users} />
                <Tile label="Mahallasini kiritgan" value={data.totals.users_with_mahalla} note={`${share}%`} />
                <Tile label="Mahallalar" value={data.totals.mahallas} />
                <Tile label="Tashabbuslar" value={data.totals.initiatives} />
                <Tile label="Ovozlar" value={data.totals.votes} />
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
                <SearchBox value={query} onChange={setQuery} placeholder="Mahalla nomi bo'yicha qidirish" />
                <div className="inline-flex rounded-full border border-line p-1" role="tablist" aria-label="Tartiblash">
                    {METRICS.map((item) => (
                        <button
                            key={item.value}
                            type="button"
                            role="tab"
                            aria-selected={metric === item.value}
                            onClick={() => setMetric(item.value)}
                            className={cn(
                                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] transition-colors",
                                metric === item.value ? "bg-invert text-on-invert" : "text-muted hover:text-text",
                            )}
                        >
                            <Icon name={item.icon} size={13} />
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>

            {rows.length ? (
                <ul className="mt-5 space-y-2">
                    {rows.map((district) => {
                        const expanded = open === district.value || Boolean(needle && district.mahallas.length);
                        const value = district[metric];
                        return (
                            <li key={district.value} className="overflow-hidden rounded-2xl border border-line bg-raised">
                                <button
                                    type="button"
                                    onClick={() => setOpen(open === district.value ? null : district.value)}
                                    aria-expanded={expanded}
                                    className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 p-4 text-left transition-colors hover:bg-surface md:grid-cols-[14rem_minmax(0,1fr)_auto]"
                                >
                                    <span className="min-w-0">
                                        <span className="block truncate text-[14.5px] font-medium">{district.label}</span>
                                        <span className="mt-0.5 block text-[12px] text-faint">
                                            {district.mahalla_count} ta mahalla
                                        </span>
                                    </span>

                                    {/* Ulush chizig'i: eng kattasiga nisbatan */}
                                    <span
                                        className="col-span-2 row-start-2 block h-1.5 overflow-hidden rounded-full bg-surface md:col-span-1 md:row-start-1 md:col-start-2"
                                        title={`${district.label}: ${formatNumber(value)}`}
                                    >
                                        <span
                                            className="block h-full rounded-full bg-accent transition-[width] duration-500"
                                            style={{ width: `${(value / peak) * 100}%` }}
                                        />
                                    </span>

                                    <span className="flex items-center gap-4 text-[12.5px] tabular-nums text-muted">
                                        <Count icon="users" value={district.users} strong={metric === "users"} />
                                        <Count icon="bulb" value={district.initiatives} strong={metric === "initiatives"} />
                                        <Count icon="vote" value={district.votes} strong={metric === "votes"} />
                                        <Icon
                                            name="arrowRight"
                                            size={13}
                                            className={cn("text-faint transition-transform", expanded && "rotate-90")}
                                        />
                                    </span>
                                </button>

                                <AnimatePresence initial={false}>
                                    {expanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.25 }}
                                            className="overflow-hidden border-t border-line"
                                        >
                                            <MahallaTable district={district} metric={metric} />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <EmptyState text="Bunday mahalla topilmadi." />
            )}

            {data.unknown.users + data.unknown.initiatives > 0 && (
                <p className="mt-4 text-[12.5px] text-faint">
                    Tumani ko&apos;rsatilmagan: {formatNumber(data.unknown.users)} foydalanuvchi,{" "}
                    {formatNumber(data.unknown.initiatives)} tashabbus, {formatNumber(data.unknown.votes)} ovoz.
                </p>
            )}
        </>
    );
}

function MahallaTable({ district, metric }: { district: RegionStats["districts"][number]; metric: Metric }) {
    const rows = [...district.mahallas].sort((a, b) => b[metric] - a[metric] || a.name.localeCompare(b.name));
    const missing = district.without_mahalla;

    return (
        <div className="bg-page p-3 sm:p-4">
            {rows.length ? (
                <table className="w-full text-[13px]">
                    <thead>
                        <tr className="text-left text-[11.5px] uppercase tracking-[0.06em] text-faint">
                            <th className="py-1.5 pl-2 font-medium">Mahalla</th>
                            <th className="py-1.5 text-right font-medium">Foydalanuvchi</th>
                            <th className="py-1.5 text-right font-medium">Tashabbus</th>
                            <th className="py-1.5 pr-2 text-right font-medium">Ovoz</th>
                        </tr>
                    </thead>
                    <tbody className="tabular-nums">
                        {rows.map((row) => (
                            <tr key={row.name} className="border-t border-line">
                                <td className="max-w-0 truncate py-2 pl-2 font-medium">{row.name}</td>
                                <td className="py-2 text-right">{formatNumber(row.users)}</td>
                                <td className="py-2 text-right">{formatNumber(row.initiatives)}</td>
                                <td className="py-2 pr-2 text-right">{formatNumber(row.votes)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p className="px-2 py-3 text-[13px] text-muted">Hali mahalla kiritilmagan.</p>
            )}
            {missing.users + missing.initiatives + missing.votes > 0 && (
                <p className="mt-2 px-2 text-[12px] text-faint">
                    Mahallasi ko&apos;rsatilmagan: {formatNumber(missing.users)} foydalanuvchi,{" "}
                    {formatNumber(missing.initiatives)} tashabbus, {formatNumber(missing.votes)} ovoz
                </p>
            )}
        </div>
    );
}

function Tile({ label, value, note }: { label: string; value: number; note?: string }) {
    return (
        <div className="rounded-2xl border border-line bg-raised p-4">
            <p className="text-[12px] text-muted">{label}</p>
            <p className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-semibold tabular-nums tracking-tight">{formatNumber(value)}</span>
                {note && <span className="text-[12px] text-faint">{note}</span>}
            </p>
        </div>
    );
}

function Count({ icon, value, strong }: { icon: IconName; value: number; strong: boolean }) {
    return (
        <span className={cn("inline-flex items-center gap-1", strong && "font-semibold text-text")}>
            <Icon name={icon} size={12} className="text-faint" />
            {formatNumber(value)}
        </span>
    );
}
