import { Fragment, type CSSProperties } from "react";

type Vars = CSSProperties & Record<`--${string}`, string | number>;

/**
 * Matnni so'zlarga bo'ladi — `data-fx="heading"` (so'zma-so'z chiqish) va
 * `data-fx="fill"` (o'qilgan sari to'lish) uchun. Serverda bo'linadi, shuning
 * uchun brauzerga JS ketmaydi va sahifa jonlanganda hech narsa o'zgarmaydi.
 *
 * `mask` — har bir so'z niqob ichida (pastdan ko'tariladi).
 */
export function Words({ text, mask = true }: { text: string; mask?: boolean }) {
    const words = text.trim().split(/\s+/);

    return words.map((word, index) => {
        const inner = (
            <span className="fx-word" style={{ "--w": index } as Vars}>
                {word}
            </span>
        );

        return (
            <Fragment key={index}>
                {mask ? <span className="fx-mask">{inner}</span> : inner}
                {index < words.length - 1 && " "}
            </Fragment>
        );
    });
}
