import Link from "next/link";

import { DistrictPicker } from "@/components/cabinet/district-picker";
import { Icon, type IconName } from "@/components/icon";
import { CountUp, Reveal, Stagger, StaggerItem } from "@/components/motion-primitives";
import { getReference } from "@/lib/api";
import { getCabinetOverview } from "@/lib/me";
import { getCurrentUser } from "@/lib/session";

const SHORTCUTS: { href: string; label: string; text: string; icon: IconName }[] = [
    {
        href: "/tashabbuslar/bildirish",
        label: "Tashabbus bildirish",
        text: "Muammo, g'oya yoki startap fikringizni yozing",
        icon: "spark",
    },
    {
        href: "/tashabbuslar/yoshlar",
        label: "Ovoz berish",
        text: "Reytingni ko'ring va yoqqanini qo'llab-quvvatlang",
        icon: "vote",
    },
    {
        href: "/tadbirlar",
        label: "Tadbirga yozilish",
        text: "Yaqin kunlardagi tadbirlarda joy band qiling",
        icon: "calendar",
    },
];

export default async function CabinetPage() {
    const [user, overview, reference] = await Promise.all([
        getCurrentUser(),
        getCabinetOverview(),
        getReference(),
    ]);
    const counts = overview.counts;
    const isOrganization = user?.role === "organization";

    // Telegram: username bo'lmasa ham ulanganini ko'rsatamiz
    const telegram = user?.telegram_username
        ? `@${user.telegram_username}`
        : user?.telegram_linked
          ? "Ulangan"
          : "Ulanmagan";

    const account: { label: string; value: React.ReactNode }[] = [
        ...(isOrganization && user?.organization_name
            ? [{ label: "Tashkilot", value: user.organization_name }]
            : []),
        { label: isOrganization ? "Mas'ul shaxs" : "F.I.O.", value: user?.full_name },
        { label: "Rol", value: user?.role_display },
        { label: "Telefon", value: user?.phone || "—" },
        { label: "Viloyat", value: user?.region_display || "—" },
        // Tuman botda so'raladi (tashkilotdan so'ralmaydi) — shu yerda o'zgartirsa bo'ladi
        ...(isOrganization
            ? []
            : [
                  {
                      label: "Tuman / shahar",
                      value: (
                          <DistrictPicker
                              value={user?.district ?? ""}
                              options={reference.districts}
                          />
                      ),
                  },
              ]),
        { label: "Telegram", value: telegram },
    ];

    return (
        <>
            {/* --- Raqamlar --- */}
            <Reveal>
                <h2 className="text-lg font-semibold tracking-tight">Umumiy holat</h2>
                <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4">
                    {(
                        [
                            { value: counts.initiatives, label: "Tashabbus" },
                            { value: overview.total_votes, label: "To'plangan ovoz" },
                            { value: counts.comments, label: "Yozgan taklif" },
                            { value: counts.events, label: "Yaqin tadbir" },
                        ] as const
                    ).map((item) => (
                        <div key={item.label} className="bg-page p-5">
                            <dd className="text-[1.75rem] font-semibold tabular-nums tracking-tight">
                                <CountUp value={item.value} />
                            </dd>
                            <dt className="mt-0.5 text-[12.5px] text-faint">{item.label}</dt>
                        </div>
                    ))}
                </dl>
            </Reveal>

            {/* --- Tez havolalar --- */}
            <div className="mt-12">
                <h2 className="text-lg font-semibold tracking-tight">Nima qilamiz</h2>

                <Stagger className="mt-5 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3">
                    {SHORTCUTS.map((item) => (
                        <StaggerItem key={item.href} className="bg-page">
                            <Link
                                href={item.href}
                                className="group flex h-full flex-col p-5 transition-colors duration-200 hover:bg-surface"
                            >
                                <Icon
                                    name={item.icon}
                                    size={19}
                                    strokeWidth={1.5}
                                    className="text-faint transition-colors duration-200 group-hover:text-accent"
                                />
                                <h3 className="mt-4 text-[14.5px] font-medium">{item.label}</h3>
                                <p className="mt-1.5 flex-1 text-[13px] leading-relaxed text-muted">
                                    {item.text}
                                </p>
                                <span className="mt-4 inline-flex items-center gap-1.5 text-[12.5px] text-faint transition-colors group-hover:text-text">
                                    Ochish
                                    <Icon
                                        name="arrowRight"
                                        size={13}
                                        className="transition-transform duration-300 group-hover:translate-x-0.5"
                                    />
                                </span>
                            </Link>
                        </StaggerItem>
                    ))}
                </Stagger>
            </div>

            {/* --- Hisob ma'lumotlari --- */}
            <div className="mt-12">
                <h2 className="text-lg font-semibold tracking-tight">
                    Hisob ma&apos;lumotlari
                </h2>

                <dl className="mt-5 divide-y divide-line border-y border-line text-[13.5px]">
                    {account.map(({ label, value }) => (
                        <div key={label} className="flex flex-wrap items-center gap-x-6 gap-y-1 py-3.5">
                            <dt className="w-28 shrink-0 text-faint">{label}</dt>
                            <dd className="min-w-0 flex-1">{value}</dd>
                        </div>
                    ))}
                </dl>
            </div>
        </>
    );
}
