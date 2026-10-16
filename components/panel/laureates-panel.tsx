"use client";

import { ContentManager } from "@/components/panel/content-manager";
import { ImageField, ImportBox } from "@/components/panel/office-panel";
import { Field, INPUT, Toggle } from "@/components/panel/ui";
import type { Choice, Laureate } from "@/lib/types";

/**
 * Panel: «Mirzo Ulug'bek vorislari» — Samarqand viloyati Innovatsion
 * rivojlanish bo'linmasi. Tepada Excel yuklash, pastda g'oliblar ro'yxati.
 */

export type PanelLaureate = Laureate & {
    birth_date: string | null;
    is_published: boolean;
    visible: boolean;
};

export function LaureatesPanel({ items, districts }: { items: PanelLaureate[]; districts: Choice[] }) {
    return (
        <>
            <ImportBox resource="laureates" title="Excel'dan yuklash">
                O&apos;qiladigan ustunlar: <b>Yil, F.I.Sh, Tuman, Loyiha nomi, Loyiha haqida, Tug&apos;ilgan sana, Yoshi,
                Ta&apos;lim muassasasi, Kurs, Respublika g&apos;olibi, Rasmi</b>. Qolganlari (telefon, fudbolka va h.k.)
                e&apos;tiborsiz qoladi. «Yil» ustuni bo&apos;lmasa — sarlavhadagi yil olinadi. Rasmlar Excel ichidan
                olinadi, bir xil g&apos;olib ikki marta yuklanmaydi.
            </ImportBox>
            <div className="mt-10">
                <ContentManager<PanelLaureate>
                    resource="laureates"
                    tag="laureates"
                    title="Mirzo Ulug'bek vorislari"
                    description="Tanlov g'oliblari va loyihalari. Saytda Startaplar → «Innovatsion rivojlanish bo'linmasi» bo'limida ko'rinadi."
                    addLabel="G'olib qo'shish"
                    emptyText="Hali g'olib yo'q — yuqoridan Excel faylni yuklang."
                    icon="trophy"
                    hideLabel="Saytdan yashirish"
                    showLabel="Saytda ko'rsatish"
                    items={items}
                    render={(item) => ({
                        title: item.project_name,
                        icon: "trophy",
                        image: item.photo,
                        href: `/mirzo-ulugbek-vorislari/${item.id}`,
                        badges: (
                            <>
                                <span className="rounded-full bg-surface px-2.5 py-0.5 text-[11px] font-semibold tabular-nums">
                                    {item.year}
                                </span>
                                {item.is_national_winner && (
                                    <span className="tone-amber rounded-full bg-tone-soft px-2.5 py-0.5 text-[11px] font-medium text-tone-text">
                                        Respublika g&apos;olibi
                                    </span>
                                )}
                            </>
                        ),
                        meta: (
                            <>
                                <span className="font-medium text-muted">{item.full_name}</span>
                                {item.age ? <span>{item.age} yosh</span> : null}
                                {item.district ? <span>{item.district}</span> : null}
                                {item.education_place ? <span>{item.education_place}</span> : null}
                            </>
                        ),
                    })}
                    renderForm={(item) => <LaureateForm item={item} districts={districts} />}
                />
            </div>
        </>
    );
}

function LaureateForm({ item, districts }: { item: PanelLaureate | null; districts: Choice[] }) {
    return (
        <div className="grid gap-4 md:grid-cols-2">
            <Field label="Loyiha nomi" className="md:col-span-2">
                <input name="project_name" required maxLength={250} defaultValue={item?.project_name ?? ""} className={INPUT} />
            </Field>
            <Field label="Loyiha haqida" className="md:col-span-2">
                <textarea name="about" rows={4} defaultValue={item?.about ?? ""} className={INPUT} />
            </Field>
            <Field label="F.I.Sh.">
                <input name="full_name" required maxLength={150} defaultValue={item?.full_name ?? ""} className={INPUT} />
            </Field>
            <Field label="Tanlov yili">
                <input
                    type="number"
                    name="year"
                    required
                    min={2000}
                    max={2100}
                    defaultValue={item?.year ?? new Date().getFullYear()}
                    className={INPUT}
                />
            </Field>
            <Field label="Tuman / shahar">
                <select name="district" defaultValue={item?.district ?? ""} className={INPUT}>
                    <option value="">—</option>
                    {districts.map((district) => (
                        <option key={district.value} value={district.label}>
                            {district.label}
                        </option>
                    ))}
                </select>
            </Field>
            <Field label="Yoshi">
                <input type="number" name="age" min={5} max={99} defaultValue={item?.age ?? ""} className={INPUT} />
            </Field>
            <Field label="Ta'lim muassasasi">
                <input name="education_place" maxLength={250} defaultValue={item?.education_place ?? ""} className={INPUT} />
            </Field>
            <Field label="Kurs / sinf">
                <input name="course" maxLength={40} defaultValue={item?.course ?? ""} placeholder="2-kurs" className={INPUT} />
            </Field>
            <Field label="Tug'ilgan sana">
                <input type="date" name="birth_date" defaultValue={item?.birth_date ?? ""} className={INPUT} />
            </Field>
            <Field label="Rasmi">
                <ImageField name="photo_file" removeName="remove_photo" current={item?.photo ?? null} round />
            </Field>

            <div className="flex flex-wrap gap-6 md:col-span-2">
                <Toggle name="is_national_winner" label="Respublika g'olibi" defaultChecked={item?.is_national_winner ?? false} />
                <Toggle name="is_published" label="Saytda ko'rinsin" defaultChecked={item?.is_published ?? true} />
            </div>
        </div>
    );
}
