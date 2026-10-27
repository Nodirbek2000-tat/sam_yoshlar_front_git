"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";

import { Icon } from "@/components/icon";
import { cn } from "@/lib/cn";
import { shrinkImage } from "@/lib/shrink-image";
import type { PollApplyInfo } from "@/lib/types";

import { nominationEmoji, nominationTone } from "./contest-ui";

/** Xato qaysi maydonga tegishli bo'lsa — o'sha maydon qizil bo'lib, ko'rinadigan joyga suriladi */
type FieldName = "category" | "name" | "mahalla" | "district" | "phone" | "note" | "photo";

const BOX =
    "w-full rounded-2xl border bg-page px-4 py-3 text-[16px] outline-none transition-colors placeholder:text-faint focus:border-accent sm:text-[15px]";

/** «Uchqunlar» — ariza qabul qilinganda bir marta sochiladi */
const SPARKS = Array.from({ length: 16 }, (_, index) => {
    const angle = (index / 16) * Math.PI * 2;
    const distance = 80 + (index % 3) * 22;
    return {
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        tone: nominationTone(index),
    };
});

/**
 * Nomzodning o'zi ariza berishi: yo'nalish, ism, mahalla, tuman, telefon,
 * qisqa ma'lumot va rasm. Kirish shart emas — havolaning o'zi kalit.
 */
