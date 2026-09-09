import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CategoryTile } from "@/components/category-tile";
import { Icon } from "@/components/icon";
import { Reveal } from "@/components/motion-primitives";
import { SolutionBoard } from "@/components/problems/solution-board";
import { ApiError, apiFetch, getProblem } from "@/lib/api";
import { getAccessToken, getCurrentUser } from "@/lib/session";
import { toneClass } from "@/lib/tone";
import type { Problem } from "@/lib/types";

/** Token bilan olamiz — `liked` bayrog'i shunda to'g'ri keladi. */
async function loadProblem(id: string) {
    const token = await getAccessToken();
    return apiFetch<Problem>(`/problems/${id}/`, { token, revalidate: 0 });
}

export async function generateMetadata({
    params,
}: PageProps<"/tashabbuslar/muammolar/[id]">): Promise<Metadata> {
    try {
        const problem = await getProblem((await params).id);
        return {
            title: `${problem.organization.name} — muammo`,
            description: problem.description.slice(0, 150),
        };
    } catch {
        return { title: "Muammo" };
    }
}

export default async function ProblemPage({
    params,
}: PageProps<"/tashabbuslar/muammolar/[id]">) {
    const { id } = await params;

    let problem: Problem;
    try {
        problem = await loadProblem(id);
    } catch (error) {
        if (error instanceof ApiError) notFound();
        throw error;
    }

    const user = await getCurrentUser();
    const solutions = problem.solutions ?? [];

    return (
        <article className={toneClass(problem.icon)}>
            <header className="relative overflow-hidden border-b border-line">
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.15]"
                    style={{
                        background:
                            "radial-gradient(44rem 22rem at 20% -25%, var(--tone), transparent 65%)",
                    }}
                />

                <div className="container-page relative py-9 md:py-11">
                    <Link
                        href="/tashabbuslar/muammolar"
                        className="group inline-flex items-center gap-1.5 text-[13px] text-muted transition-colors hover:text-text"
                    >
                        <Icon
                            name="arrowLeft"
                            size={14}
                            className="transition-transform duration-200 group-hover:-translate-x-0.5"
                        />
                        Tashkilotlar
                    </Link>

                    <Reveal className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-start">
                        <CategoryTile slug={problem.icon} size="xl" />

                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-tone-soft px-3 py-1 text-[11.5px] font-medium text-tone-text">
                                    {problem.category_display}
                                </span>
                                <span className="rounded-full border border-line px-3 py-1 text-[11.5px] text-muted">
                                    {problem.organization.name}
                                </span>
                                <span className="text-[12.5px] text-faint">{problem.age_label}</span>
                            </div>

                            <h1 className="mt-4 max-w-2xl text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
                                {problem.question}
                            </h1>

                            <p className="mt-4 max-w-2xl text-[15.5px] leading-relaxed text-muted">
                                {problem.description}
                            </p>
                        </div>
                    </Reveal>
                </div>
            </header>

            <div className="container-page py-10 md:py-12">
                <SolutionBoard
                    problemId={problem.id}
                    initial={solutions}
                    canSubmit={Boolean(user)}
                />

                <dl className="mt-10 grid max-w-xl gap-3 sm:grid-cols-3">
                    <Row label="Tashkilot" value={problem.organization.name} />
                    <Row label="Soha" value={problem.organization.sphere_display} />
                    {problem.organization.region_display && (
                        <Row label="Hudud" value={problem.organization.region_display} />
                    )}
                </dl>
            </div>
        </article>
    );
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border border-line px-4 py-3">
            <dt className="text-[11.5px] text-faint">{label}</dt>
            <dd className="mt-0.5 text-[14px]">{value}</dd>
        </div>
    );
}
