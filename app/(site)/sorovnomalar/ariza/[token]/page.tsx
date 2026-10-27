import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ApplyForm } from "@/components/polls/apply-form";
import { ApiError, getPollApply } from "@/lib/api";

/** Maxfiy havola — qidiruv tizimlariga chiqmaydi. */
export const metadata: Metadata = {
    title: "Nomzod arizasi",
    robots: { index: false, follow: false },
};

export default async function PollApplyPage({ params }: PageProps<"/sorovnomalar/ariza/[token]">) {
    const { token } = await params;
    if (!/^[\w-]{10,64}$/.test(token)) notFound();

    let info;
    try {
        info = await getPollApply(token);
    } catch (error) {
        if (error instanceof ApiError && error.status === 404) notFound();
        throw error;
    }

    return <ApplyForm token={token} info={info} />;
}
