import { Suspense } from "react";
import type { Metadata } from "next";
import { DashboardView } from "@/components/admin/dashboard-view";
import { getDashboard } from "@/lib/dashboard";
import { loadPage } from "@/lib/load";

export const instant = false;

export const metadata: Metadata = {
  title: "Admin",
};

export default function AdminHomePage() {
  return (
    <Suspense fallback={<p className="text-sm text-ink/60">Opening the desk…</p>}>
      <AdminHomeData />
    </Suspense>
  );
}

async function AdminHomeData() {
  const loaded = await loadPage(() => getDashboard("30d"), null, "The dashboard could not be loaded.");
  return <DashboardView initialData={loaded.data} initialError={loaded.error} />;
}
