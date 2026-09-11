import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CategoryIcon } from "@/components/category-icon";
import { PhotoGallery } from "@/components/directory/photo-gallery";
import { Icon, type IconName } from "@/components/icon";
import { Reveal } from "@/components/motion-primitives";
import { ApiError, getBusiness } from "@/lib/api";
import { cn } from "@/lib/cn";
import { toneClass } from "@/lib/tone";
import type { PublicBusinessDetail } from "@/lib/types";

async function load(id: string) {
    try {
        return await getBusiness(id);
    } catch (error) {
        if (error instanceof ApiError) return null;
        throw error;
    }
}

export async function generateMetadata({
    params,
}: PageProps<"/tadbirkorlar/[id]">): Promise<Metadata> {
    const business = await load((await params).id);
    if (!business) return { title: "Tadbirkor" };
    return {
        title: business.name,
        description: business.description.slice(0, 150),
        openGraph: business.cover_url ? { images: [business.cover_url] } : undefined,
    };
}

export default async function BusinessPage({ params }: PageProps<"/tadbirkorlar/[id]">) {
    const business = await load((await params).id);
    if (!business) notFound();

    const place = [business.region_display, business.district].filter(Boolean).join(", ");

    return (
        <article className={toneClass(business.sphere_icon)}>
            {/* Muqova */}
            <div className="container-page pt-8 md:pt-10">
                <Link
                    href="/tadbirkorlar"
                    className="group inline-flex items-center gap-1.5 text-[13px] text-muted transition-colors hover:text-text"
                >
                    <Icon
                        name="arrowLeft"
                        size={14}
                        className="transition-transform duration-200 group-hover:-translate-x-0.5"
                    />
                    Tadbirkorlar
                </Link>

                <div className="relative mt-5 h-52 overflow-hidden rounded-3xl border border-tone-line bg-tone-soft sm:h-64 md:h-72">
                    {business.cover_url ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={business.cover_url} alt="" className="size-full object-cover" />
                    ) : (
                        <div className="grid-lines size-full opacity-60" />
                    )}
                    <span className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
                </div>
            </div>

            <div className="container-page">
                {/* Faqat logotip muqovaga chiqib turadi — nom rasm ustiga tushmasin */}
                <Reveal className="relative flex flex-wrap items-start gap-x-5 gap-y-3 px-2 sm:px-6">
                    <span className="-mt-12 grid size-24 shrink-0 place-items-center overflow-hidden rounded-3xl border-4 border-page bg-page text-tone-text shadow-lg sm:-mt-14 sm:size-28">
                        {business.logo_url ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={business.logo_url} alt={business.name} className="size-full object-cover" />
                        ) : (
                            <CategoryIcon slug={business.sphere_icon} size={40} />
                        )}
                    </span>

                    <div className="min-w-0 pt-4">
                        <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                            {business.name}
                        </h1>
                        <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13.5px]">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-tone-line bg-tone-soft px-3 py-1 font-medium text-tone-text">
                                <CategoryIcon slug={business.sphere_icon} size={13} />
                                {business.sphere_display}
                            </span>
                            {place && (
                                <span className="inline-flex items-center gap-1 text-muted">
                                    <Icon name="pin" size={13} />
                                    {place}
                                </span>
                            )}
                        </p>
                    </div>
                </Reveal>

                <div className="grid gap-10 py-10 md:py-14 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-14">
                    <div className="min-w-0 space-y-10">
                        {/* Raqamlar */}
                        <dl className="grid grid-cols-3 gap-3">
                            <Fact label="Tashkil topgan" value={business.founded_year ? `${business.founded_year}` : "—"} />
                            <Fact label="Xodimlar" value={business.employees ? `${business.employees}` : "—"} />
                            <Fact label="Rasmlar" value={`${business.gallery.length}`} />
                        </dl>

                        <section>
                            <h2 className="text-[12px] font-medium uppercase tracking-[0.1em] text-faint">
                                Biznes haqida
                            </h2>
                            <div className="mt-3 space-y-4 text-[15.5px] leading-[1.75] text-muted">
                                {business.description
                                    .split("\n")
                                    .filter(Boolean)
                                    .map((line, index) => (
                                        <p key={index}>{line}</p>
                                    ))}
                            </div>
                        </section>

                        {business.gallery.length > 0 && (
                            <section>
                                <h2 className="mb-4 text-[12px] font-medium uppercase tracking-[0.1em] text-faint">
                                    Rasmlar
                                </h2>
                                <PhotoGallery photos={business.gallery} name={business.name} />
                            </section>
                        )}
                    </div>

                    <aside className="lg:sticky lg:top-24 lg:self-start">
                        <Contacts business={business} />
                    </aside>
                </div>
            </div>
        </article>
    );
}

function Fact({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-line bg-raised p-4">
            <dd className="text-2xl font-semibold tabular-nums tracking-tight">{value}</dd>
            <dt className="mt-0.5 text-[12px] text-muted">{label}</dt>
        </div>
    );
}

function Contacts({ business }: { business: PublicBusinessDetail }) {
    const rows: { icon: IconName; label: string; value: string; href?: string }[] = [];

    if (business.phone) {
        rows.push({ icon: "phone", label: "Telefon", value: business.phone, href: `tel:${business.phone.replace(/\s/g, "")}` });
    }
    if (business.website) {
        rows.push({ icon: "globe", label: "Sayt", value: business.website.replace(/^https?:\/\//, ""), href: business.website });
    }
    if (business.telegram) {
        rows.push({ icon: "telegram", label: "Telegram", value: `@${business.telegram}`, href: `https://t.me/${business.telegram}` });
    }
    if (business.instagram) {
        rows.push({ icon: "instagram", label: "Instagram", value: `@${business.instagram}`, href: `https://instagram.com/${business.instagram}` });
    }
    if (business.email) {
        rows.push({ icon: "mail", label: "Email", value: business.email, href: `mailto:${business.email}` });
    }
    if (business.address) {
        rows.push({ icon: "pin", label: "Manzil", value: business.address });
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-tone-line">
            <div className="bg-tone-soft px-5 py-4">
                <p className="text-[14px] font-semibold text-tone-text">Bog&apos;lanish</p>
                {business.owner_name && (
                    <p className="mt-0.5 text-[12.5px] text-muted">Rahbar: {business.owner_name}</p>
                )}
            </div>

            {rows.length ? (
                <ul className="divide-y divide-line bg-raised">
                    {rows.map((row) => {
                        const inner = (
                            <>
                                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-tone-soft text-tone-text">
                                    <Icon name={row.icon} size={16} />
                                </span>
                                <span className="min-w-0">
                                    <span className="block text-[11.5px] text-faint">{row.label}</span>
                                    <span className="block truncate text-[13.5px] font-medium">{row.value}</span>
                                </span>
                            </>
                        );

                        return (
                            <li key={row.label}>
                                {row.href ? (
                                    <a
                                        href={row.href}
                                        target={row.href.startsWith("http") ? "_blank" : undefined}
                                        rel="noreferrer"
                                        className={cn("flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-surface")}
                                    >
                                        {inner}
                                    </a>
                                ) : (
                                    <div className="flex items-center gap-3 px-5 py-3.5">{inner}</div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <p className="bg-raised px-5 py-4 text-[13px] text-muted">Aloqa ma&apos;lumoti ko&apos;rsatilmagan.</p>
            )}
        </div>
    );
}
