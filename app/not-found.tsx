import Link from "next/link";

import { Icon } from "@/components/icon";

export default function NotFound() {
    return (
        <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
            <span className="grid size-16 place-items-center rounded-2xl bg-ink-100 text-ink-400">
                <Icon name="search" size={28} strokeWidth={1.5} />
            </span>

            <h1 className="mt-7 text-5xl font-bold tracking-tight">404</h1>
            <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-ink-500">
                Bunday sahifa topilmadi. Havola eskirgan yoki manzil xato yozilgan bo&apos;lishi mumkin.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 rounded-full bg-ink-950 px-6 py-3 text-[14.5px] font-semibold text-white transition-colors hover:bg-ink-800"
                >
                    <Icon name="home" size={16} />
                    Bosh sahifa
                </Link>
                <Link
                    href="/tashabbuslar"
                    className="inline-flex items-center gap-2 rounded-full border border-ink-300 px-6 py-3 text-[14.5px] font-semibold text-ink-700 transition-colors hover:bg-ink-100"
                >
                    <Icon name="spark" size={16} />
                    Tashabbuslar
                </Link>
            </div>
        </div>
    );
}
