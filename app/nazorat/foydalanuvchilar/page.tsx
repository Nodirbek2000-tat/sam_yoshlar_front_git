import { UsersManager, type PanelUser } from "@/components/panel/users-manager";
import { getReference } from "@/lib/api";
import { panelFetch } from "@/lib/panel";

type UsersPage = {
    count: number;
    page: number;
    pages: number;
    results: PanelUser[];
};

export default async function PanelUsersPage({
    searchParams,
}: PageProps<"/nazorat/foydalanuvchilar">) {
    const params = await searchParams;
    const role = typeof params.rol === "string" ? params.rol : undefined;
    const page = typeof params.sahifa === "string" ? params.sahifa : "1";

    const query = new URLSearchParams({ page });
    if (role) query.set("rol", role);

    const [data, reference] = await Promise.all([
        panelFetch<UsersPage>(`/users/?${query.toString()}`),
        getReference(),
    ]);

    return (
        <UsersManager
            users={data.results}
            roles={reference.all_roles}
            page={data.page}
            pages={data.pages}
            role={role}
        />
    );
}
