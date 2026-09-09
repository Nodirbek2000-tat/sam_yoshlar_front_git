import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Icon } from "@/components/icon";
import { SectionTabs } from "@/components/initiatives/section-tabs";
import { Reveal } from "@/components/motion-primitives";
import { ProblemForm } from "@/components/problems/problem-form";
import { getReference } from "@/lib/api";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = {
    title: "Muammo yozish",
    description: "Tashkilot o'z muammosini yozadi, yoshlar unga yechim taklif qiladi.",
};

export default async function WriteProblemPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/kirish?next=/tashabbuslar/muammolar/yozish");

    const reference = await getReference();

    return (
        <>
            <section className="relative overflow-hidden border-b border-line">
                <div aria-hidden className="aurora" />
                <div
                    aria-hidden
                    className="grid-lines pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(70%_60%_at_50%_0%,#000,transparent)]"
                />

                <div className="container-page relative py-9 md:py-12">
                    <SectionTabs />

                    <Reveal className="mt-8 max-w-2xl">
                        <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">
                            Muammoingizni <span className="text-accent">yozing</span>
                        </h1>
                        <p className="mt-4 text-[15.5px] leading-relaxed text-muted">
                            Yoshlar unga yechim taklif qiladi. Ko&apos;p layk yig&apos;gan
                            taklif tepaga chiqadi va kabinetingizga tushadi.
                        </p>
                    </Reveal>
                </div>
            </section>

            <section className="container-page py-9 md:py-12">
                {user.role === "organization" ? (
                    <ProblemForm questions={reference.problem_questions} />
                ) : (
                    <NotAllowed />
                )}
            </section>
        </>
    );
}

/** Tashkilot bo'lmaganlarga — nima uchun yopiqligini tushuntiramiz. */
function NotAllowed() {
    return (
        <div className="tone-violet mx-auto max-w-lg rounded-2xl border border-tone-line bg-tone-soft p-7 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-page">
                <Icon name="building" size={22} className="text-tone-text" />
            </span>

            <h2 className="mt-4 text-[17px] font-semibold tracking-tight">
                Bu bo&apos;lim tashkilotlar uchun
            </h2>
            <p className="mt-2.5 text-[14px] leading-relaxed text-muted">
                Muammoni tashkilotning o&apos;zi yozadi — shunda yoshlar kimga yechim
                taklif qilayotganini biladi. Tashkilot bo&apos;lsangiz, kengashga murojaat
                qiling, sizga login va parol beriladi.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-2">
                <Link
                    href="/tashabbuslar/yoshlar"
                    className="inline-flex items-center gap-2 rounded-full bg-invert px-5 py-2.5 text-[13.5px] font-medium text-on-invert transition-opacity hover:opacity-90"
                >
                    Tashabbus bildirish
                    <Icon name="arrowRight" size={14} />
                </Link>
                <Link
                    href="/tashabbuslar/muammolar"
                    className="rounded-full border border-tone-line px-5 py-2.5 text-[13.5px] text-muted transition-colors hover:text-text"
                >
                    Muammolarni ko&apos;rish
                </Link>
            </div>
        </div>
    );
}
