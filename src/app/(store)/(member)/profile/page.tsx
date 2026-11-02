import { Suspense } from "react";
import type { Metadata } from "next";
import { ScreenStatus } from "@/components/auth/screen-status";
import { ProfileView } from "@/components/shop/profile-view";
import { readCurrentUser } from "@/lib/currentUser";

export const instant = false;

export const metadata: Metadata = {
  title: "Profile",
};

export default function ProfilePage() {
  return (
    <Suspense fallback={<ScreenStatus label="Opening your profile…" />}>
      <ProfilePageData />
    </Suspense>
  );
}

async function ProfilePageData() {
  const user = await readCurrentUser();
  return <ProfileView user={user} />;
}
