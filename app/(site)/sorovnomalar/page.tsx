import type { Metadata } from "next";
import Link from "next/link";

import { Icon } from "@/components/icon";
import { PageHero } from "@/components/page-hero";
import { Stagger, StaggerItem } from "@/components/motion-primitives";
import { PollCard } from "@/components/polls/poll-ui";
import { getPolls } from "@/lib/api";

export const revalidate = 30;

export const metadata: Metadata = {
    alternates: { canonical: "/sorovnomalar" },
    title: "So'rovnomalar",
    description:
        "Samarqand viloyatining eng yaxshi mahalla yetakchilari va boshqa nomzodlar uchun ochiq ovoz berish.",
};

export default async function PollsPage() {
    const page = await getPolls().catch(() => null);
    const polls = page?.results ?? [];

    return (
        <>
            <PageHero
                eyebrow="So'rovnomalar"
                title={
                    <>
                        Ovozingiz <span className="text-accent">eng yaxshilarni</span> aniqlaydi
                    </>
                }
                lead="Viloyatning eng faol mahalla yetakchilari va boshqa nomzodlar. Har kim bir marta ovoz beradi — reyting har bir ovoz bilan yangilanadi."
            />

            <section className="container-page py-8 md:py-10">
                {polls.length ? (
                    <Stagger className="grid gap-5 md:grid-cols-2">
                        {polls.map((poll) => (
                            <StaggerItem key={poll.id}>
                                <PollCard poll={poll} />
                            </StaggerItem>
                        ))}
                    </Stagger>
                ) : (
                    <div className="rounded-3xl border border-dashed border-line py-20 text-center">
                        <span className="tone-amber mx-auto grid size-14 place-items-center rounded-2xl bg-tone-soft">
                            <Icon name="vote" size={24} className="text-tone-text" strokeWidth={1.5} />
                        </span>
                        <p className="mt-4 text-[14px] text-muted">Hozircha so&apos;rovnoma yo&apos;q.</p>
                        <Link
                            href="/elonlar"
                            className="mt-4 inline-block text-[13px] font-medium text-accent hover:underline"
                        >
                            E&apos;lonlarga qaytish
                        </Link>
                    </div>
                )}
            </section>
        </>
    );
}
