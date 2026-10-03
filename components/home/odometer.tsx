import type { CSSProperties } from "react";

import { formatNumber } from "@/lib/format";

type Vars = CSSProperties & Record<`--${string}`, string | number>;

const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

/**
 * «Odometr» raqam: har bir raqam 0–9 ustuni bo'lib, kerakli qiymatgacha
 * aylanib keladi (`.od-col` + `--n`). Serverda chiziladi; aylanish CSS'da —
 * ota element `data-active` olganda boshlanadi, aks holda raqam shunchaki turadi.
 */
export function Odometer({ value }: { value: number }) {
    let column = 0;

    return Array.from(formatNumber(value)).map((char, index) =>
        /\d/.test(char) ? (
            <span key={index} className="od" style={{ "--n": char, "--k": column++ } as Vars}>
                <span className="od-col">
                    {DIGITS.map((digit) => (
                        <span key={digit}>{digit}</span>
                    ))}
                </span>
            </span>
        ) : (
            <span key={index}>{char}</span>
        ),
    );
}
