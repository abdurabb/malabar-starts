"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { restoreSession } from "@/lib/auth";
import { onSessionCleared, syncTokenCookie } from "@/lib/authSession";
import { clearSession, hydrateSession } from "@/redux/slices/authSlice";
import { useAppDispatch } from "@/redux/hooks";

export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    let active = true;
    const synced = syncTokenCookie();
    restoreSession()
      .then((session) => {
        if (!active) return;
        dispatch(hydrateSession(session));
        if (synced && session) router.refresh();
      })
      .catch(() => {
        if (active) dispatch(hydrateSession(null));
      });
    return () => {
      active = false;
    };
  }, [dispatch, router]);

  useEffect(() => {
    return onSessionCleared(() => {
      dispatch(clearSession());
    });
  }, [dispatch]);

  return children;
}
