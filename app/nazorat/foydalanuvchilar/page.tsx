import {
    UsersManager,
    type DistrictCount,
    type PanelUser,
} from "@/components/panel/users-manager";
import { getReference } from "@/lib/api";
import { panelFetch } from "@/lib/panel";

type UsersPage = {
    count: number;
    pending_profiles: number;
    page: number;
    pages: number;
    districts?: DistrictCount[];
    without_district?: number;
    results: PanelUser[];
};

export default async function PanelUsersPage({
    searchParams,
}: PageProps<"/nazorat/foydalanuvchilar">) {
    const params = await searchParams;
    const role = typeof params.rol === "string" ? params.rol : undefined;
    const review = params.tekshiruv === "1";
    const page = typeof params.sahifa === "string" ? params.sahifa : "1";
    const district = typeof params.tuman === "string" ? params.tuman : undefined;

    const query = new URLSearchParams({ page });
    if (role) query.set("rol", role);
    if (review) query.set("tekshiruv", "1");
    if (district) query.set("tuman", district);

    const [data, reference] = await Promise.all([
        panelFetch<UsersPage>(`/users/?${query.toString()}`),
        getReference(),
    ]);

    return (
        <UsersManager
            users={data.results}
            // Tashkilotlar «Korxonalar» bo'limida — foydalanuvchi sifatida sanalmaydi
            roles={reference.all_roles.filter((item) => item.value !== "organization")}
            page={data.page}
            pages={data.pages}
            role={role}
            review={review}
            district={district}
            districts={data.districts ?? []}
            withoutDistrict={data.without_district ?? 0}
            pendingProfiles={data.pending_profiles}
        />
    );
}
