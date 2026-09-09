import Link from "next/link";

import { Icon, type IconName } from "@/components/icon";

const SECTIONS: { title: string; links: { href: string; label: string }[] }[] = [
    {
        title: "Bo'limlar",
        links: [
            { href: "/yangiliklar", label: "Yangiliklar" },
            { href: "/tadbirlar", label: "Tadbirlar" },
            { href: "/elonlar", label: "E'lonlar" },
            { href: "/tashabbuslar", label: "Tashabbuslar" },
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
    { href: "https://t.me/yoshtadbirkorlarbot", label: "Telegram", icon: "telegram" },
    { href: "#", label: "Instagram", icon: "instagram" },
    { href: "#", label: "YouTube", icon: "youtube" },
];

export function SiteFooter() {
    return (
        <footer className="mt-auto border-t border-line">
            <div className="container-page grid gap-12 py-14 sm:grid-cols-2 lg:grid-cols-4">
                <div className="lg:pr-10">
                    <div className="flex items-center gap-2.5">
                        <span className="grid size-7 place-items-center rounded-lg bg-invert text-on-invert">
                            <Icon name="bank" size={15} strokeWidth={1.9} />
                        </span>
                        <span className="text-[14.5px] font-semibold tracking-tight">
                            sam-yosh tadbirkor
                        </span>
                    </div>

                    <p className="mt-4 max-w-xs text-[13.5px] leading-relaxed text-muted">
                        Yoshlarni birlashtiruvchi, qo&apos;llab-quvvatlovchi va rivojlantirishga
                        xizmat qiluvchi yagona axborot platformasi.
                    </p>

                    <div className="mt-6 flex gap-1.5">
                        {SOCIALS.map((item) => (
                            <a
                                key={item.label}
                                href={item.href}
                                aria-label={item.label}
                                target={item.href.startsWith("http") ? "_blank" : undefined}
                                rel="noreferrer"
                                className="grid size-8 place-items-center rounded-lg text-faint transition-colors hover:bg-surface hover:text-text"
                            >
                                <Icon name={item.icon} size={16} />
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
                        <li>+998 71 123 45 67</li>
                        <li>info@mentadbirkor.uz</li>
                        <li>Du–Ju: 9:00 — 18:00</li>
                    </ul>
                </div>
            </div>

            <div className="border-t border-line">
                <div className="container-page flex flex-col gap-2 py-5 text-[12.5px] text-faint sm:flex-row sm:items-center sm:justify-between">
                    <span>© {new Date().getFullYear()} sam-yosh tadbirkor.uz</span>
                    <span>O&apos;zbekiston Respublikasi</span>
                </div>
            </div>
        </footer>
    );
}
