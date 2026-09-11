import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { CabinetSidebar } from "@/components/cabinet/sidebar";
import { getCabinetOverview } from "@/lib/me";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = {
    title: "Shaxsiy kabinet",
    robots: { index: false, follow: false },
};

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
                        <span className="text-muted">{user.role_display}</span>
                        {user.region_display && <span>{user.region_display}</span>}
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
