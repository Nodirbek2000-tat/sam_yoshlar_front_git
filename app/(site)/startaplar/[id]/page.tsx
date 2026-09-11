import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CategoryIcon } from "@/components/category-icon";
import { STAGE_TONE } from "@/components/directory/cards";
import { Icon } from "@/components/icon";
import { Reveal } from "@/components/motion-primitives";
import { ApiError, getStartup } from "@/lib/api";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/format";
import { toneClass } from "@/lib/tone";

async function load(id: string) {
    try {
        return await getStartup(id);
    } catch (error) {
        if (error instanceof ApiError) return null;
        throw error;
    }
}

export async function generateMetadata({
    params,
}: PageProps<"/startaplar/[id]">): Promise<Metadata> {
    const startup = await load((await params).id);
    if (!startup) return { title: "Startap" };
    return { title: startup.name, description: startup.about.slice(0, 150) };
}

/** Bosqichlar yo'li — startap qayerda turganini ko'rsatadi. */
const STAGES = [
    { value: "idea", label: "G'oya" },
    { value: "mvp", label: "MVP" },
    { value: "launched", label: "Bozorda" },
    { value: "scaling", label: "Kengaymoqda" },
];

export default async function StartupPage({ params }: PageProps<"/startaplar/[id]">) {
    const startup = await load((await params).id);
    if (!startup) notFound();

    const current = STAGES.findIndex((stage) => stage.value === startup.stage);
    const investment = formatMoney(startup.needed_investment);

    return (
        <article className={toneClass(startup.sphere_icon)}>
            <section className="relative overflow-hidden border-b border-line">
                <div aria-hidden className="aurora" />
                <div className="container-page relative py-10 md:py-14">
                    <Link
                        href="/startaplar"
                        className="group inline-flex items-center gap-1.5 text-[13px] text-muted transition-colors hover:text-text"
                    >
                        <Icon
                            name="arrowLeft"
                            size={14}
                            className="transition-transform duration-200 group-hover:-translate-x-0.5"
                        />
                        Startaplar
                    </Link>

                    <Reveal className="mt-7 flex flex-wrap items-center gap-5">
                        <span className="grid size-24 shrink-0 place-items-center overflow-hidden rounded-3xl border border-tone-line bg-page text-tone-text shadow-sm">
                            {startup.logo_url ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img src={startup.logo_url} alt={startup.name} className="size-full object-cover" />
                            ) : (
                                <CategoryIcon slug={startup.sphere_icon} size={38} />
                            )}
                        </span>

                        <div className="min-w-0">
                            <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                                {startup.name}
                            </h1>
                            <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13.5px]">
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-tone-line bg-tone-soft px-3 py-1 font-medium text-tone-text">
                                    <CategoryIcon slug={startup.sphere_icon} size={13} />
                                    {startup.sphere_display}
                                </span>
                                <span
                                    className={cn(
                                        STAGE_TONE[startup.stage] ?? "tone-slate",
                                        "rounded-full bg-tone-soft px-3 py-1 font-medium text-tone-text",
                                    )}
                                >
                                    {startup.stage_display}
                                </span>
                                {startup.region_display && (
                                    <span className="inline-flex items-center gap-1 text-muted">
                                        <Icon name="pin" size={13} />
                                        {startup.region_display}
                                    </span>
                                )}
                            </p>
                        </div>
                    </Reveal>

                    {/* Bosqichlar yo'li */}
                    <ol className="mt-9 grid max-w-2xl grid-cols-4 gap-2">
                        {STAGES.map((stage, index) => (
                            <li key={stage.value}>
                                <span
                                    className={cn(
                                        "block h-1.5 rounded-full",
                                        index <= current ? "bg-tone" : "bg-line",
                                    )}
                                />
                                <span
                                    className={cn(
                                        "mt-2 block text-[12px]",
                                        index === current ? "font-semibold text-tone-text" : "text-faint",
                                    )}
                                >
                                    {stage.label}
                                </span>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            <div className="container-page grid gap-10 py-10 md:py-14 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-14">
                <div className="min-w-0 space-y-10">
                    <section>
                        <h2 className="text-[12px] font-medium uppercase tracking-[0.1em] text-faint">
                            Startap nima qiladi
                        </h2>
                        <div className="mt-3 space-y-4 text-[15.5px] leading-[1.75] text-muted">
                            {startup.about.split("\n").filter(Boolean).map((line, index) => (
                                <p key={index}>{line}</p>
                            ))}
                        </div>
                    </section>

                    {startup.problem_solved && (
                        <section className="rounded-2xl border-l-2 border-tone bg-tone-soft px-5 py-4">
                            <h2 className="text-[12px] font-medium uppercase tracking-[0.1em] text-tone-text">
                                Hal qiladigan muammo
                            </h2>
                            <p className="mt-2 whitespace-pre-line text-[15px] leading-relaxed">
                                {startup.problem_solved}
                            </p>
                        </section>
                    )}
                </div>

                <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
                    <dl className="overflow-hidden rounded-2xl border border-line">
                        <Fact label="Asoschi" value={startup.full_name || "—"} />
                        <Fact label="Jamoa" value={`${startup.team_size} kishi`} />
                        <Fact label="Kerakli investitsiya" value={investment || "Ko'rsatilmagan"} strong />
                    </dl>

                    {(startup.website || startup.pitch_url) && (
                        <div className="grid gap-2">
                            {startup.website && (
                                <a
                                    href={startup.website}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center justify-center gap-2 rounded-full bg-invert px-5 py-3 text-[14px] font-medium text-on-invert transition-opacity hover:opacity-90"
                                >
                                    <Icon name="globe" size={15} />
                                    {startup.website.replace(/^https?:\/\//, "")}
                                </a>
                            )}
                            {startup.pitch_url && (
                                <a
                                    href={startup.pitch_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center justify-center gap-2 rounded-full border border-tone-line bg-tone-soft px-5 py-3 text-[14px] font-medium text-tone-text transition-opacity hover:opacity-90"
                                >
                                    <Icon name="doc" size={15} />
                                    Pitchni ochish
                                </a>
                            )}
                        </div>
                    )}
                </aside>
            </div>
        </article>
    );
}

function Fact({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
    return (
        <div className="border-b border-line bg-raised px-5 py-4 last:border-b-0">
            <dt className="text-[12px] text-faint">{label}</dt>
            <dd className={cn("mt-0.5", strong ? "text-lg font-semibold text-tone-text" : "text-[14.5px] font-medium")}>
                {value}
            </dd>
        </div>
    );
}
