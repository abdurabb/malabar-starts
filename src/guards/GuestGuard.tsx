"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { ScreenStatus } from "@/components/auth/screen-status";
import { destinationFor } from "@/lib/navigation";
import { useAuth } from "@/hooks/useAuth";

export function GuestGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status, session } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    if (status === "authenticated" && session) {
      router.replace(destinationFor(session, searchParams.get("next")));
    }
  }, [status, session, router, searchParams]);

  if (!ready || status !== "anonymous") {
    return <ScreenStatus label="Checking the desk…" />;
  }

  return children;
}
