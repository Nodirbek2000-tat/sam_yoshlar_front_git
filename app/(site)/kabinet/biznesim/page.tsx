import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { BusinessEditor, StatusBanner } from "@/components/cabinet/profile-editor";
import { PageHead } from "@/components/cabinet/ui";
import { getReference } from "@/lib/api";
import { meFetch } from "@/lib/me";
import { getCurrentUser } from "@/lib/session";
import type { BusinessProfile } from "@/lib/types";

export const metadata: Metadata = { title: "Tadbirkorligim" };

/**
 * «Tadbirkorligim» — asosiy roli yosh yoki startupper bo'lsa ham biznes
 * profilini qo'shish mumkin (bittadan).
 */
export default async function MyBusinessPage() {
    const user = await getCurrentUser();
    if (!user || user.role === "organization") redirect("/kabinet");

    const [data, reference] = await Promise.all([
        meFetch<BusinessProfile | Record<string, never>>("/business/", "/kabinet/biznesim"),
        getReference(),
    ]);
    const profile = "id" in data ? (data as BusinessProfile) : null;

    return (
        <>
            <PageHead
                title="Tadbirkorligim"
                subtitle={
                    profile
                        ? "Hamkorlar va kengash ko'radigan biznes profilingiz."
                        : "Biznesingiz bormi? Profilini to'ldiring — kengash tasdiqlagach tadbirkorlar ro'yxatida chiqadi."
                }
            />

            {profile && <StatusBanner status={profile.status} />}

            <BusinessEditor
                initial={profile}
                spheres={reference.business_spheres}
                regions={reference.regions}
            />
        </>
    );
}
