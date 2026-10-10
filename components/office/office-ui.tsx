import Link from "next/link";

import { Icon } from "@/components/icon";
import { Img } from "@/components/img";
import { cn } from "@/lib/cn";
import { toneClass } from "@/lib/tone";
import type { OfficeStartup } from "@/lib/types";

/**
 * Samarqand startuplar ofisi — umumiy bo'laklar: soha va bosqich ranglari,
 * startap kartasi, asoschi surati. Backenddagi `OfficeSphere` / `OfficeStage`
 * bilan bir xil kalitlar.
 */

export const OFFICE_SPHERES: { value: string; label: string; short: string; emoji: string; tone: string }[] = [
    { value: "edtech", label: "EdTech — ta'lim texnologiyalari", short: "EdTech", emoji: "🎓", tone: "graduation" },
    { value: "greentech", label: "GreenTech — ekologiya va energiya tejash", short: "GreenTech", emoji: "🌱", tone: "seedling" },
    { value: "ai", label: "AI & Data — sun'iy intellekt va tahlil", short: "AI & Data", emoji: "🤖", tone: "computer" },
    { value: "healthtech", label: "HealthTech — tibbiyot innovatsiyalari", short: "HealthTech", emoji: "🏥", tone: "stethoscope" },
    { value: "social", label: "Social Impact — ijtimoiy muammolar yechimi", short: "Social Impact", emoji: "🤝", tone: "users" },
    { value: "fintech", label: "FinTech — raqamli moliyaviy xizmatlar", short: "FinTech", emoji: "💰", tone: "card" },
    { value: "agritech", label: "AgriTech — aqlli qishloq xo'jaligi", short: "AgriTech", emoji: "🚜", tone: "wheat" },
    { value: "ecommerce", label: "E-commerce — onlayn savdo", short: "E-commerce", emoji: "🛒", tone: "cart" },
    { value: "logistics", label: "Logistics — transport va yetkazib berish", short: "Logistics", emoji: "🚚", tone: "truck" },
    { value: "smartcity", label: "Smart City — aqlli shahar", short: "Smart City", emoji: "🏙️", tone: "building" },
    { value: "tourism", label: "Turizm", short: "Turizm", emoji: "🧭", tone: "globe" },
    { value: "other", label: "Boshqa", short: "Boshqa", emoji: "✨", tone: "spark" },
];

export const OFFICE_STAGES: { value: string; label: string; tone: string; hint: string }[] = [
    { value: "idea", label: "G'oya", tone: "tone-amber", hint: "G'oya bosqichida" },
    { value: "mvp", label: "MVP", tone: "tone-blue", hint: "Sinov versiyasi tayyor" },
    { value: "sales", label: "Sotuv", tone: "tone-emerald", hint: "Sotuv va kengayish" },
    { value: "seed", label: "Seed", tone: "tone-violet", hint: "Investitsiya bosqichi" },
];

export const sphereOf = (value: string) =>
    OFFICE_SPHERES.find((item) => item.value === value) ?? OFFICE_SPHERES[OFFICE_SPHERES.length - 1];

export const stageOf = (value: string) => OFFICE_STAGES.find((item) => item.value === value) ?? OFFICE_STAGES[0];

const initials = (name: string) =>
    name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("");

/** Asoschi surati — bo'lmasa bosh harflar. */
export function FounderAvatar({
    item,
    size = 48,
    className,
}: {
    item: Pick<OfficeStartup, "full_name" | "photo">;
    size?: number;
    className?: string;
}) {
    return (
        <span
            className={cn(
                toneClass(item.full_name),
                "grid shrink-0 place-items-center overflow-hidden rounded-full bg-tone-soft font-semibold text-tone-text",
                className,
            )}
            style={{ width: size, height: size, fontSize: Math.max(12, size * 0.34) }}
        >
            {item.photo ? (
                <Img src={item.photo} alt={item.full_name} sizes={`${size}px`} maxWidth={384} className="size-full object-cover" />
            ) : (
                initials(item.full_name)
            )}
        </span>
    );
}

export function SpherePill({ value, className }: { value: string; className?: string }) {
    const sphere = sphereOf(value);
    return (
        <span
            className={cn(
                toneClass(sphere.tone),
                "inline-flex items-center gap-1.5 rounded-full border border-tone-line bg-tone-soft px-2.5 py-1 text-[11.5px] font-medium text-tone-text",
                className,
            )}
        >
            <span aria-hidden>{sphere.emoji}</span>
            {sphere.short}
        </span>
    );
}

export function StagePill({ value, className }: { value: string; className?: string }) {
    const stage = stageOf(value);
    return (
        <span
            className={cn(
                stage.tone,
                "inline-flex items-center gap-1.5 rounded-full bg-page/90 px-2.5 py-1 text-[11.5px] font-semibold text-tone-text backdrop-blur",
                className,
            )}
        >
            <span className="size-1.5 rounded-full bg-tone" />
            {stage.label}
        </span>
    );
}

/** Ro'yxatdagi karta: loyiha rasmi, ustida asoschi surati, nomi, qisqa tavsif. */
export function OfficeCard({ item }: { item: OfficeStartup }) {
    const sphere = sphereOf(item.sphere);

    return (
        <Link
            href={`/startuplar-ofisi/${item.id}`}
            className={cn(
                toneClass(sphere.tone),
                "group relative flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-raised transition-all duration-300 hover:-translate-y-1 hover:border-tone-line hover:shadow-[0_22px_44px_-26px_var(--tone)]",
            )}
        >
            <div className="relative aspect-[16/10] overflow-hidden bg-tone-soft">
                {item.project_image ? (
                    <Img
                        src={item.project_image}
                        alt={item.name}
                        sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
                        maxWidth={828}
                        className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                    />
                ) : (
                    <div className="grid size-full place-items-center">
                        <div className="grid-lines absolute inset-0 opacity-40 [mask-image:radial-gradient(70%_70%_at_50%_50%,#000,transparent)]" />
                        <span className="relative text-6xl" aria-hidden>
                            {sphere.emoji}
                        </span>
                    </div>
                )}
                <span className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/35 to-transparent" />
                <StagePill value={item.stage} className="absolute right-3 top-3" />
            </div>

            <div className="relative flex flex-1 flex-col px-5 pb-5">
                <div className="-mt-7 flex items-end justify-between gap-3">
                    <FounderAvatar item={item} size={56} className="ring-4 ring-raised" />
                    <SpherePill value={item.sphere} className="mb-1" />
                </div>

                <h3 className="mt-3 text-[17px] font-semibold leading-snug tracking-tight">{item.name}</h3>
                {item.about && (
                    <p className="mt-1.5 line-clamp-2 text-[13.5px] leading-relaxed text-muted">{item.about}</p>
                )}

                <div className="mt-auto pt-4">
                    <div className="flex items-center justify-between gap-3 border-t border-line pt-3.5">
                        <div className="min-w-0">
                            <p className="truncate text-[13px] font-medium">{item.full_name}</p>
                            <p className="mt-0.5 flex items-center gap-1 truncate text-[12px] text-faint">
                                {item.age ? <span>{item.age} yosh</span> : null}
                                {item.age && item.district_display ? <span>·</span> : null}
                                {item.district_display && <span className="truncate">{item.district_display}</span>}
                            </p>
                        </div>
                        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-tone-soft text-tone-text transition-transform duration-300 group-hover:translate-x-0.5">
                            <Icon name="arrowRight" size={15} />
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
