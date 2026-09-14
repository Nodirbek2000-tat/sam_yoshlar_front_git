/**
 * Sahifa tayyorlanguncha darhol chiqadigan skelet.
 *
 * Menyu bosilishi bilan ekran javob beradi — sekin internetda ham
 * «bosdim, hech narsa bo'lmadi» degan tuyg'u qolmaydi.
 */
export default function Loading() {
    return (
        <div className="container-page py-12 md:py-16" aria-busy="true" aria-label="Yuklanmoqda">
            <div className="h-3.5 w-28 animate-pulse rounded-full bg-surface" />
            <div className="mt-5 h-10 w-full max-w-xl animate-pulse rounded-xl bg-surface" />
            <div className="mt-3 h-4 w-full max-w-md animate-pulse rounded-full bg-surface" />

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }, (_, index) => (
                    <div
                        key={index}
                        className="h-44 animate-pulse rounded-2xl border border-line bg-surface"
                        style={{ animationDelay: `${index * 90}ms` }}
                    />
                ))}
            </div>
        </div>
    );
}
