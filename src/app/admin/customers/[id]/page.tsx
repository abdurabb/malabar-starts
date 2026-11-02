import { Suspense } from "react";
import type { Metadata } from "next";
import { UserAdminDetail } from "@/components/admin/user-admin-detail";
import { ApiError, errorText } from "@/lib/apiError";
import { getUser } from "@/lib/users";
import type { ManagedUser } from "@/types/user";

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
  let user: ManagedUser | null = null;
  let error = "";
  try {
    user = await getUser(id);
  } catch (caught) {
    error = caught instanceof ApiError && caught.status === 404 ? "User not found" : errorText(caught, "This user could not be opened.");
  }
  return <UserAdminDetail id={id} initialUser={user} initialError={error} />;
}
