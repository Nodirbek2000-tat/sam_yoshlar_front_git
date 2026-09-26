"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Icon } from "@/components/icon";
import { refreshPublic } from "@/components/panel/ui";
import { formatShortDate } from "@/lib/format";
import type { Choice } from "@/lib/types";

export type Organization = {
    id: number;
    name: string;
    sphere_display: string;
    contact_person: string;
    phone: string;
    email: string;
    region_display: string;
    problem_count: number;
    account_email: string | null;
    /** Birinchi kirishda ulangan Telegram hisobi */
    telegram_linked: boolean;
    telegram_username: string;
    telegram_phone: string;
    last_login: string | null;
    created_at: string;
};

type Credentials = { email: string; password: string };

export function OrganizationsManager({
    organizations,
    regions,
    spheres,
}: {
    organizations: Organization[];
    regions: Choice[];
    spheres: Choice[];
}) {
    const router = useRouter();
    const [adding, setAdding] = useState(false);
    const [credentials, setCredentials] = useState<
        (Credentials & { name: string }) | null
    >(null);

    return (
        <>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Korxonalar</h1>
                    <p className="mt-1.5 text-[14px] text-muted">
                        Tashkilotni kiriting — tizim unga login va parol yaratib beradi.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => setAdding((value) => !value)}
                    className="inline-flex items-center gap-2 rounded-full bg-invert px-4 py-2 text-[13.5px] font-medium text-on-invert transition-opacity hover:opacity-90"
                >
                    <Icon name={adding ? "close" : "plus"} size={15} />
                    {adding ? "Bekor qilish" : "Korxona kiritish"}
                </button>
            </div>

            {/* --- Yaratilgan login/parol --- */}
            <AnimatePresence>
                {credentials && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <CredentialsCard
                            data={credentials}
                            onClose={() => setCredentials(null)}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- Kiritish formasi --- */}
            <AnimatePresence>
                {adding && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                    >
                        <OrganizationForm
                            regions={regions}
                            spheres={spheres}
                            onCreated={(result) => {
                                setCredentials(result);
                                setAdding(false);
                                router.refresh();
                            }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- Ro'yxat --- */}
            <div className="mt-8 divide-y divide-line border-y border-line">
                {organizations.length ? (
                    organizations.map((org) => (
                        <OrganizationRow
                            key={org.id}
                            organization={org}
                            onReset={setCredentials}
                        />
                    ))
                ) : (
                    <p className="py-14 text-center text-[13.5px] text-faint">
                        Hozircha korxona kiritilmagan.
                    </p>
                )}
            </div>
        </>
    );
}

/* ------------------------------------------------------------------ */

function OrganizationForm({
    regions,
    spheres,
    onCreated,
}: {
    regions: Choice[];
    spheres: Choice[];
    onCreated: (result: Credentials & { name: string }) => void;
}) {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setBusy(true);
        setError(null);

        const form = new FormData(event.currentTarget);
        const payload = Object.fromEntries(form.entries());

        try {
            const response = await fetch("/api/proxy/panel/organizations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await response.json();

            if (!response.ok) {
                setError(data.detail ?? "Saqlab bo'lmadi.");
                return;
            }

            onCreated({ ...data.credentials, name: data.name });
        } catch {
            setError("Tarmoqda xatolik.");
        } finally {
            setBusy(false);
        }
    }

    return (
        <form
            onSubmit={submit}
            className="mt-6 rounded-xl border border-line p-5 md:p-6"
        >
            <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Tashkilot nomi" required>
                    <input name="name" required className={inputClass} />
                </Field>

                <Field label="Login (email)" required>
                    <input name="email" type="email" required className={inputClass} />
                </Field>

                <Field label="Aloqa shaxsi">
                    <input name="contact_person" className={inputClass} />
                </Field>

                <Field label="Telefon">
                    <input name="phone" className={inputClass} placeholder="+998 90 123 45 67" />
                </Field>

                <Field label="Faoliyat sohasi">
                    <select name="sphere" className={inputClass} defaultValue="">
                        <option value="">Tanlang</option>
                        {spheres.map((item) => (
                            <option key={item.value} value={item.value}>
                                {item.label}
                            </option>
                        ))}
                    </select>
                </Field>

                <Field label="Hudud">
                    <select name="region" className={inputClass} defaultValue="">
                        <option value="">Tanlang</option>
                        {regions.map((item) => (
                            <option key={item.value} value={item.value}>
                                {item.label}
                            </option>
                        ))}
                    </select>
                </Field>
            </div>

            {error && <p className="mt-4 text-[13px] text-red-600">{error}</p>}

            <button
                type="submit"
                disabled={busy}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-invert px-5 py-2.5 text-[13.5px] font-medium text-on-invert transition-opacity hover:opacity-90 disabled:opacity-40"
            >
                {busy ? "Yaratilmoqda…" : "Kiritish va parol yaratish"}
                <Icon name="arrowRight" size={14} />
            </button>
        </form>
    );
}

function CredentialsCard({
    data,
    onClose,
}: {
    data: Credentials & { name: string };
    onClose: () => void;
}) {
    const [copied, setCopied] = useState(false);

    const text =
        `${data.name}\nSayt: https://samarqandyoshlari.uz/kirish\n` +
        `Login: ${data.email}\nParol: ${data.password}\n\n` +
        "Birinchi kirishda sayt Telegram hisobingizni ulashni so'raydi — " +
        "havolani bosib, botga raqamingizni yuborasiz.";

    async function copy() {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <div className="mt-6 rounded-xl border border-accent bg-accent-soft p-5">
            <div className="flex items-start gap-3">
                <Icon name="check" size={18} className="mt-0.5 shrink-0 text-accent-text" />
                <div className="min-w-0 flex-1">
                    <h2 className="text-[14.5px] font-semibold text-accent-text">
                        {data.name} — hisob ochildi
                    </h2>
                    <p className="mt-1 text-[13px] text-accent-text/80">
                        Parol faqat hozir ko&apos;rinadi. Nusxalab, tashkilotga yetkazing —
                        keyin uni qayta ko&apos;rib bo&apos;lmaydi, faqat yangisini yaratish mumkin.
                    </p>
                    <p className="mt-2 text-[13px] text-accent-text/80">
                        Birinchi kirishda tashkilot Telegram hisobini ulaydi: sayt bot havolasini
                        beradi, bot faqat raqam so&apos;raydi.
                    </p>

                    <dl className="mt-4 grid gap-2 rounded-lg bg-page p-4 font-mono text-[13.5px]">
                        <div className="flex flex-wrap gap-x-3">
                            <dt className="text-faint">Login</dt>
                            <dd className="font-medium">{data.email}</dd>
                        </div>
                        <div className="flex flex-wrap gap-x-3">
                            <dt className="text-faint">Parol</dt>
                            <dd className="font-medium">{data.password}</dd>
                        </div>
                    </dl>

                    <div className="mt-4 flex gap-2">
                        <button
                            type="button"
                            onClick={copy}
                            className="inline-flex items-center gap-2 rounded-full bg-invert px-4 py-2 text-[13px] font-medium text-on-invert"
                        >
                            <Icon name={copied ? "check" : "clipboard"} size={14} />
                            {copied ? "Nusxalandi" : "Nusxalash"}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-full border border-line px-4 py-2 text-[13px] text-muted hover:text-text"
                        >
                            Yopish
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function OrganizationRow({
    organization,
    onReset,
}: {
    organization: Organization;
    onReset: (data: Credentials & { name: string }) => void;
}) {
    const router = useRouter();
    const [busy, setBusy] = useState(false);

    async function remove() {
        const problems = organization.problem_count;
        if (
            !confirm(
                `«${organization.name}» o'chirilsinmi?\n\n` +
                    (problems ? `${problems} ta muammosi va ularga yozilgan takliflar ham o'chadi.\n` : "") +
                    (organization.account_email ? "Kirish hisobi ham o'chadi — endi tizimga kira olmaydi.\n" : "") +
                    "\nBuni qaytarib bo'lmaydi.",
            )
        ) {
            return;
        }

        setBusy(true);
        try {
            const response = await fetch(`/api/proxy/panel/organizations/${organization.id}`, {
                method: "DELETE",
            });
            if (response.ok) {
                // Ochiq «Tashkilot muammolari» sahifasi ham darhol yangilansin
                await refreshPublic("problems");
                router.refresh();
            } else {
                alert("O'chirib bo'lmadi. Qayta urinib ko'ring.");
            }
        } finally {
            setBusy(false);
        }
    }

    async function unlinkTelegram() {
        if (
            !confirm(
                `${organization.name} Telegram hisobidan uzilsinmi?\n\n` +
                    "Keyingi kirishda tashkilot yangi Telegram hisobini ulaydi.",
            )
        ) {
            return;
        }

        setBusy(true);
        try {
            const response = await fetch(
                `/api/proxy/panel/organizations/${organization.id}/telegram`,
                { method: "DELETE" },
            );
            if (response.ok) router.refresh();
        } finally {
            setBusy(false);
        }
    }

    async function reset() {
        if (!confirm(`${organization.name} uchun yangi parol yaratilsinmi?\n\nEski parol ishlamay qoladi.`)) {
            return;
        }

        setBusy(true);
        try {
            const response = await fetch(
                `/api/proxy/panel/organizations/${organization.id}/parol`,
                { method: "POST" },
            );
            const data = await response.json();
            if (response.ok) {
                onReset({ ...data.credentials, name: organization.name });
            }
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="flex flex-wrap items-center gap-4 py-4">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-surface text-muted">
                <Icon name="building" size={17} />
            </span>

            <div className="min-w-0 flex-1">
                <div className="text-[14px] font-medium">{organization.name}</div>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[12.5px] text-faint">
                    {organization.sphere_display && <span>{organization.sphere_display}</span>}
                    {organization.region_display && <span>{organization.region_display}</span>}
                    <span>{organization.problem_count} muammo</span>
                    <span>{formatShortDate(organization.created_at)}</span>
                </div>

                {organization.account_email && (
                    <TelegramBadge organization={organization} />
                )}
            </div>

            {organization.account_email ? (
                <span className="hidden font-mono text-[12.5px] text-muted sm:block">
                    {organization.account_email}
                </span>
            ) : (
                <span className="text-[12px] text-faint">hisob yo&apos;q</span>
            )}

            {organization.telegram_linked && (
                <button
                    type="button"
                    onClick={unlinkTelegram}
                    disabled={busy}
                    title="Telegram hisobini uzish"
                    className="shrink-0 rounded-full border border-line px-3 py-1.5 text-[12.5px] text-muted transition-colors hover:bg-warn-soft hover:text-warn-text disabled:opacity-40"
                >
                    TG&apos;ni uzish
                </button>
            )}

            {organization.account_email && (
                <button
                    type="button"
                    onClick={reset}
                    disabled={busy}
                    title="Yangi parol yaratish"
                    className="shrink-0 rounded-full border border-line px-3 py-1.5 text-[12.5px] text-muted transition-colors hover:text-text disabled:opacity-40"
                >
                    {busy ? "…" : "Yangi parol"}
                </button>
            )}

            <button
                type="button"
                onClick={remove}
                disabled={busy}
                title="Tashkilotni o'chirish"
                aria-label={`${organization.name} — o'chirish`}
                className="grid size-8 shrink-0 place-items-center rounded-full border border-line text-muted transition-colors hover:border-warn-text hover:bg-warn-soft hover:text-warn-text disabled:opacity-40"
            >
                <Icon name="trash" size={14} />
            </button>
        </div>
    );
}

/** «TG akkaunt» — tashkilot Telegram'ini ulaganmi. */
function TelegramBadge({ organization }: { organization: Organization }) {
    if (!organization.telegram_linked) {
        return (
            <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-dashed border-line px-2.5 py-1 text-[11.5px] text-faint">
                <Icon name="telegram" size={12} />
                TG akkaunt ulanmagan
                {organization.last_login ? "" : " · hali kirmagan"}
            </span>
        );
    }

    return (
        <span className="tone-blue mt-2 inline-flex flex-wrap items-center gap-x-2 gap-y-0.5 rounded-full border border-tone-line bg-tone-soft px-2.5 py-1 text-[11.5px] font-medium text-tone-text">
            <Icon name="telegram" size={12} />
            TG akkaunt
            {organization.telegram_username && <span>@{organization.telegram_username}</span>}
            {organization.telegram_phone && (
                <span className="font-normal opacity-80">{organization.telegram_phone}</span>
            )}
        </span>
    );
}

function Field({
    label,
    required,
    children,
}: {
    label: string;
    required?: boolean;
    children: React.ReactNode;
}) {
    return (
        <label className="block">
            <span className="mb-1.5 block text-[12.5px] font-medium text-muted">
                {label}
                {required && <span className="text-red-500"> *</span>}
            </span>
            {children}
        </label>
    );
}

const inputClass =
    "h-10 w-full rounded-lg border border-line bg-page px-3 text-[14px] transition-colors focus:border-accent focus:outline-none";
