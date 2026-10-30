import type { ReactNode } from "react";
import { RoleGuard } from "@/guards/RoleGuard";

export const instant = false;

export default function MemberLayout({ children }: { children: ReactNode }) {
  return <RoleGuard allow="user">{children}</RoleGuard>;
}
