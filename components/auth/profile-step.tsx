"use client";

import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Icon } from "@/components/icon";
import { cn } from "@/lib/cn";
import type { Choice } from "@/lib/types";

/**
 * Rol tanlangandan keyingi ikkinchi qadam.
 *
 * Startupper startapini, tadbirkor biznesini qisqacha tanishtiradi.
 * «Yosh» uchun bu qadam umuman ko'rsatilmaydi — u to'g'ri kabinetga o'tadi.
 *
 * Bu yerda faqat eng zarur maydonlar so'raladi; qolganini kabinetdan
 * to'ldiradi. Shuning uchun «Keyinroq» tugmasi ham bor.
 */
export function ProfileStep({
    role,
    spheres,
    stages,
    onDone,
}: {
    role: "startupper" | "entrepreneur";
    spheres: Choice[];
    stages: Choice[];
    onDone: () => void;
}) {
    const router = useRouter();
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const startup = role === "startupper";

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (busy) return;

        const form = new FormData(event.currentTarget);
        setBusy(true);
        setError(null);

        const body = startup
            ? {
                  name: form.get("name"),
                  sphere: form.get("sphere"),
                  stage: form.get("stage"),
                  about: form.get("about"),
                  problem_solved: form.get("problem_solved") ?? "",
                  team_size: Number(form.get("team_size") || 1),
              }
            : {
                  name: form.get("name"),
                  sphere: form.get("sphere"),
                  founded_year: Number(form.get("founded_year")) || null,
                  employees: Number(form.get("employees")) || null,
                  description: form.get("description"),
              };

        try {
            const response = await fetch(
                startup ? "/api/proxy/me/startup" : "/api/proxy/me/business",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                },
            );

            if (!response.ok) {
                const payload = (await response.json().catch(() => null)) as Record<
                    string,
                    string[] | string
                > | null;
                const first = payload ? Object.values(payload)[0] : null;
                setError(
                    Array.isArray(first) ? first[0] : ((first as string) ?? "Saqlab bo'lmadi."),
                );
                return;
            }

            onDone();
            router.replace("/kabinet");
            router.refresh();
        } catch {
            setError("Tarmoqda xatolik.");
        } finally {
            setBusy(false);
        }
    }

    return (
        <motion.form
            onSubmit={submit}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
            <div className="mb-7">
                <span className="text-[12px] font-medium uppercase tracking-[0.1em] text-accent">
                    2-qadam
                </span>
                <h1 className="mt-2.5 text-3xl font-semibold tracking-tight">
                    {startup ? "Startapingiz haqida" : "Biznesingiz haqida"}
                </h1>
                <p className="mt-2.5 text-[14.5px] leading-relaxed text-muted">
                    {startup
                        ? "Qisqacha tanishtiring — startapingiz reyestrga tushadi va investorlarga ko'rinadi."
                        : "Qisqacha yozing — biznes profilingiz kabinetda ochiladi va hamkorlarga ko'rinadi."}
                </p>
            </div>

            <div className="grid gap-4">
                <Field label={startup ? "Startap nomi" : "Biznes nomi"}>
                    <input
                        name="name"
                        required
                        maxLength={200}
                        placeholder={startup ? "Masalan: Tilchi AI" : "Masalan: Buxoro Tekstil"}
                        className={INPUT}
                    />
                </Field>

                <Field label="Yo'nalish">
                    <select name="sphere" required defaultValue={spheres[0]?.value} className={INPUT}>
                        {spheres.map((item) => (
                            <option key={item.value} value={item.value}>
                                {item.label}
                            </option>
                        ))}
                    </select>
                </Field>

                {startup ? (
                    <>
                        <Field label="Bosqichi">
                            <select
                                name="stage"
                                required
                                defaultValue={stages[0]?.value}
                                className={INPUT}
                            >
                                {stages.map((item) => (
                                    <option key={item.value} value={item.value}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        <Field label="Startapingiz nima qiladi?">
                            <textarea
                                name="about"
                                required
                                rows={4}
                                minLength={30}
                                placeholder="Mahsulotingiz nima, kimga kerak, qanday ishlaydi"
                                className={`${INPUT} resize-y leading-relaxed`}
                            />
                        </Field>

                        <Field label="Qaysi muammoni hal qiladi?" hint="Ixtiyoriy">
                            <textarea
                                name="problem_solved"
                                rows={2}
                                placeholder="Bu muammo hozir qanday hal qilinyapti va nimasi yomon"
                                className={`${INPUT} resize-y leading-relaxed`}
                            />
                        </Field>

                        <Field label="Jamoada necha kishi?">
                            <input
                                type="number"
                                name="team_size"
                                min={1}
                                defaultValue={1}
                                className={INPUT}
                            />
                        </Field>
                    </>
                ) : (
                    <>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Tashkil topgan yil" hint="Ixtiyoriy">
                                <input
                                    type="number"
                                    name="founded_year"
                                    min={1900}
                                    max={new Date().getFullYear()}
                                    placeholder="2019"
                                    className={INPUT}
                                />
                            </Field>

                            <Field label="Xodimlar soni" hint="Ixtiyoriy">
                                <input
                                    type="number"
                                    name="employees"
                                    min={1}
                                    placeholder="35"
                                    className={INPUT}
                                />
                            </Field>
                        </div>

                        <Field label="Biznesingiz nima bilan shug'ullanadi?">
                            <textarea
                                name="description"
                                required
                                rows={4}
                                minLength={30}
                                placeholder="Nima ishlab chiqarasiz yoki qanday xizmat ko'rsatasiz"
                                className={`${INPUT} resize-y leading-relaxed`}
                            />
                        </Field>
                    </>
                )}
            </div>

            {error && (
                <p className="mt-5 flex items-start gap-2.5 rounded-xl bg-warn-soft px-4 py-3 text-[13.5px] text-warn-text">
                    <Icon name="alert" size={16} className="mt-0.5 shrink-0" />
                    {error}
                </p>
            )}

            <button
                type="submit"
                disabled={busy}
                className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-invert py-3.5 text-[15px] font-semibold text-on-invert transition-opacity duration-200 hover:opacity-90 disabled:opacity-40"
            >
                {busy ? "Saqlanmoqda…" : "Tayyor"}
                {!busy && <Icon name="arrowRight" size={17} />}
            </button>

            <button
                type="button"
                onClick={() => {
                    onDone();
                    router.replace("/kabinet");
                    router.refresh();
                }}
                className="mt-3 w-full text-[13.5px] text-muted transition-colors hover:text-text"
            >
                Keyinroq to&apos;ldiraman
            </button>
        </motion.form>
    );
}

const INPUT =
    "h-12 w-full rounded-xl border border-line bg-page px-4 text-[15px] outline-none transition-colors placeholder:text-faint focus:border-accent";

function Field({
    label,
    hint,
    children,
}: {
    label: string;
    hint?: string;
    children: React.ReactNode;
}) {
    return (
        <label className={cn("block")}>
            <span className="mb-1.5 flex flex-wrap items-baseline gap-x-2">
                <span className="text-[13px] font-medium">{label}</span>
                {hint && <span className="text-[12px] text-faint">{hint}</span>}
            </span>
            {children}
        </label>
    );
}
