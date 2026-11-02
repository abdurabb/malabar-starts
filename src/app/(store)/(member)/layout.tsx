import type { Metadata } from "next";
import type { ReactNode } from "react";
import { RoleGuard } from "@/guards/RoleGuard";
import { privateRobots } from "@/lib/site";

export const instant = false;

export const metadata: Metadata = {
  robots: privateRobots,
};

export default function MemberLayout({ children }: { children: ReactNode }) {
  return <RoleGuard allow="user">{children}</RoleGuard>;
}
