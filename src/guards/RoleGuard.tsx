"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { ScreenStatus } from "@/components/auth/screen-status";
import { routes } from "@/lib/navigation";
import { useAuth } from "@/hooks/useAuth";
import type { Role } from "@/types/auth";

export function RoleGuard({ allow, children }: { allow: Role; children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { status, session } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    if (status === "anonymous") {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
    if (status === "authenticated" && session && session.user.role !== allow) {
      router.replace(session.user.role === "admin" ? routes.admin : routes.home);
    }
  }, [status, session, allow, pathname, router]);

  if (!ready || status !== "authenticated" || !session || session.user.role !== allow) {
    return <ScreenStatus label="Checking the desk…" />;
  }

  return children;
}
