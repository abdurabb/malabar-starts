"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { ScreenStatus } from "@/components/auth/screen-status";
import { useAuth } from "@/hooks/useAuth";

export function AuthGuard({ children }: { children: ReactNode }) {
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
  }, [status, pathname, router]);

  if (!ready || status !== "authenticated" || !session) {
    return <ScreenStatus label="Checking the desk…" />;
  }

  return children;
}
