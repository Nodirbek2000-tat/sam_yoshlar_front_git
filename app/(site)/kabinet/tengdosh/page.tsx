import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { StudyProfile } from "@/components/cabinet/study-profile";
import { PageHead } from "@/components/cabinet/ui";
import { Icon } from "@/components/icon";
import { getReference } from "@/lib/api";
import { meFetch } from "@/lib/me";
import { getCurrentUser } from "@/lib/session";
import type { PeerProfile } from "@/lib/types";

export const metadata: Metadata = { title: "Ta'lim profilim" };

/**
 * «Ta'lim profilim» — roli qanday bo'lishidan qat'i nazar (yosh, tadbirkor,
 * startupper) har kim qayerda o'qishini belgilaydi va chet elda bo'lsa
 * tengdoshlar ro'yxatiga qo'shiladi.
 */
export default async function MyStudyPage() {
    const user = await getCurrentUser();
    if (!user || user.role === "organization") redirect("/kabinet");

    const [data, reference] = await Promise.all([
        meFetch<PeerProfile | Record<string, never>>("/peer/", "/kabinet/tengdosh"),
        getReference(),
    ]);
    const profile = "id" in data ? (data as PeerProfile) : null;

    return (
        <>
            <PageHead
                title="Ta'lim profilim"
                subtitle="Qayerda o'qiysiz? Chet elda bo'lsangiz — «Chet eldagi tengdoshlar»da chiqasiz."
            />

            {profile && user.study_location === "abroad" && (
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

            <StudyProfile
                location={user.study_location}
                peer={profile}
                countries={reference.countries ?? []}
                defaultPhone={user.phone}
            />
        </>
    );
}
