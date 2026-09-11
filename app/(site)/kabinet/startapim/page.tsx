import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { StartupEditor, StatusBanner } from "@/components/cabinet/profile-editor";
import { PageHead } from "@/components/cabinet/ui";
import { getReference } from "@/lib/api";
import { meFetch } from "@/lib/me";
import { getCurrentUser } from "@/lib/session";
import type { StartupProfile } from "@/lib/types";

export const metadata: Metadata = { title: "Startapim" };

export default async function MyStartupPage() {
    const user = await getCurrentUser();
    if (user?.role !== "startupper") redirect("/kabinet");

    const [data, reference] = await Promise.all([
        meFetch<StartupProfile | Record<string, never>>("/startup/", "/kabinet/startapim"),
        getReference(),
    ]);
    const profile = "id" in data ? (data as StartupProfile) : null;

    return (
        <>
            <PageHead
                title="Startapim"
                subtitle="Investorlar va kengash ko'radigan startap anketangiz."
            />

            {profile && <StatusBanner status={profile.status} note={profile.admin_note} />}

            <StartupEditor
                initial={profile}
                spheres={reference.startup_spheres}
                stages={reference.startup_stages}
            />
        </>
    );
}
