import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { privateRobots } from "@/lib/site";

export const instant = false;

export const metadata: Metadata = {
  robots: privateRobots,
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
