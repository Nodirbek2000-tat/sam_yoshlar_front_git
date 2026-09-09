"use client";

import { ThemeProvider as NextThemeProvider } from "next-themes";
import type { ReactNode } from "react";

/** Kunduzgi / kechki / tizim rejimi. Tanlov `localStorage` da qoladi. */
export function ThemeProvider({ children }: { children: ReactNode }) {
    return (
        <NextThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            {children}
        </NextThemeProvider>
    );
}
