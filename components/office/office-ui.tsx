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

/**
 * Muqova — har bir loyihada Samarqand startup ofisining logosi.
 * Loyiha rasmi (Excel yoki paneldan yuklangan) saytda ko'rsatilmaydi.
 */
export const OFFICE_LOGO = {
    small: "/startuplar-ofisi/logo-640.webp",
    large: "/startuplar-ofisi/logo-1080.webp",
    /** Ijtimoiy tarmoqlarda ulashilganda */
    share: "/startuplar-ofisi/logo-share.jpg",
};

export function OfficeCover({
    priority = false,
    className,
    imageClassName,
}: {
    priority?: boolean;
    className?: string;
    imageClassName?: string;
}) {
    return (
        <div className={cn("relative overflow-hidden bg-[#e7ebf2]", className)}>
            {/* Logo kvadrat — chetlari o'zining xira nusxasi bilan to'ldiriladi */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={OFFICE_LOGO.small}
                alt=""
                aria-hidden
                loading={priority ? "eager" : "lazy"}
                decoding="async"
                className="absolute inset-0 size-full scale-125 object-cover opacity-70 blur-2xl"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={OFFICE_LOGO.small}
                srcSet={`${OFFICE_LOGO.small} 640w, ${OFFICE_LOGO.large} 1080w`}
                sizes="(min-width: 1024px) 520px, 100vw"
                alt="Samarqand startup ofisi"
                loading={priority ? "eager" : "lazy"}
                decoding="async"
                {...(priority ? { fetchPriority: "high" as const } : {})}
                className={cn("relative size-full object-contain", imageClassName)}
            />
        </div>
    );
}

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
            <div className="relative aspect-[16/10] overflow-hidden">
                <OfficeCover
                    className="size-full"
                    imageClassName="transition-transform duration-700 group-hover:scale-[1.05]"
                />
                <span className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/25 to-transparent" />
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
