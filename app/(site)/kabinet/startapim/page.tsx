import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { StartupsManager } from "@/components/cabinet/startups-manager";
import { PageHead } from "@/components/cabinet/ui";
import { getReference } from "@/lib/api";
import { meFetch } from "@/lib/me";
import { getCurrentUser } from "@/lib/session";
import type { MyStartups } from "@/lib/types";

export const metadata: Metadata = { title: "Startaplarim" };

/**
 * «Startaplarim» — asosiy roli qanday bo'lishidan qat'i nazar (yosh,
 * tadbirkor, startupper) 3 tagacha startap kiritish mumkin.
 */
export default async function MyStartupsPage() {
    const user = await getCurrentUser();
    if (!user || user.role === "organization") redirect("/kabinet");

    const [data, reference] = await Promise.all([
        meFetch<MyStartups>("/startups/", "/kabinet/startapim"),
        getReference(),
    ]);

    return (
        <>
            <PageHead
                title="Startaplarim"
                subtitle={`${data.limit} tagacha startap kiritishingiz mumkin. Kengash tasdiqlagach reyestrda va investorlarga ko'rinadi.`}
            />

            <StartupsManager
                startups={data.results}
                limit={data.limit}
                spheres={reference.startup_spheres}
                stages={reference.startup_stages}
            />
        </>
    );
}
