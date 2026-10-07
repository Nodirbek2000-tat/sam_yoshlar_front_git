/**
 * Rasmni yuborishdan oldin brauzerning o'zida kichraytiradi.
 *
 * So'rovnomaga o'nlab nomzod rasmi bilan birga yuklanadi — telefondan olingan
 * 5 MB lik suratlar bitta so'rovda server chegarasidan (20 MB) oshib ketadi.
 * Uzun tomoni `max` px gacha tushiriladi; foyda bo'lmasa asl fayl qaytadi.
 */
export async function shrinkImage(file: File, max = 1200, quality = 0.85): Promise<File> {
    if (!/^image\/(jpeg|png|webp|heic|heif)$/.test(file.type)) return file;

    try {
        const bitmap = await createImageBitmap(file);
        const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
        if (scale === 1 && file.size < 400_000) {
            bitmap.close();
            return file;
        }

        const canvas = document.createElement("canvas");
        canvas.width = Math.round(bitmap.width * scale);
        canvas.height = Math.round(bitmap.height * scale);
        const context = canvas.getContext("2d");
        if (!context) return file;

        // Shaffof PNG qora bo'lib qolmasin
        context.fillStyle = "#fff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        bitmap.close();

        const blob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob(resolve, "image/jpeg", quality),
        );
        if (!blob || blob.size >= file.size) return file;

        return new File([blob], `${file.name.replace(/\.[^.]+$/, "") || "rasm"}.jpg`, {
            type: "image/jpeg",
        });
    } catch {
        return file;
    }
}
