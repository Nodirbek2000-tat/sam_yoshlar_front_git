import { AppealForm } from "@/components/cabinet/appeal-form";
import { EmptyState, PageHead, RowList, StatusBadge } from "@/components/cabinet/ui";
import { formatShortDate } from "@/lib/format";
import { getReference } from "@/lib/api";
import { meFetch } from "@/lib/me";

type Appeal = {
    id: number;
    subject: string;
    category: string;
    category_display: string;
    message: string;
    status: string;
    status_display: string;
    response: string;
    responded_at: string | null;
    created_at: string;
};

export default async function MyAppealsPage() {
    const data = await meFetch<{ count: number; results: Appeal[] }>(
        "/appeals/",
        "/kabinet/murojaatlarim",
    );

    // Kategoriyalar backenddan keladi — ikki joyda takrorlanmasin va farq qilmasin
    const reference = await getReference();

    return (
        <>
            <PageHead
                title="Murojaatlarim"
                subtitle={
                    data.count
                        ? `${data.count} ta murojaat yuborgansiz`
                        : "Savolingiz bo'lsa murojaat yozing — javob shu yerda chiqadi"
                }
            />

            <AppealForm categories={reference.appeal_categories} />

            <div className="mt-10">
                {data.results.length ? (
                    <RowList>
                        {data.results.map((appeal) => (
                            <div key={appeal.id} className="py-5">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <h3 className="text-[14.5px] font-medium">
                                            {appeal.subject}
                                        </h3>
                                        <p className="mt-1 flex flex-wrap items-center gap-x-3 text-[12px] text-faint">
                                            <span>{appeal.category_display}</span>
                                            <span>{formatShortDate(appeal.created_at)}</span>
                                        </p>
                                    </div>
                                    <StatusBadge
                                        status={appeal.status}
                                        label={appeal.status_display}
                                    />
                                </div>

                                <p className="mt-3 text-[13.5px] leading-relaxed text-muted">
                                    {appeal.message}
                                </p>

                                {appeal.response && (
                                    <div className="mt-4 rounded-lg border-l-2 border-accent bg-surface px-4 py-3">
                                        <p className="text-[11.5px] font-medium uppercase tracking-[0.08em] text-faint">
                                            Javob
                                        </p>
                                        <p className="mt-1.5 text-[13.5px] leading-relaxed">
                                            {appeal.response}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </RowList>
                ) : (
                    <EmptyState
                        icon="mail"
                        title="Murojaat yo'q"
                        text="Savol, taklif yoki shikoyatingizni yozing — javob shu sahifada chiqadi."
                    />
                )}
            </div>
        </>
    );
}
