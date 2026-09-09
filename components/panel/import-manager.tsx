"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Icon, type IconName } from "@/components/icon";
import { INPUT, PanelHeader, refreshPublic } from "@/components/panel/ui";
import { cn } from "@/lib/cn";

/**
 * JSON'dan ommaviy yuklash.
 *
 * Ikki bo'lim bor: tashabbuslar (ovozlari va takliflari bilan) va
 * tashkilotlar (muammolari va yoshlar yechimlar bilan). Yuklash mantiqi
 * ikkalasida bir xil — faqat manzil, maydonlar va namuna farq qiladi.
 */

type Summary = Record<string, number>;
type Report = Summary & { problems?: string[]; issues?: string[] };

type Section = {
    /** Fayl ildizidagi kalit: `initiatives` yoki `organizations`. */
    key: string;
    label: string;
    icon: IconName;
    tone: string;
    /** Backend manzili — `/api/proxy/panel/import/...` */
    endpoint: string;
    /** Kesh yorlig'i */
    tag: string;
    title: string;
    description: string;
    fileHint: string;
    /** Natijada ko'rsatiladigan raqamlar */
    stats: { key: string; label: string; tone: string }[];
    sample: string;
    notes: string[];
};

const SECTIONS: Section[] = [
    {
        key: "initiatives",
        label: "Tashabbuslar",
        icon: "spark",
        tone: "tone-emerald",
        endpoint: "/api/proxy/panel/import/initiatives",
        tag: "initiatives",
        title: "Tashabbuslar importi",
        description: "Yoshlar g'oyalarini ovozlari va takliflari bilan yuklash.",
        fileHint: "tashabbuslar.json",
        stats: [
            { key: "created", label: "Qo'shildi", tone: "emerald" },
            { key: "skipped", label: "O'tkazildi", tone: "slate" },
            { key: "comments", label: "Taklif", tone: "violet" },
            { key: "votes", label: "Ovoz", tone: "amber" },
        ],
        sample: `{
  "initiatives": [
    {
      "direction": "eco",
      "kind": "idea",
      "title": "Maktab hovlisiga daraxt",
      "description": "Har bir maktab hovlisiga o'nta ko'chat ekiladi.",
      "expected_result": "Yiliga 300 ta daraxt.",
      "author_name": "Aziz Rahimov",
      "region": "samarqand",
      "vote_count": 287,
      "created_at": "2026-05-14",
      "comments": [
        { "author_name": "Nodira", "text": "Zo'r fikr." }
      ]
    }
  ]
}`,
        notes: [
            "**direction**, **title**, **description** majburiy; qolgani ixtiyoriy.",
            "**vote_count** — tayyor ovozlar soni.",
            "**comments** — tashabbusga yozilgan takliflar.",
            "Bir xil sarlavhali tashabbus bor bo'lsa o'tkazib yuboriladi.",
        ],
    },
    {
        key: "organizations",
        label: "Tashkilotlar",
        icon: "building",
        tone: "tone-violet",
        endpoint: "/api/proxy/panel/import/organizations",
        tag: "problems",
        title: "Tashkilotlar importi",
        description:
            "Tashkilotlarni muammolari va yoshlar bergan yechimlari bilan yuklash.",
        fileHint: "tashkilotlar.json",
        stats: [
            { key: "created", label: "Tashkilot", tone: "violet" },
            { key: "problems_added", label: "Muammo", tone: "rose" },
            { key: "solutions", label: "Taklif", tone: "emerald" },
            { key: "likes", label: "Layk", tone: "amber" },
        ],
        sample: `{
  "organizations": [
    {
      "name": "AgroTech MChJ",
      "sphere": "qishloq_xojaligi",
      "contact_person": "Ali Valiyev",
      "phone": "+998901112233",
      "region": "samarqand",
      "employees": 40,
      "problems": [
        {
          "category": "main",
          "description": "Hosilni saqlash uchun sovuq ombor yo'q.",
          "created_at": "2026-04-02",
          "solutions": [
            {
              "author_name": "Aziz",
              "title": "Quyoshli sovutgich",
              "description": "Quyosh panelida ishlaydigan modul ombor.",
              "technologies": "Solar, IoT",
              "like_count": 5
            }
          ]
        }
      ]
    }
  ]
}`,
        notes: [
            "**name** majburiy; **sphere** berilmasa «Boshqa» bo'ladi.",
            "**problems** — tashkilot muammolari, har birida **solutions**.",
            "**like_count** — taklifning layklari; ko'p yig'gani tepaga chiqadi.",
            "Shu nomli tashkilot bor bo'lsa mavjudiga muammolar qo'shiladi.",
        ],
    },
];

