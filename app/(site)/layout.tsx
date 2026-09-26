import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

/**
 * Ommaviy sahifalar: sarlavha + kontent + pastki qism.
 *
 * Bu qobiq cookie o'qimaydi — aks holda har bir sahifa har safar noldan
 * chizilardi. Kim kirgani sarlavhada brauzerning o'zida olinadi.
 */
export default function SiteLayout({ children }: LayoutProps<"/">) {
    return (
        <>
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
        </>
    );
}
