import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Icon } from "@/components/icon";
import { CreateInitiativeForm } from "@/components/initiatives/create-form";
import { Reveal } from "@/components/motion-primitives";
import { getDirections, getReference } from "@/lib/api";
import { getCurrentUser } from "@/lib/session";
import type { Direction } from "@/lib/types";

export const metadata: Metadata = {
    title: "Tashabbus bildirish",
    description: "G'oya, muammo, taklif yoki startap fikringizni yozing.",
};

export default async function CreateInitiativePage() {
    const user = await getCurrentUser();

    // Ko'rish hamma uchun ochiq, yozish uchungina kirish kerak
    if (!user) redirect("/kirish?next=/tashabbuslar/bildirish");

    const [directions, reference] = await Promise.all([
        getDirections().catch(() => [] as Direction[]),
        getReference(),
    ]);

    return (
        <>
            <section className="relative overflow-hidden border-b border-line">
                <div aria-hidden className="aurora" />
                <div
                    aria-hidden
                    className="grid-lines pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(70%_60%_at_50%_0%,#000,transparent)]"
                />

                <div className="container-page relative py-9 md:py-12">
                    <Link
                        href="/tashabbuslar/yoshlar"
                        className="group inline-flex items-center gap-1.5 text-[13px] text-muted transition-colors hover:text-text"
                    >
                        <Icon
                            name="arrowLeft"
                            size={14}
                            className="transition-transform duration-200 group-hover:-translate-x-0.5"
                        />
                        Yoshlar tashabbuslari
                    </Link>

                    <Reveal className="mt-6 max-w-2xl">
                        <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">
                            Tashabbus <span className="text-accent">bildirish</span>
                        </h1>
                        <p className="mt-4 text-[15.5px] leading-relaxed text-muted">
                            G&apos;oya, muammo, taklif yoki startap — qaysi biri bo&apos;lsa ham
                            yozing. Moderatsiyadan o&apos;tgach ro&apos;yxatga tushadi va ovoz
                            yig&apos;a boshlaydi.
                        </p>
                    </Reveal>
                </div>
            </section>

            <section className="container-page py-9 md:py-12">
                <CreateInitiativeForm
                    directions={directions}
                    kinds={reference.initiative_kinds}
                    regions={reference.regions}
                    fullName={user.full_name}
                    phone={user.phone}
                />
            </section>
        </>
    );
}
