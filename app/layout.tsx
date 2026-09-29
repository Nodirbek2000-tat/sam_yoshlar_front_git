import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import { Suspense } from "react";

import { FxScript } from "@/components/fx-script";
import { NavProgress } from "@/components/nav-progress";
import { ThemeProvider } from "@/components/theme/provider";

import "./globals.css";

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin", "latin-ext"],
    display: "swap",
});

// Sarlavhalar uchun alohida shrift — matndan ajralib tursin
const sora = Sora({
    variable: "--font-display",
    subsets: ["latin"],
    weight: ["600", "700"],
    display: "swap",
});

export const metadata: Metadata = {
    metadataBase: new URL("https://samarqandyoshlari.uz"),
    title: {
        default: "Samarqand yoshlari — Yoshlar uchun tashabbus maydoni",
        template: "%s — Samarqand yoshlari",
    },
    description:
        "Samarqand yoshlari uchun yagona platforma: yangiliklar, tadbirlar, grantlar, startaplar va tadbirkorlar. G'oyangizni bildiring, ovoz bering, imkoniyatdan foydalaning.",
    openGraph: {
        type: "website",
        locale: "uz_UZ",
        siteName: "Samarqand yoshlari",
    },
};

/**
 * Ildiz qobiq — faqat `html`, `body` va mavzu.
 * Sayt sarlavhasi `(site)` guruhida, panel esa `/nazorat` da o'z qobig'ini quradi.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
    return (
        <html
            lang="uz"
            suppressHydrationWarning
            className={`${inter.variable} ${sora.variable} h-full antialiased`}
        >
            <head>
                {/* Chiqish animatsiyalari — React'dan oldin, sahifa o'qilayotganda ishlaydi */}
                <FxScript />
            </head>
            <body className="flex min-h-full flex-col">
                <ThemeProvider>
                    {/* `useSearchParams` ishlatadi — Suspense ichida bo'lishi shart */}
                    <Suspense fallback={null}>
                        <NavProgress />
                    </Suspense>
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
