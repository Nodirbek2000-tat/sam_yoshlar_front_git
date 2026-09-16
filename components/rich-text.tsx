import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Oddiy belgilar bilan yozilgan matnni chiroyli chiqaradi.
 *
 *     # Katta sarlavha          ## Kichik sarlavha
 *     **qalin**                 *qiya*
 *     [matn](https://havola)    - ro'yxat qatori
 *     >> o'ngga tekislangan     --- ajratuvchi chiziq
 *
 * HTML qabul qilinmaydi — matn faqat shu belgilar bo'yicha o'qiladi,
 * shuning uchun tashqaridan kelgan skript sahifaga tusha olmaydi.
 * Havolalar faqat `http`/`https` bo'lsa chiziladi.
 */
export function RichText({ text, className }: { text: string; className?: string }) {
    const blocks: ReactNode[] = [];
    const lines = (text ?? "").replace(/\r\n/g, "\n").split("\n");

    let bullets: string[] = [];
    let paragraph: string[] = [];

    const flushBullets = () => {
        if (!bullets.length) return;
        const items = bullets;
        bullets = [];
        blocks.push(
            <ul key={`ul-${blocks.length}`} className="my-4 space-y-2 pl-1">
                {items.map((item, index) => (
                    <li key={index} className="flex gap-2.5">
                        <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                        <span>{inline(item)}</span>
                    </li>
                ))}
            </ul>,
        );
    };

    const flushParagraph = () => {
        if (!paragraph.length) return;
        const text = paragraph.join(" ");
        paragraph = [];
        blocks.push(
            <p key={`p-${blocks.length}`} className="my-4">
                {inline(text)}
            </p>,
        );
    };

    const flush = () => {
        flushBullets();
        flushParagraph();
    };

    for (const raw of lines) {
        const line = raw.trim();

        if (!line) {
            flush();
            continue;
        }

        if (line.startsWith("## ")) {
            flush();
            blocks.push(
                <h3
                    key={`h3-${blocks.length}`}
                    className="mb-3 mt-8 text-[19px] font-semibold tracking-tight text-text first:mt-0"
                >
                    {inline(line.slice(3))}
                </h3>,
            );
            continue;
        }

        if (line.startsWith("# ")) {
            flush();
            blocks.push(
                <h2
                    key={`h2-${blocks.length}`}
                    className="mb-4 mt-9 text-2xl font-semibold tracking-tight text-text first:mt-0 sm:text-[26px]"
                >
                    {inline(line.slice(2))}
                </h2>,
            );
            continue;
        }

        if (line.startsWith(">>")) {
            flush();
            blocks.push(
                <p key={`r-${blocks.length}`} className="my-4 text-right">
                    {inline(line.slice(2).trim())}
                </p>,
            );
            continue;
        }

        if (/^-{3,}$/.test(line)) {
            flush();
            blocks.push(<hr key={`hr-${blocks.length}`} className="my-7 border-line" />);
            continue;
        }

        if (line.startsWith("- ") || line.startsWith("• ")) {
            flushParagraph();
            bullets.push(line.slice(2));
            continue;
        }

        flushBullets();
        paragraph.push(line);
    }

    flush();

    return <div className={className}>{blocks}</div>;
}

/** Qator ichidagi belgilar: qalin, qiya va havola. */
function inline(text: string): ReactNode[] {
    const parts: ReactNode[] = [];
    const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)\s]+\))/g;
    let last = 0;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(text)) !== null) {
        if (match.index > last) parts.push(text.slice(last, match.index));
        const chunk = match[0];
        const key = `${match.index}`;

        if (chunk.startsWith("**")) {
            parts.push(
                <strong key={key} className="font-semibold text-text">
                    {chunk.slice(2, -2)}
                </strong>,
            );
        } else if (chunk.startsWith("*")) {
            parts.push(
                <em key={key} className="italic">
                    {chunk.slice(1, -1)}
                </em>,
            );
        } else {
            const split = chunk.indexOf("](");
            const label = chunk.slice(1, split);
            const href = chunk.slice(split + 2, -1);
            parts.push(<SafeLink key={key} href={href} label={label} />);
        }

        last = match.index + chunk.length;
    }

    if (last < text.length) parts.push(text.slice(last));
    return parts;
}

function SafeLink({ href, label }: { href: string; label: string }) {
    const external = /^https?:\/\//i.test(href);
    const internal = href.startsWith("/");

    // Tashqaridan kelgan `javascript:` kabi havolalar oddiy matn bo'lib qoladi
    if (!external && !internal) return <>{label}</>;

    const className =
        "font-medium text-accent-text underline decoration-accent/40 underline-offset-2 transition-colors hover:decoration-accent";

    if (internal) {
        return (
            <Link href={href as "/"} className={className}>
                {label}
            </Link>
        );
    }

    return (
        <a href={href} target="_blank" rel="noreferrer noopener" className={className}>
            {label}
        </a>
    );
}
