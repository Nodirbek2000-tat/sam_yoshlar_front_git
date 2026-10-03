import { Fragment, type CSSProperties } from "react";

type Vars = CSSProperties & Record<`--${string}`, string | number>;

/**
 * Matnni so'zlarga bo'ladi — `data-fx="heading"` (so'zma-so'z chiqish) va
 * `data-fx="fill"` (o'qilgan sari to'lish) uchun. Serverda bo'linadi, shuning
 * uchun brauzerga JS ketmaydi va sahifa jonlanganda hech narsa o'zgarmaydi.
 *
 * `mask`  — har bir so'z niqob ichida (pastdan ko'tariladi).
 * `chars` — so'z ichidagi harflar ham navbat bilan chiqadi (qisqa sarlavhalar uchun).
 */
export function Words({
    text,
    mask = true,
    chars = false,
}: {
    text: string;
    mask?: boolean;
    chars?: boolean;
}) {
    const words = text.trim().split(/\s+/);
    let letter = 0;

    return words.map((word, index) => {
        const inner = chars ? (
            <span className="fx-letters" style={{ "--w": index } as Vars}>
                {Array.from(word).map((char, at) => (
                    <span key={at} className="fx-char" style={{ "--c": letter++ } as Vars}>
                        {char}
                    </span>
                ))}
            </span>
        ) : (
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
