"use client";

import { useState, type ReactNode } from "react";

import { Icon } from "@/components/icon";
import { cn } from "@/lib/cn";

const EXTENSIONS: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
    "image/svg+xml": "svg",
    "image/gif": "gif",
};

/** Fayl nomiga yaramaydigan belgilarsiz: «BERT AGRO» -> «BERT AGRO». */
function fileName(name: string) {
    return name.replace(/[\\/:*?"<>|]+/g, "").replace(/\s+/g, " ").trim() || "logo";
}

/**
 * Logotip — bosilsa asl fayl kompaniya nomi bilan yuklab olinadi
 * (yangi oynada ochilmaydi). Yuklab bo'lmasa — rasm yangi oynada ochiladi.
 */
export function LogoDownload({
    src,
    name,
    className,
    children,
}: {
    src: string;
    name: string;
    className?: string;
    children: ReactNode;
}) {
    const [busy, setBusy] = useState(false);

    async function download() {
        if (busy) return;
        setBusy(true);
        try {
            const response = await fetch(src);
            if (!response.ok) throw new Error(String(response.status));
            const blob = await response.blob();
            const extension =
                EXTENSIONS[blob.type] ??
                src.split("?")[0].match(/\.([a-z0-9]{2,5})$/i)?.[1]?.toLowerCase() ??
                "png";

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${fileName(name)}.${extension}`;
            document.body.append(link);
            link.click();
            link.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch {
            window.open(src, "_blank", "noopener,noreferrer");
        } finally {
            setBusy(false);
        }
    }

    return (
        <button
            type="button"
            onClick={download}
            title="Logotipni yuklab olish"
            aria-label={`${name} logotipini yuklab olish`}
            className={cn("group relative cursor-pointer", className)}
        >
            {children}
            {/* Bosilsa yuklanishini bildiruvchi belgi — sichqoncha ustiga kelganda kattalashadi */}
            <span
                aria-hidden
                className={cn(
                    "absolute bottom-1.5 right-1.5 grid size-7 place-items-center rounded-full bg-invert text-on-invert shadow-md transition-transform duration-200 group-hover:scale-110",
                    busy && "animate-pulse",
                )}
            >
                <Icon name="download" size={13} />
            </span>
        </button>
    );
}
