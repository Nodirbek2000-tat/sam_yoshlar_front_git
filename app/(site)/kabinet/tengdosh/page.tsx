import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { PeerEditor } from "@/components/cabinet/peer-editor";
import { PageHead } from "@/components/cabinet/ui";
import { Icon } from "@/components/icon";
import { getReference } from "@/lib/api";
import { meFetch } from "@/lib/me";
import { getCurrentUser } from "@/lib/session";
import type { PeerProfile } from "@/lib/types";

export const metadata: Metadata = { title: "Tengdosh profilim" };

export default async function MyPeerPage() {
    const user = await getCurrentUser();
    if (user?.role !== "yosh" || user.study_location !== "abroad") redirect("/kabinet");

    const [data, reference] = await Promise.all([
        meFetch<PeerProfile | Record<string, never>>("/peer/", "/kabinet/tengdosh"),
        getReference(),
    ]);
    const profile = "id" in data ? (data as PeerProfile) : null;

    return (
        <>
            <PageHead
                title="Tengdosh profilim"
                subtitle="«Chet eldagi tengdoshlar» bo'limida ko'rinadigan profilingiz."
            />

            {profile && (
                <Link
                    href={`/tengdoshlar/${profile.id}`}
                    className="group mb-6 inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-[13px] font-medium transition-colors hover:border-accent hover:text-accent"
                >
                    <Icon name="globe" size={14} />
                    Ommaviy profilimni ko&apos;rish
                    <Icon
                        name="arrowRight"
                        size={13}
                        className="transition-transform duration-300 group-hover:translate-x-0.5"
                    />
                </Link>
            )}

            <PeerEditor
                initial={profile}
                countries={reference.countries}
                defaultPhone={user.phone}
            />
        </>
    );
}
