import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind sinflarini xavfsiz birlashtiradi (keyingisi oldingisini bosadi). */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
