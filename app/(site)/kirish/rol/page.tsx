import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { RolePicker } from "@/components/auth/role-picker";
import { getReference } from "@/lib/api";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = { title: "Rolni tanlang" };

export default async function RolePage() {
    const user = await getCurrentUser();
    if (!user) redirect("/kirish");

    const reference = await getReference();

    return (
        <RolePicker
            roles={reference.roles}
            regions={reference.regions}
            fullName={user.full_name}
            startupSpheres={reference.startup_spheres}
            startupStages={reference.startup_stages}
            businessSpheres={reference.business_spheres}
        />
    );
}
