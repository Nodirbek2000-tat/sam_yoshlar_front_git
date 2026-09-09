import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";

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
    metadataBase: new URL("https://mentadbirkor.uz"),
    title: {
        default: "sam-yosh tadbirkor.uz — Yosh Tadbirkorlar Kengashi",
        template: "%s — sam-yosh tadbirkor.uz",
    },
    description:
        "Yoshlarni birlashtiruvchi, qo'llab-quvvatlovchi va rivojlantirishga xizmat qiluvchi yagona axborot platformasi.",
    openGraph: {
        type: "website",
        locale: "uz_UZ",
        siteName: "sam-yosh tadbirkor.uz",
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
            <body className="flex min-h-full flex-col">
                <ThemeProvider>{children}</ThemeProvider>
            </body>
        </html>
    );
}
