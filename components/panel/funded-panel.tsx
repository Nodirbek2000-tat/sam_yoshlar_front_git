"use client";

import { ContentManager } from "@/components/panel/content-manager";
import { ImageField } from "@/components/panel/office-panel";
import { Field, INPUT, Toggle } from "@/components/panel/ui";
import { formatMoney } from "@/lib/format";
import type { FundedStartup } from "@/lib/types";

/**
 * Panel: mablag' (grant, investitsiya) olgan startaplar — bosh sahifaning
 * eng tepasidagi lenta. Rasm, nomi, qancha va kimdan olgani.
 */

export type PanelFundedStartup = FundedStartup & {
    order: number;
    is_published: boolean;
    visible: boolean;
};

export function FundedPanel({ items }: { items: PanelFundedStartup[] }) {
    return (
        <ContentManager<PanelFundedStartup>
            resource="funded"
            tag="funded"
            title="Mablag' olgan startuplar"
            description="Bosh sahifaning eng tepasidagi lentada chiqadi. Bosilsa — qisqa ma'lumot oynada ochiladi."
            addLabel="Startap qo'shish"
            emptyText="Hali startap qo'shilmagan — bosh sahifada bo'lim ko'rinmaydi."
            icon="bank"
            hideLabel="Saytdan yashirish"
            showLabel="Saytda ko'rsatish"
            items={items}
            render={(item) => ({
                title: item.name,
                icon: "rocket",
                image: item.image,
                href: "/",
                badges: (
                    <>
                        {item.amount ? (
                            <span className="tone-emerald rounded-full bg-tone-soft px-2.5 py-0.5 text-[11px] font-semibold text-tone-text">
                                {formatMoney(item.amount, item.currency)}
                            </span>
                        ) : null}
                        {item.year ? (
                            <span className="rounded-full bg-surface px-2.5 py-0.5 text-[11px] tabular-nums">{item.year}</span>
                        ) : null}
                    </>
                ),
                meta: (
                    <>
                        {item.funder ? <span className="font-medium text-muted">{item.funder}</span> : null}
                        {item.founder ? <span>{item.founder}</span> : null}
                        <span>Tartib: {item.order}</span>
                    </>
                ),
            })}
            renderForm={(item) => <FundedForm item={item} />}
        />
    );
}

function FundedForm({ item }: { item: PanelFundedStartup | null }) {
    return (
        <div className="grid gap-4 md:grid-cols-2">
            <Field label="Startap nomi">
                <input name="name" required maxLength={200} defaultValue={item?.name ?? ""} className={INPUT} />
            </Field>
            <Field label="Yo'nalish (ixtiyoriy)">
                <input name="sphere" maxLength={100} defaultValue={item?.sphere ?? ""} placeholder="AgroTech" className={INPUT} />
            </Field>
            <Field label="Olgan mablag'i">
                <input
                    type="number"
                    name="amount"
                    min={0}
                    step={1}
                    defaultValue={item?.amount ?? ""}
                    placeholder="500000000"
                    className={INPUT}
                />
            </Field>
            <Field label="Valyuta">
                <select name="currency" defaultValue={item?.currency ?? "UZS"} className={INPUT}>
                    <option value="UZS">so&apos;m</option>
                    <option value="USD">AQSH dollari ($)</option>
                </select>
            </Field>
            <Field label="Mablag' bergan tashkilot">
                <input name="funder" maxLength={200} defaultValue={item?.funder ?? ""} placeholder="IT Park, grant…" className={INPUT} />
            </Field>
            <Field label="Yili">
                <input type="number" name="year" min={2000} max={2100} defaultValue={item?.year ?? ""} className={INPUT} />
            </Field>
            <Field label="Asoschi (ixtiyoriy)">
                <input name="founder" maxLength={200} defaultValue={item?.founder ?? ""} className={INPUT} />
            </Field>
            <Field label="Tartib (kichigi oldinda)">
                <input type="number" name="order" min={0} defaultValue={item?.order ?? 0} className={INPUT} />
            </Field>
            <Field label="Startap haqida (bosilganda ko'rinadi)" className="md:col-span-2">
                <textarea name="about" rows={4} defaultValue={item?.about ?? ""} className={INPUT} />
            </Field>
            <Field label="Rasm" className="md:col-span-2">
                <ImageField name="image_file" removeName="remove_image" current={item?.image ?? null} />
            </Field>
            <div className="md:col-span-2">
                <Toggle name="is_published" label="Saytda ko'rinsin" defaultChecked={item?.is_published ?? true} />
            </div>
        </div>
    );
}
