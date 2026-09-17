/**
 * Google uchun ma'lumot belgisi.
 *
 * Sahifa nima haqidaligini qidiruv tizimiga aniq aytadi: yangilik sanasi,
 * tadbir joyi va vaqti, tashkilot aloqasi. Shu tufayli natijalarda
 * kengaytirilgan ko'rinish (sana, rasm, manzil) chiqadi.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
    return (
        <script
            type="application/ld+json"
            // Ma'lumot o'zimizniki — JSON.stringify HTML belgilarini xavfsiz qoldiradi
            dangerouslySetInnerHTML={{
                __html: JSON.stringify(data).replace(/</g, "\\u003c"),
            }}
        />
    );
}
