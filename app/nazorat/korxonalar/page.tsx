import { OrganizationsManager, type Organization } from "@/components/panel/organizations";
import { getReference } from "@/lib/api";
import { panelFetch } from "@/lib/panel";

export default async function PanelOrganizationsPage() {
    const [data, reference] = await Promise.all([
        panelFetch<{ count: number; results: Organization[] }>("/organizations/"),
        getReference(),
    ]);

    return (
        <OrganizationsManager
            organizations={data.results}
            regions={reference.regions}
            spheres={reference.organization_spheres}
        />
    );
}
