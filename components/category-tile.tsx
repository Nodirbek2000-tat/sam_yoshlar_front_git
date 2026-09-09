import { CategoryIcon } from "@/components/category-icon";
import { ColorIcon, hasColorIcon } from "@/components/color-icon";
import { cn } from "@/lib/cn";
import { toneClass } from "@/lib/tone";

/**
 * Kategoriya ikonkasi uchun rangli plitka.
 *
 * Ikkita manba bor:
 *   1. To'liq rangli Higgsfield ikonkasi (bor bo'lsa) — o'z rangi bilan;
 *   2. Bir rangli chizma — kategoriya ohangida bo'yaladi.
 *
 * Ikkalasi ham bitta `.tone-*` sinfi ichida turadi, shuning uchun plitka
 * foni, chegarasi va ikonka rangi doim bir-biriga mos keladi.
 */

/** Backend kaliti -> rangli ikonka nomi. */
const COLOR_ALIAS: Record<string, string> = {
    money: "money",
    card: "money",
    chart: "board",
    clipboard: "board",
    bank: "bank",
    building: "bank",
    briefcase: "briefcase",
    package: "briefcase",
    cart: "briefcase",
    globe: "globe",
    trophy: "trophy",
    target: "trophy",
    star: "trophy",
};

const SIZES = {
    sm: { box: "size-9 rounded-lg", icon: 19 },
    md: { box: "size-11 rounded-xl", icon: 23 },
    lg: { box: "size-14 rounded-2xl", icon: 30 },
    xl: { box: "size-16 rounded-2xl", icon: 34 },
} as const;

export function CategoryTile({
    slug,
    size = "md",
    className,
}: {
    slug: string | undefined;
    size?: keyof typeof SIZES;
    className?: string;
}) {
    const key = (slug ?? "").replace(/^ic-/, "");
    const color = COLOR_ALIAS[key];
    const { box, icon } = SIZES[size];

    return (
        <span
            className={cn(
                toneClass(slug),
                box,
                "grid shrink-0 place-items-center border border-tone-line bg-tone-soft",
                className,
            )}
        >
            {color && hasColorIcon(color) ? (
                <ColorIcon name={color} size={icon} />
            ) : (
                <CategoryIcon slug={slug} size={icon} className="text-tone-text" />
            )}
        </span>
    );
}

/** Ikonka + matn: kartalardagi kichik yorliq. */
export function CategoryChip({
    slug,
    label,
    className,
}: {
    slug: string | undefined;
    label: string;
    className?: string;
}) {
    return (
        <span
            className={cn(
                toneClass(slug),
                "inline-flex items-center gap-1.5 rounded-full bg-tone-soft px-2.5 py-1 text-[11.5px] font-medium text-tone-text",
                className,
            )}
        >
            <CategoryIcon slug={slug} size={13} />
            {label}
        </span>
    );
}
