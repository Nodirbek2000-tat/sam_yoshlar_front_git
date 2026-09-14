import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { getReference } from "@/lib/api";
import { meFetch } from "@/lib/me";
import { getCurrentUser } from "@/lib/session";
import type { BusinessProfile, PeerProfile, StartupProfile } from "@/lib/types";

export const metadata: Metadata = {
    title: "Ro'yxatdan o'tishni yakunlash",
    robots: { index: false, follow: false },
};

/**
 * Kirgandan keyingi qadamlar: rol, yosh uchun ta'lim joyi va anketa
 * (tadbirkor, startupper yoki chet elda o'qiydigan yosh uchun).
 *
 * Qaysi qadam qolganini backend aytadi. Hammasi to'ldirilgan bo'lsa bu
 * sahifa kerak emas — to'g'ri kabinetga.
 */
export default async function OnboardingPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/kirish");
    if (!user.onboarding) redirect("/kabinet");

    const { onboarding } = user;
    const profileStep = onboarding === "business" || onboarding === "startup" || onboarding === "peer";

    // Anketa yarim saqlangan bo'lishi mumkin — mavjudini ko'rsatamiz
    const [reference, business, startup, peer] = await Promise.all([
        getReference(),
        onboarding === "business"
            ? meFetch<BusinessProfile | Record<string, never>>("/business/").catch(() => null)
            : null,
        onboarding === "startup"
            ? meFetch<StartupProfile | Record<string, never>>("/startup/").catch(() => null)
            : null,
        onboarding === "peer"
            ? meFetch<PeerProfile | Record<string, never>>("/peer/").catch(() => null)
            : null,
    ]);

    return (
        <section className="relative overflow-hidden">
            <div aria-hidden className="aurora" />

            <div className="container-page relative max-w-4xl py-10 md:py-14">
                <OnboardingFlow
                    initialStep={profileStep ? "profile" : onboarding === "study" ? "study" : "role"}
                    initialRole={profileStep || onboarding === "study" ? user.role : null}
                    initialStudy={onboarding === "peer" ? "abroad" : null}
                    roles={reference.roles}
                    regions={reference.regions}
                    countries={reference.countries ?? []}
                    fullName={user.full_name}
                    userRegion={user.region}
                    userPhone={user.phone}
                    startupSpheres={reference.startup_spheres}
                    startupStages={reference.startup_stages}
                    businessSpheres={reference.business_spheres}
                    business={business && "id" in business ? (business as BusinessProfile) : null}
                    startup={startup && "id" in startup ? (startup as StartupProfile) : null}
                    peer={peer && "id" in peer ? (peer as PeerProfile) : null}
                />
            </div>
        </section>
    );
}
