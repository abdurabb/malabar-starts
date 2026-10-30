import type { Metadata } from "next";
import { ProfileView } from "@/components/shop/profile-view";

export const instant = false;

export const metadata: Metadata = {
  title: "Profile",
};

export default function ProfilePage() {
  return <ProfileView />;
}
