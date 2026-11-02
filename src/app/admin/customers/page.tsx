import { Suspense } from "react";
import type { Metadata } from "next";
import { UsersAdmin } from "@/components/admin/users-admin";
import { loadPage } from "@/lib/load";
import { listUsers } from "@/lib/users";

export const instant = false;

export const metadata: Metadata = {
  title: "Users",
};

export default function AdminCustomersPage() {
  return (
    <Suspense fallback={<p className="text-sm text-ink/60">Opening users…</p>}>
      <AdminCustomersData />
    </Suspense>
  );
}

async function AdminCustomersData() {
  const loaded = await loadPage(() => listUsers({ page: 1, limit: 12 }), null, "Users could not be loaded.");
  return (
    <UsersAdmin
      initialUsers={loaded.data?.users ?? []}
      initialPagination={loaded.data?.pagination ?? null}
      initialError={loaded.error}
    />
  );
}