export function ApplyForm({ token, info }: { token: string; info: PollApplyInfo }) {
    const [category, setCategory] = useState<number | null>(
        info.categories.length === 1 ? info.categories[0].id : null,
    );
    const [photo, setPhoto] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [note, setNote] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<{ text: string; field: FieldName | null } | null>(null);
    const [done, setDone] = useState<{ name: string; category: string } | null>(null);
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        return () => {
            if (preview) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    function pick(file: File | undefined) {
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            setError({ text: "Faqat rasm yuklang (JPG yoki PNG).", field: "photo" });
            return;
        }
        setPhoto(file);
        setPreview(URL.createObjectURL(file));
        if (error?.field === "photo") setError(null);
    }

    function fail(text: string, field: FieldName | null) {
        setError({ text, field });
        const target = field
            ? formRef.current?.querySelector<HTMLElement>(`[data-field="${field}"]`)
            : null;
        target?.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (busy) return;

        if (info.categories.length && !category) return fail("Yo'nalishni tanlang.", "category");
        if (!photo) return fail("Rasmingizni yuklang.", "photo");

        const data = new FormData(event.currentTarget);
        if (category) data.set("category", String(category));

        setBusy(true);
        setError(null);
        try {
            data.set("photo", await shrinkImage(photo, 1200));
            const response = await fetch(`/api/proxy/polls/ariza/${encodeURIComponent(token)}`, {
                method: "POST",
                body: data,
            });
            const payload = (await response.json().catch(() => null)) as {
                detail?: string;
                field?: FieldName;
                name?: string;
                category?: string;
            } | null;

            if (!response.ok) {
                fail(
                    response.status === 429 && !payload?.detail
                        ? "Juda ko'p urinish — birozdan keyin qayta yuboring."
                        : (payload?.detail ?? "Yuborib bo'lmadi. Qayta urinib ko'ring."),
                    payload?.field ?? null,
                );
                return;
            }

            setDone({
                name: payload?.name ?? String(data.get("name") ?? ""),
                category: payload?.category ?? "",
            });
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch {
            fail("Tarmoqda xatolik. Internetni tekshirib, qayta urinib ko'ring.", null);
        } finally {
            setBusy(false);
        }
    }

    function again() {
        setDone(null);
        setCategory(null);
        setPhoto(null);
        setPreview(null);
        setNote("");
        formRef.current?.reset();
    }

    const bad = (field: FieldName) => error?.field === field;

    return (
        <>
            {/* ------------------------------------------------ Sarlavha */}
            <section className="tone-emerald relative overflow-hidden border-b border-line">
                <div aria-hidden className="aurora" />
                <div className="grid-lines absolute inset-0 opacity-[0.3] [mask-image:radial-gradient(70%_60%_at_50%_0%,#000,transparent)]" />
                <div
                    aria-hidden
                    className="pointer-events-none absolute -right-40 -top-40 size-[34rem] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--tone)_20%,transparent),transparent_68%)]"
                />

                <div className="container-page relative py-10 md:py-14">
                    <span className="inline-flex items-center gap-2 rounded-full border border-tone-line bg-page/80 px-3 py-1 text-[11.5px] font-medium uppercase tracking-[0.12em] text-tone-text">
                        <Icon name="trophy" size={13} />
                        Nomzod arizasi
                    </span>
                    <h1 className="mt-4 max-w-3xl text-[2rem] font-semibold leading-[1.08] tracking-tight sm:text-5xl">
                        {info.title}
                    </h1>
                    <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted">
                        Ma&apos;lumotlaringizni to&apos;ldiring. Tashkilotchilar tasdiqlagach, siz saytda
                        nomzod sifatida chiqasiz va yoshlar sizga ovoz bera boshlaydi.
                    </p>

                    {info.accepts && !done && (
                        <ol className="mt-7 flex flex-wrap gap-2 text-[12.5px] text-muted">
                            {["Yo'nalish", "Ma'lumotlar", "Rasm", "Yuborish"].map((step, index) => (
                                <li
                                    key={step}
                                    className="inline-flex items-center gap-2 rounded-full border border-line bg-page/70 py-1 pl-1 pr-3"
                                >
                                    <span className="grid size-5 place-items-center rounded-full bg-tone text-[11px] font-semibold text-page">
                                        {index + 1}
                                    </span>
                                    {step}
                                </li>
                            ))}
                        </ol>
                    )}
                </div>
            </section>

            <div className="container-page py-8 md:py-12">
                {/* Birinchi ko'rinish animatsiyasiz — JS yuklanmasdan ham forma ko'rinib tursin */}
                <AnimatePresence mode="wait" initial={false}>
                    {!info.accepts ? (
                        <motion.div
                            key="closed"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mx-auto max-w-lg rounded-3xl border border-line bg-raised p-8 text-center"
                        >
                            <span className="tone-slate mx-auto grid size-14 place-items-center rounded-2xl bg-tone-soft text-tone-text">
                                <Icon name="lock" size={24} />
                            </span>
                            <h2 className="mt-4 text-[1.3rem] font-semibold tracking-tight">
                                Ariza qabul qilish yakunlangan
                            </h2>
                            <p className="mt-2 text-[14px] text-muted">
                                Bu tanlovga hozir ariza qabul qilinmayapti. Savollar bo&apos;lsa,
                                tashkilotchilarga murojaat qiling.
                            </p>
                            <Link
                                href="/sorovnomalar"
                                className="mt-6 inline-flex items-center gap-2 rounded-full bg-invert px-5 py-2.5 text-[13.5px] font-medium text-on-invert"
                            >
                                So&apos;rovnomalar
                                <Icon name="arrowRight" size={14} />
                            </Link>
                        </motion.div>
                    ) : done ? (
                        <motion.div
                            key="done"
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                            className="tone-emerald mx-auto max-w-lg overflow-hidden rounded-[2rem] border border-tone-line bg-raised p-8 text-center shadow-[0_30px_70px_-40px_var(--tone)]"
                        >
                            <div className="relative mx-auto grid size-28 place-items-center">
                                {SPARKS.map((spark, index) => (
                                    <motion.span
                                        key={index}
                                        className={`${spark.tone} absolute size-2 rounded-full bg-tone`}
                                        initial={{ x: 0, y: 0, opacity: 1, scale: 0.6 }}
                                        animate={{ x: spark.x, y: spark.y, opacity: 0, scale: 1 }}
                                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                                    />
                                ))}
                                {preview ? (
                                    <motion.span
                                        className="relative block size-24 overflow-hidden rounded-full ring-4 ring-tone/50"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 380, damping: 20 }}
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={preview} alt="" className="size-full object-cover" />
                                    </motion.span>
                                ) : null}
                                <motion.span
                                    className="absolute -bottom-1 -right-1 grid size-10 place-items-center rounded-full bg-tone text-page shadow-lg"
                                    initial={{ scale: 0, rotate: -40 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 420, damping: 16, delay: 0.25 }}
                                >
                                    <Icon name="check" size={20} strokeWidth={2.6} />
                                </motion.span>
                            </div>

                            <h2 className="mt-6 text-[1.45rem] font-semibold tracking-tight">
                                Arizangiz qabul qilindi!
                            </h2>
                            <p className="mt-2 text-[14.5px] leading-relaxed text-muted">
                                <b className="text-text">{done.name}</b>
                                {done.category && (
                                    <>
                                        , yo&apos;nalish: <b className="text-text">{done.category}</b>
                                    </>
                                )}
                                . Tashkilotchilar ko&apos;rib chiqqach, saytda nomzod sifatida chiqasiz.
                            </p>

                            <div className="mt-7 grid gap-2">
                                {info.categories.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={again}
                                        className="inline-flex items-center justify-center gap-2 rounded-full bg-invert px-5 py-3 text-[14px] font-medium text-on-invert transition-opacity hover:opacity-90"
                                    >
                                        <Icon name="plus" size={15} />
                                        Boshqa yo&apos;nalishga ham ariza berish
                                    </button>
                                )}
                                <Link
                                    href="/sorovnomalar"
                                    className="rounded-full px-5 py-2.5 text-[13.5px] text-muted transition-colors hover:text-text"
                                >
                                    So&apos;rovnomalarga o&apos;tish
                                </Link>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.form
                            key="form"
                            ref={formRef}
                            onSubmit={submit}
                            noValidate
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mx-auto grid max-w-3xl gap-6"
                        >
                            {/* Robotlar uchun tuzoq — odam ko'rmaydi */}
                            <input
                                type="text"
                                name="website"
                                tabIndex={-1}
                                autoComplete="off"
                                aria-hidden
                                className="absolute -left-[9999px] size-px opacity-0"
                            />

                            {info.categories.length > 0 && (
                                <Step
                                    number={1}
                                    title="Yo'nalishni tanlang"
                                    hint="Qaysi nominatsiyada qatnashasiz? Boshqasiga keyin alohida ariza berish mumkin."
                                    field="category"
                                    invalid={bad("category")}
                                >
                                    <div
                                        role="radiogroup"
                                        aria-label="Yo'nalish"
                                        className="grid gap-2.5 sm:grid-cols-2"
                                    >
                                        {info.categories.map((item, index) => {
                                            const active = category === item.id;
                                            return (
                                                <button
                                                    key={item.id}
                                                    type="button"
                                                    role="radio"
                                                    aria-checked={active}
                                                    onClick={() => {
                                                        setCategory(item.id);
                                                        if (error?.field === "category") setError(null);
                                                    }}
                                                    className={cn(
                                                        nominationTone(index),
                                                        "group relative flex items-center gap-3.5 overflow-hidden rounded-2xl border p-3.5 text-left transition-all duration-300",
                                                        active
                                                            ? "border-tone-line bg-tone-soft shadow-[0_16px_34px_-22px_var(--tone)]"
                                                            : "border-line bg-page hover:-translate-y-0.5 hover:border-tone-line",
                                                    )}
                                                >
                                                    <span
                                                        className={cn(
                                                            "grid size-12 shrink-0 place-items-center rounded-xl text-[24px] transition-transform duration-300 group-hover:scale-110",
                                                            active ? "bg-page/80" : "bg-tone-soft",
                                                        )}
                                                    >
                                                        {nominationEmoji(item)}
                                                    </span>
                                                    <span className="min-w-0 flex-1 text-[14px] font-medium leading-snug">
                                                        {item.title}
                                                    </span>
                                                    <span
                                                        className={cn(
                                                            "grid size-6 shrink-0 place-items-center rounded-full border-2 transition-colors",
                                                            active
                                                                ? "border-tone bg-tone text-page"
                                                                : "border-line",
                                                        )}
                                                    >
                                                        {active && <Icon name="check" size={13} strokeWidth={3} />}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </Step>
                            )}

                            <Step
                                number={info.categories.length ? 2 : 1}
                                title="Ma'lumotlaringiz"
                                hint="Saytda ismingiz, mahallangiz va tumaningiz ko'rinadi. Telefon — faqat tashkilotchilarga."
                            >
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <Label text="Ism va familiya" field="name" className="sm:col-span-2">
                                        <input
                                            name="name"
                                            required
                                            maxLength={150}
                                            autoComplete="name"
                                            placeholder="Aliyev Vali"
                                            className={cn(BOX, bad("name") ? "border-warn-text" : "border-line")}
                                        />
                                    </Label>
                                    <Label text="Mahallangiz" field="mahalla">
                                        <input
                                            name="mahalla"
                                            required
                                            maxLength={150}
                                            placeholder="Navbahor MFY"
                                            className={cn(BOX, bad("mahalla") ? "border-warn-text" : "border-line")}
                                        />
                                    </Label>
                                    <Label text="Tuman / shahar" field="district">
                                        <select
                                            name="district"
                                            required
                                            defaultValue=""
                                            className={cn(BOX, bad("district") ? "border-warn-text" : "border-line")}
                                        >
                                            <option value="" disabled>
                                                Tanlang
                                            </option>
                                            {info.districts.map((item) => (
                                                <option key={item.value} value={item.value}>
                                                    {item.label}
                                                </option>
                                            ))}
                                        </select>
                                    </Label>
                                    <Label text="Telefon raqamingiz" field="phone" className="sm:col-span-2">
                                        <input
                                            name="phone"
                                            type="tel"
                                            inputMode="tel"
                                            required
                                            maxLength={25}
                                            autoComplete="tel"
                                            defaultValue="+998 "
                                            className={cn(BOX, bad("phone") ? "border-warn-text" : "border-line")}
                                        />
                                    </Label>
                                    <Label
                                        text="Yutuqlaringiz (ixtiyoriy)"
                                        field="note"
                                        className="sm:col-span-2"
                                        aside={`${note.length}/300`}
                                    >
                                        <textarea
                                            name="note"
                                            rows={3}
                                            maxLength={300}
                                            value={note}
                                            onChange={(event) => setNote(event.target.value)}
                                            placeholder="Masalan: 120 nafar yoshni ishga joylashtirdim, 8 ta loyiha boshladim…"
                                            className={cn(BOX, "resize-none", bad("note") ? "border-warn-text" : "border-line")}
                                        />
                                    </Label>
                                </div>
                            </Step>

                            <Step
                                number={info.categories.length ? 3 : 2}
                                title="Rasmingiz"
                                hint="Yuzingiz aniq ko'rinadigan, yorug' rasm. Saytda kartangizda chiqadi."
                                field="photo"
                                invalid={bad("photo")}
                            >
                                <label
                                    onDragOver={(event) => event.preventDefault()}
                                    onDrop={(event) => {
                                        event.preventDefault();
                                        pick(event.dataTransfer.files?.[0]);
                                    }}
                                    className={cn(
                                        "group flex cursor-pointer flex-col items-center gap-4 rounded-3xl border-2 border-dashed p-6 text-center transition-colors sm:flex-row sm:text-left",
                                        bad("photo")
                                            ? "border-warn-text bg-warn-soft/40"
                                            : "border-line bg-page hover:border-accent",
                                    )}
                                >
                                    <span className="tone-emerald relative grid size-28 shrink-0 place-items-center overflow-hidden rounded-full bg-tone-soft text-tone-text ring-4 ring-page">
                                        {preview ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={preview} alt="" className="size-full object-cover" />
                                        ) : (
                                            <Icon name="user" size={40} strokeWidth={1.4} />
                                        )}
                                        <span className="absolute inset-x-0 bottom-0 bg-black/55 py-1 text-[11px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                                            {preview ? "Almashtirish" : "Tanlash"}
                                        </span>
                                    </span>
                                    <span className="min-w-0">
                                        <span className="block text-[15px] font-medium">
                                            {photo ? photo.name : "Rasm tanlang yoki shu yerga tashlang"}
                                        </span>
                                        <span className="mt-1 block text-[13px] text-muted">
                                            JPG yoki PNG. Katta rasm o&apos;zi kichraytiriladi.
                                        </span>
                                        <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-invert px-4 py-2 text-[13px] font-medium text-on-invert">
                                            <Icon name="image" size={14} />
                                            {photo ? "Boshqa rasm" : "Rasm yuklash"}
                                        </span>
                                    </span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="sr-only"
                                        onChange={(event) => {
                                            pick(event.target.files?.[0]);
                                            event.target.value = "";
                                        }}
                                    />
                                </label>
                            </Step>

                            <AnimatePresence>
                                {error && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        role="alert"
                                        className="flex items-start gap-2 rounded-2xl bg-warn-soft px-4 py-3 text-[14px] text-warn-text"
                                    >
                                        <Icon name="alert" size={16} className="mt-0.5 shrink-0" />
                                        {error.text}
                                    </motion.p>
                                )}
                            </AnimatePresence>

                            <button
                                type="submit"
                                disabled={busy}
                                className="tone-emerald group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-tone px-6 py-4 text-[15.5px] font-semibold text-page shadow-[0_18px_40px_-18px_var(--tone)] transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-70"
                            >
                                <Icon name="send" size={17} />
                                {busy ? "Yuborilmoqda…" : "Arizani yuborish"}
                            </button>
                            <p className="-mt-3 text-center text-[12.5px] text-faint">
                                Yuborish orqali ma&apos;lumotlaringiz tanlov uchun ishlatilishiga rozilik
                                bildirasiz.
                            </p>
                        </motion.form>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
}

function Step({
    number,
    title,
    hint,
    field,
    invalid = false,
    children,
}: {
    number: number;
    title: string;
    hint: string;
    field?: FieldName;
    invalid?: boolean;
    children: ReactNode;
}) {
    return (
        <section
            data-field={field}
            className={cn(
                "scroll-mt-24 rounded-[1.75rem] border bg-raised p-5 md:p-7",
                invalid ? "border-warn-text" : "border-line",
            )}
        >
            <div className="flex items-start gap-3.5">
                <span className="tone-emerald grid size-9 shrink-0 place-items-center rounded-full bg-tone-soft text-[14px] font-semibold text-tone-text">
                    {number}
                </span>
                <div>
                    <h2 className="text-[17px] font-semibold tracking-tight">{title}</h2>
                    <p className="mt-0.5 text-[13px] text-muted">{hint}</p>
                </div>
            </div>
            <div className="mt-5">{children}</div>
        </section>
    );
}

function Label({
    text,
    field,
    aside,
    className,
    children,
}: {
    text: string;
    field: FieldName;
    aside?: string;
    className?: string;
    children: ReactNode;
}) {
    return (
        <label data-field={field} className={cn("block scroll-mt-24", className)}>
            <span className="mb-1.5 flex items-baseline justify-between text-[12.5px] font-medium text-muted">
                {text}
                {aside && <span className="tabular-nums text-faint">{aside}</span>}
            </span>
            {children}
        </label>
    );
}
