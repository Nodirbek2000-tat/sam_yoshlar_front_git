import type { Metadata } from "next";

import { OffersBoard } from "@/components/offers/offers-board";
import { meFetch } from "@/lib/me";
import type { MyOffers } from "@/lib/types";

export const metadata: Metadata = { title: "Investitsiya takliflari" };

export default async function MyOffersPage() {
    const data = await meFetch<MyOffers>("/offers/", "/kabinet/investitsiya");

    return <OffersBoard data={data} />;
}