export function ImportManager() {
    const [active, setActive] = useState(SECTIONS[0]);

    return (
        <>
            <PanelHeader
                title="Import"
                description="Tayyor ma'lumotni JSON fayldan ommaviy yuklash."
            />

            {/* Bo'lim tanlash */}
            <div className="mt-6 inline-flex rounded-full border border-line p-1 text-[13px]">
                {SECTIONS.map((section) => (
                    <button
                        key={section.key}
                        type="button"
                        onClick={() => setActive(section)}
                        className={cn(
                            section.tone,
                            "relative inline-flex items-center gap-2 rounded-full px-4 py-2 transition-colors",
                            active.key === section.key
                                ? "font-medium text-tone-text"
                                : "text-muted hover:text-text",
                        )}
                    >
                        {active.key === section.key && (
                            <motion.span
                                layoutId="import-tab"
                                className="absolute inset-0 -z-10 rounded-full border border-tone-line bg-tone-soft"
                                transition={{ type: "spring", stiffness: 400, damping: 34 }}
                            />
                        )}
                        <Icon name={section.icon} size={15} />
                        {section.label}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={active.key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.25 }}
                >
                    <ImportSection section={active} onSwitch={setActive} />
                </motion.div>
            </AnimatePresence>
        </>
    );
}

/* ------------------------------------------------------------------ */

function ImportSection({
    section,
    onSwitch,
}: {
    section: Section;
    onSwitch: (section: Section) => void;
}) {
    const router = useRouter();
    const [mode, setMode] = useState<"file" | "text">("file");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [report, setReport] = useState<Report | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    /** Fayl boshqa bo'limniki bo'lsa — o'sha bo'limga o'tish taklifi */
    const [wrongSection, setWrongSection] = useState<Section | null>(null);

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (busy) return;

        const data = new FormData(event.currentTarget);
        setBusy(true);
        setError(null);
        setReport(null);
        setWrongSection(null);

        try {
            let text: string;

            if (mode === "file") {
                const file = data.get("file");
                if (!(file instanceof File) || file.size === 0) {
                    setError("Fayl tanlanmadi.");
                    return;
                }
                text = await file.text();
            } else {
                text = String(data.get("json") ?? "").trim();
                if (!text) {
                    setError("JSON matni bo'sh.");
                    return;
                }
            }

            // Serverga bormasdan tekshiramiz: JSON to'g'rimi va shu bo'limnikimi
            let parsed: unknown;
            try {
                parsed = JSON.parse(text);
            } catch {
                setError("JSON noto'g'ri yozilgan — qavslarni tekshiring.");
                return;
            }

            const other = otherSectionOf(parsed, section);
            if (other) {
                setWrongSection(other);
                setError(`Bu «${other.label}» fayli — «${section.label}» bo'limiga to'g'ri kelmaydi.`);
                return;
            }

            const response = await fetch(section.endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: text,
            });

            const payload = (await response.json().catch(() => null)) as
                | (Report & { detail?: string })
                | null;

            if (!response.ok) {
                setError(payload?.detail ?? "Yuklab bo'lmadi.");
                return;
            }

            setReport(payload as Report);
            await refreshPublic(section.tag);
            router.refresh();
        } catch {
            setError("Tarmoqda xatolik.");
        } finally {
            setBusy(false);
        }
    }

    const issues = report?.problems ?? report?.issues ?? [];

    return (
        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_21rem] lg:gap-10">
            <form onSubmit={submit} className="min-w-0">
                <h2 className="text-[15.5px] font-semibold tracking-tight">{section.title}</h2>
                <p className="mt-1.5 text-[13.5px] text-muted">{section.description}</p>

                <div className="mt-5 inline-flex rounded-full border border-line p-1 text-[13px]">
                    {(
                        [
                            { key: "file", label: "Fayl", icon: "doc" },
                            { key: "text", label: "Matn", icon: "chat" },
                        ] as const
                    ).map((item) => (
                        <button
                            key={item.key}
                            type="button"
                            onClick={() => setMode(item.key)}
                            className={cn(
                                "inline-flex items-center gap-2 rounded-full px-4 py-1.5 transition-colors",
                                mode === item.key
                                    ? "bg-invert font-medium text-on-invert"
                                    : "text-muted hover:text-text",
                            )}
                        >
                            <Icon name={item.icon} size={14} />
                            {item.label}
                        </button>
                    ))}
                </div>

                <div className="mt-5">
                    {mode === "file" ? (
                        <label
                            className={cn(
                                section.tone,
                                "flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-line px-6 py-12 text-center transition-colors hover:border-tone-line hover:bg-tone-soft",
                            )}
                        >
                            <span className="grid size-12 place-items-center rounded-2xl bg-tone-soft">
                                <Icon name={section.icon} size={22} className="text-tone-text" />
                            </span>
                            <span className="mt-4 text-[14.5px] font-medium">
                                {fileName ?? "JSON faylni tanlang"}
                            </span>
                            <span className="mt-1 text-[12.5px] text-muted">
                                {section.fileHint} — bosing yoki shu yerga tashlang
                            </span>
                            <input
                                type="file"
                                name="file"
                                accept=".json,application/json"
                                onChange={(event) =>
                                    setFileName(event.target.files?.[0]?.name ?? null)
                                }
                                className="sr-only"
                            />
                        </label>
                    ) : (
                        <textarea
                            name="json"
                            rows={16}
                            spellCheck={false}
                            placeholder={section.sample}
                            className={`${INPUT} resize-y font-mono text-[12.5px] leading-relaxed`}
                        />
                    )}
                </div>

                {error && (
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                        <p className="inline-flex items-start gap-2 rounded-xl bg-warn-soft px-4 py-2.5 text-[13px] text-warn-text">
                            <Icon name="alert" size={15} className="mt-0.5 shrink-0" />
                            {error}
                        </p>

                        {wrongSection && (
                            <button
                                type="button"
                                onClick={() => onSwitch(wrongSection)}
                                className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-[13px] font-medium transition-colors hover:bg-surface"
                            >
                                <Icon name={wrongSection.icon} size={14} />
                                «{wrongSection.label}» bo&apos;limiga o&apos;tish
                                <Icon name="arrowRight" size={13} />
                            </button>
                        )}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={busy}
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-invert px-5 py-2.5 text-[13.5px] font-medium text-on-invert transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                    {busy ? "Yuklanmoqda…" : "Yuklash"}
                    {!busy && <Icon name="arrowRight" size={14} />}
                </button>

                <AnimatePresence>
                    {report && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-7 rounded-2xl border border-line bg-surface p-5"
                        >
                            <h3 className="text-[14.5px] font-semibold">Natija</h3>

                            <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                                {section.stats.map((stat) => (
                                    <Stat
                                        key={stat.key}
                                        value={report[stat.key] ?? 0}
                                        label={stat.label}
                                        tone={stat.tone}
                                    />
                                ))}
                            </dl>

                            {typeof report.reused === "number" && report.reused > 0 && (
                                <p className="mt-4 text-[12.5px] text-muted">
                                    {report.reused} ta tashkilot allaqachon bor edi — yangisi
                                    yaratilmadi, muammolari qo&apos;shildi.
                                </p>
                            )}

                            {issues.length > 0 && (
                                <div className="mt-5 rounded-xl bg-warn-soft px-4 py-3">
                                    <p className="text-[12.5px] font-medium text-warn-text">
                                        {issues.length} ta yozuv o&apos;tmadi:
                                    </p>
                                    <ul className="mt-1.5 space-y-0.5 text-[12.5px] text-warn-text/85">
                                        {issues.map((line) => (
                                            <li key={line}>· {line}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </form>

            {/* Yordam */}
            <aside className="rounded-2xl border border-line p-5">
                <h2 className="text-[13px] font-semibold">Fayl qanday bo&apos;lishi kerak</h2>

                <pre className="mt-3 max-h-96 overflow-auto rounded-xl bg-page p-3.5 font-mono text-[11px] leading-relaxed text-muted">
                    {section.sample}
                </pre>

                <ul className="mt-4 space-y-2 text-[12.5px] leading-relaxed text-muted">
                    {section.notes.map((note) => (
                        <li key={note}>{renderNote(note)}</li>
                    ))}
                </ul>
            </aside>
        </div>
    );
}

/**
 * Fayl boshqa bo'limniki bo'lsa — o'sha bo'limni qaytaradi.
 *
 * Eng ko'p uchraydigan xato: tashabbuslar faylini tashkilotlar bo'limiga
 * tashlash. Shuni serverga bormasdan aniqlab, foydalanuvchiga aytamiz.
 */
function otherSectionOf(payload: unknown, current: Section): Section | null {
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;

    const root = payload as Record<string, unknown>;
    if (Array.isArray(root[current.key])) return null;

    return SECTIONS.find((item) => item.key !== current.key && Array.isArray(root[item.key])) ?? null;
}

/** `**maydon**` yozuvini quyuq matnga aylantiradi. */
function renderNote(note: string) {
    return note.split(/(\*\*[^*]+\*\*)/).map((chunk, index) =>
        chunk.startsWith("**") ? (
            <span key={index} className="font-medium text-text">
                {chunk.slice(2, -2)}
            </span>
        ) : (
            <span key={index}>{chunk}</span>
        ),
    );
}

function Stat({ value, label, tone }: { value: number; label: string; tone: string }) {
    return (
        <div className={`tone-${tone}`}>
            <dd className="text-2xl font-semibold tabular-nums tracking-tight text-tone-text">
                {value}
            </dd>
            <dt className="mt-0.5 text-[12px] text-muted">{label}</dt>
        </div>
    );
}
