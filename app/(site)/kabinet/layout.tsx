import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { CabinetSidebar } from "@/components/cabinet/sidebar";
import { getCabinetOverview } from "@/lib/me";
import { getCurrentUser } from "@/lib/session";
import type { User } from "@/lib/types";

export const metadata: Metadata = {
    title: "Shaxsiy kabinet",
    robots: { index: false, follow: false },
};

/** Asosiy rol va qo'shib olingan rollar (biznes, startap, ta'lim). */
function roleBadges(user: User) {
    if (user.role === "organization" || user.role === "admin") {
        return [{ label: user.role_display, tone: "slate" }];
    }

    const can = user.capabilities;
    const badges: { label: string; tone: string }[] = [];
    if (user.role === "yosh" || user.study_location) badges.push({ label: "Yosh", tone: "indigo" });
    if (user.role === "entrepreneur" || can?.business) badges.push({ label: "Tadbirkor", tone: "amber" });
    if (user.role === "startupper" || (can?.startups ?? 0) > 0) {
        badges.push({ label: "Startupper", tone: "orange" });
    }
    return badges.length ? badges : [{ label: user.role_display, tone: "slate" }];
}

export default async function CabinetLayout({ children }: LayoutProps<"/kabinet">) {
    const user = await getCurrentUser();
    if (!user) redirect("/kirish?next=/kabinet");

    // Rol yoki biznes/startap anketasi to'ldirilmagan — avval o'sha
    if (user.onboarding) redirect("/kirish/rol");

    const overview = await getCabinetOverview();

    return (
        <div className="container-page py-10 md:py-14">
            {/* Sarlavha — hamma sahifada bir xil turadi */}
            <header className="flex flex-wrap items-center gap-4 border-b border-line pb-8">
                <span className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-full bg-surface text-[15px] font-semibold text-muted">
                    {user.avatar ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={user.avatar} alt="" className="size-full object-cover" />
                    ) : (
                        user.initials
                    )}
                </span>

                <div className="min-w-0">
                    <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                        {user.full_name}
                    </h1>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[13px] text-faint">
                        {/* Bir odam bir nechta rolda bo'la oladi — hammasi belgi bo'lib chiqadi */}
                        {roleBadges(user).map((badge) => (
                            <span
                                key={badge.label}
                                className={`tone-${badge.tone} rounded-full bg-tone-soft px-2.5 py-0.5 text-[11.5px] font-medium text-tone-text`}
                            >
                                {badge.label}
                            </span>
                        ))}
                        {user.age && <span>{user.age} yosh</span>}
                        {user.region_display && <span>{user.region_display}</span>}
                        {user.study_location === "abroad" && <span>Chet elda o&apos;qiydi</span>}
                        {user.telegram_username && <span>@{user.telegram_username}</span>}
                    </p>
                </div>
            </header>

            {/* Chapda menyu, o'ngda mazmun */}
            <div className="mt-8 grid gap-8 lg:grid-cols-[13.5rem_minmax(0,1fr)] lg:gap-12">
                <CabinetSidebar counts={overview.counts} role={user.role} />
                <div className="min-w-0">{children}</div>
            </div>
        </div>
    );
}
