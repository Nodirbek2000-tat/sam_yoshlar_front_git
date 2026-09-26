import { redirect } from "next/navigation";

/**
 * «Murojaatlarim» bo'limi olib tashlandi — e'londagi «Murojaat qilish»
 * tugmasi endi tashkilotning o'z havolasiga olib boradi.
 * Eski havolalar (xatcho'p, bildirishnoma) kabinetga tushsin.
 */
export default function MyAppealsPage() {
    redirect("/kabinet");
}
