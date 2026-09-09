import type { ReactNode } from "react";

import { Reveal } from "@/components/motion-primitives";
import { cn } from "@/lib/cn";

/**
 * Bo'lim sahifalarining yuqori qismi.
 *
 * Fon: rangli yumshoq yog'du (`aurora`) + juda nozik to'r. Rasm yo'q,
 * shuning uchun kechki rejimga o'zi moslashadi va tez yuklanadi.
 */
export function PageHero({
    eyebrow,
    title,
    lead,
    action,
    className,
}: {
    eyebrow: string;
    title: ReactNode;
    lead?: ReactNode;
    action?: ReactNode;
    className?: string;
}) {
    return (
        <section className={cn("relative overflow-hidden border-b border-line", className)}>
            <div className="aurora" />
            <div className="grid-lines absolute inset-0 opacity-[0.35] [mask-image:radial-gradient(70%_60%_at_50%_0%,#000,transparent)]" />

            <div className="container-page relative py-10 md:py-14">
                <Reveal>
                    <span className="inline-flex items-center gap-2 rounded-full border border-line bg-page/70 px-3 py-1 text-[11.5px] font-medium uppercase tracking-[0.12em] text-muted backdrop-blur">
                        <span className="size-1.5 rounded-full bg-accent" />
                        {eyebrow}
                    </span>

                    <h1 className="mt-4 max-w-3xl text-[2.25rem] font-semibold leading-[1.05] tracking-tight sm:text-5xl">
                        {title}
                    </h1>

                    {lead && (
                        <p className="mt-3.5 max-w-xl text-[15.5px] leading-relaxed text-muted">
                            {lead}
                        </p>
                    )}

                    {action && <div className="mt-7">{action}</div>}
                </Reveal>
            </div>
        </section>
    );
}
