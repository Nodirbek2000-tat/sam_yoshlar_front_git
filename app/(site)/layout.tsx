import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/session";

/** Ommaviy sahifalar: sarlavha + kontent + pastki qism. */
export default async function SiteLayout({ children }: LayoutProps<"/"> ) {
    const user = await getCurrentUser();

    return (
        <>
            <SiteHeader user={user} />
            <main className="flex-1">{children}</main>
            <SiteFooter />
        </>
    );
}
