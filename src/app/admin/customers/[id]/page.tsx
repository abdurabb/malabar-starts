import { Suspense } from "react";
import type { Metadata } from "next";
import { UserAdminDetail } from "@/components/admin/user-admin-detail";

export const instant = false;

export const metadata: Metadata = {
  title: "User",
};

export default function AdminCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="text-sm text-ink/60">Opening this user…</p>}>
      <AdminCustomerRoute params={params} />
    </Suspense>
  );
}

async function AdminCustomerRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <UserAdminDetail id={id} />;
}
