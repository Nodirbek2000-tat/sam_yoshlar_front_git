import type { Metadata } from "next";

import { PanelSidebar } from "@/components/panel/sidebar";
import { requirePanelAdmin } from "@/lib/panel";

export const metadata: Metadata = {
    title: "Boshqaruv paneli",
    // Panel qidiruv tizimlariga tushmasin
    robots: { index: false, follow: false },
};

export default async function PanelLayout({ children }: LayoutProps<"/nazorat">) {
    const user = await requirePanelAdmin();

    return (
        <div className="min-h-screen">
            <PanelSidebar user={user} />
            <div className="lg:pl-60">
                <div className="mx-auto max-w-5xl px-5 py-8 md:px-8 md:py-12">{children}</div>
            </div>
        </div>
    );
}
