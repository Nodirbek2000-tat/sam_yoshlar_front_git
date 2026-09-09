import type { Metadata } from "next";
import Link from "next/link";

import { CategoryTile } from "@/components/category-tile";
import { Icon } from "@/components/icon";
import { Reveal, Stagger, StaggerItem } from "@/components/motion-primitives";
import { apiFetch } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { getAccessToken } from "@/lib/session";
import { toneClass } from "@/lib/tone";
import type { Problem } from "@/lib/types";

export const metadata: Metadata = { title: "Muammolarim" };

type MyProblems = {
    is_organization: boolean;
    count: number;
    results: Problem[];
};

export default async function MyProblemsPage() {
    const token = await getAccessToken();
    const data = await apiFetch<MyProblems>("/me/problems/", { token, revalidate: 0 }).catch(
        () => null,
    );

    const problems = data?.results ?? [];
    const solutions = problems.reduce((sum, item) => sum + (item.solutions?.length ?? 0), 0);

    if (!data?.is_organization) {
        return (
            <Reveal>
                <Header count={0} solutions={0} />
                <div className="tone-violet mt-6 rounded-2xl border border-tone-line bg-tone-soft p-7 text-center">
                    <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-page">
                        <Icon name="building" size={22} className="text-tone-text" />
                    </span>
                    <h2 className="mt-4 text-[16px] font-semibold">
                        Bu bo&apos;lim tashkilotlar uchun
                    </h2>
                    <p className="mt-2 text-[13.5px] leading-relaxed text-muted">
                        Muammoni tashkilotning o&apos;zi yozadi. Siz esa boshqalarning
                        muammosiga yechim taklif qila olasiz.
                    </p>
                    <Link
                        href="/tashabbuslar/muammolar"
                        className="mt-5 inline-flex items-center gap-2 rounded-full bg-invert px-5 py-2.5 text-[13.5px] font-medium text-on-invert"
                    >
                        Muammolarni ko&apos;rish
                        <Icon name="arrowRight" size={14} />
                    </Link>
                </div>
            </Reveal>
        );
    }

    return (
        <>
            <Reveal>
                <Header count={problems.length} solutions={solutions} />
            </Reveal>

            {problems.length ? (
                <Stagger className="mt-7 space-y-4">
                    {problems.map((problem) => (
                        <StaggerItem key={problem.id}>
                            <ProblemBlock problem={problem} />
                        </StaggerItem>
                    ))}
                </Stagger>
            ) : (
                <div className="mt-7 rounded-2xl border border-dashed border-line py-16 text-center">
                    <p className="text-[14px] text-muted">Hali muammo yozmagansiz.</p>
                    <Link
                        href="/tashabbuslar/muammolar/yozish"
                        className="mt-4 inline-flex items-center gap-2 rounded-full bg-invert px-5 py-2.5 text-[13.5px] font-medium text-on-invert"
                    >
                        <Icon name="plus" size={14} />
                        Birinchi muammoni yozish
                    </Link>
                </div>
            )}
        </>
    );
}

function Header({ count, solutions }: { count: number; solutions: number }) {
    return (
        <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Muammolarim</h1>
                <p className="mt-1.5 text-[14px] text-muted">
                    {count > 0
                        ? `${count} ta muammo, ${solutions} ta taklif keldi.`
                        : "Yozgan muammolaringiz va ularga kelgan takliflar."}
                </p>
            </div>

            <Link
                href="/tashabbuslar/muammolar/yozish"
                className="inline-flex items-center gap-2 rounded-full bg-invert px-4 py-2 text-[13.5px] font-medium text-on-invert transition-opacity hover:opacity-90"
            >
                <Icon name="plus" size={14} />
                Muammo yozish
            </Link>
        </div>
    );
}

function ProblemBlock({ problem }: { problem: Problem }) {
    const solutions = problem.solutions ?? [];

    return (
        <article
            className={`${toneClass(problem.icon)} overflow-hidden rounded-2xl border border-line bg-raised`}
        >
            <div className="flex items-start gap-4 border-b border-tone-line bg-tone-soft p-5">
                <CategoryTile slug={problem.icon} size="md" className="border-tone-line bg-page" />

                <div className="min-w-0 flex-1">
                    <span className="text-[11.5px] font-medium uppercase tracking-[0.08em] text-tone-text">
                        {problem.category_display}
                    </span>
                    <h2 className="mt-1 text-[15.5px] font-semibold leading-snug">
                        {problem.question}
                    </h2>
                    <p className="mt-2 line-clamp-2 text-[13.5px] leading-relaxed text-muted">
                        {problem.description}
                    </p>
                </div>

                <Link
                    href={`/tashabbuslar/muammolar/${problem.id}`}
                    title="Sahifada ochish"
                    className="grid size-9 shrink-0 place-items-center rounded-lg border border-tone-line text-tone-text transition-colors hover:bg-page"
                >
                    <Icon name="arrowRight" size={15} />
                </Link>
            </div>

            <div className="p-5">
                <h3 className="text-[12px] font-medium uppercase tracking-[0.1em] text-faint">
                    Kelgan takliflar
                    <span className="ml-2 text-tone-text">{solutions.length}</span>
                </h3>

                {solutions.length ? (
                    <ul className="mt-4 space-y-3">
                        {solutions.map((solution, index) => (
                            <li
                                key={solution.id}
                                className="flex items-start gap-3.5 rounded-xl border border-line p-4"
                            >
                                {index === 0 && solution.like_count > 0 && (
                                    <span className="tone-amber grid size-8 shrink-0 place-items-center rounded-lg bg-tone-soft">
                                        <Icon name="trophy" size={15} className="text-tone-text" />
                                    </span>
                                )}

                                <div className="min-w-0 flex-1">
                                    <p className="text-[14.5px] font-medium">{solution.title}</p>
                                    <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-[12px] text-faint">
                                        <span>{solution.author_name}</span>
                                        <span>{formatDate(solution.created_at)}</span>
                                    </p>
                                    <p className="mt-2 text-[13.5px] leading-relaxed text-muted">
                                        {solution.description}
                                    </p>
                                    {solution.technologies && (
                                        <p className="mt-2 text-[12.5px] text-faint">
                                            Texnologiya: {solution.technologies}
                                        </p>
                                    )}
                                </div>

                                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-[12.5px] text-muted">
                                    <Icon name="heart" size={13} />
                                    <span className="font-semibold tabular-nums">
                                        {solution.like_count}
                                    </span>
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="mt-4 rounded-xl border border-dashed border-line py-8 text-center text-[13.5px] text-muted">
                        Hali taklif kelmadi. Yoshlar ko&apos;rgach yozishadi.
                    </p>
                )}
            </div>
        </article>
    );
}
