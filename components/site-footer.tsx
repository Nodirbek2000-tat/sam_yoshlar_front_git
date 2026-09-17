import Link from "next/link";

import { BrandLogo } from "@/components/brand-logo";
import { Icon, type IconName } from "@/components/icon";

const SECTIONS: { title: string; links: { href: string; label: string }[] }[] = [
    {
        title: "Bo'limlar",
        links: [
            { href: "/yangiliklar", label: "Yangiliklar" },
            { href: "/tadbirlar", label: "Tadbirlar" },
            { href: "/elonlar", label: "E'lonlar" },
            { href: "/tashabbuslar", label: "Tashabbuslar" },
            { href: "/tadbirkorlar", label: "Tadbirkorlar" },
            { href: "/startaplar", label: "Startaplar" },
            { href: "/tengdoshlar", label: "Chet eldagi tengdoshim" },
        ],
    },
    {
        title: "Ishtirok etish",
        links: [
            { href: "/royxatdan-otish", label: "Ro'yxatdan o'tish" },
            { href: "/kirish", label: "Kirish" },
            { href: "/tashabbuslar/muammolar", label: "Tashkilot muammolari" },
            { href: "/kabinet", label: "Shaxsiy kabinet" },
        ],
    },
];

const SOCIALS: { href: string; label: string; icon: IconName }[] = [
    { href: "https://t.me/Samstf", label: "Telegram", icon: "telegram" },
    { href: "#", label: "Instagram", icon: "instagram" },
    { href: "#", label: "YouTube", icon: "youtube" },
];

export function SiteFooter() {
    return (
        <footer className="mt-auto border-t border-line">
            <div className="container-page grid gap-12 py-14 sm:grid-cols-2 lg:grid-cols-4">
                <div className="lg:pr-10">
                    <Link href="/" aria-label="Bosh sahifa" className="inline-flex">
                        <BrandLogo height={54} />
                    </Link>

                    <p className="mt-4 max-w-xs text-[13.5px] leading-relaxed text-muted">
                        Yoshlarni birlashtiruvchi, qo&apos;llab-quvvatlovchi va rivojlantirishga
                        xizmat qiluvchi yagona axborot platformasi.
                    </p>

                    <div className="mt-6 flex gap-2.5">
                        {SOCIALS.map((item) => (
                            <a
                                key={item.label}
                                href={item.href}
                                aria-label={item.label}
                                target={item.href.startsWith("http") ? "_blank" : undefined}
                                rel="noreferrer"
                                className="grid size-11 place-items-center rounded-xl border border-line text-muted transition-colors hover:border-accent hover:bg-surface hover:text-accent"
                            >
                                <Icon name={item.icon} size={22} />
                            </a>
                        ))}
                    </div>
                </div>

                {SECTIONS.map((section) => (
                    <div key={section.title}>
                        <h3 className="text-[12px] font-medium uppercase tracking-[0.1em] text-faint">
                            {section.title}
                        </h3>
                        <ul className="mt-4 space-y-2.5">
                            {section.links.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-[13.5px] text-muted transition-colors hover:text-text"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}

                <div>
                    <h3 className="text-[12px] font-medium uppercase tracking-[0.1em] text-faint">
                        Aloqa
                    </h3>
                    <ul className="mt-4 space-y-2.5 text-[13.5px] text-muted">
                        <li>Samarqand shahri</li>
                        <li>
                            <a
                                href="tel:+998940449442"
                                className="transition-colors hover:text-text"
                            >
                                +998 94 044 94 42
                            </a>
                        </li>
                        <li>info@samarqandyoshlari.uz</li>
                        <li>Du–Ju: 9:00 — 18:00</li>
                    </ul>
                </div>
            </div>

            <div className="border-t border-line">
                <div className="container-page flex flex-col gap-2 py-5 text-[12.5px] text-faint sm:flex-row sm:items-center sm:justify-between">
                    <span>© {new Date().getFullYear()} samarqandyoshlari.uz</span>
                    <span>O&apos;zbekiston Respublikasi</span>
                </div>
            </div>
        </footer>
    );
}
