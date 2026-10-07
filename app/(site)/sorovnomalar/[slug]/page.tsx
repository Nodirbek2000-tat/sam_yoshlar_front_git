import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PollBoard } from "@/components/polls/poll-board";
import { ApiError, getPoll } from "@/lib/api";
import { shareMetadata } from "@/lib/seo";

/**
 * Sahifa keshdan beriladi (30 soniya); sonlar esa brauzerda jonli
 * yangilanadi — kim ovoz bergani ham shu yerda so'raladi.
 */
export const revalidate = 30;

export async function generateStaticParams() {
    return [];
}

export async function generateMetadata({
    params,
}: PageProps<"/sorovnomalar/[slug]">): Promise<Metadata> {
    try {
        const poll = await getPoll((await params).slug);
        return shareMetadata({
            title: poll.title,
            description:
                poll.description ||
                (poll.is_closed
                    ? `${poll.options_count} nomzod. Ovoz berish yakunlangan — natijalarni ko'ring.`
                    : `${poll.options_count} nomzod. Ovoz bering — reyting har bir ovoz bilan yangilanadi.`),
            // Faqat muqova: nomzod surati «peshqadam» bo'lib ko'rinib qolmasin
            image: poll.image,
            path: `/sorovnomalar/${poll.slug}`,
        });
    } catch {
        return { title: "So'rovnoma" };
    }
}

export default async function PollPage({ params }: PageProps<"/sorovnomalar/[slug]">) {
    const { slug } = await params;

    let poll;
    try {
        poll = await getPoll(slug);
    } catch (error) {
        // Faqat haqiqatan yo'q bo'lsa 404 — server bir lahza xato bersa,
        // «topilmadi» sahifasi keshga tushib qolmasin
        if (error instanceof ApiError && error.status === 404) notFound();
        throw error;
    }

    return <PollBoard initial={poll} />;
}
