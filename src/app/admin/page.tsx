import type { Metadata } from "next";
import { DashboardView } from "@/components/admin/dashboard-view";

export const instant = false;

export const metadata: Metadata = {
  title: "Admin",
};

export default function AdminHomePage() {
  return <DashboardView />;
}
