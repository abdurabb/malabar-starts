"use client";

import { useEffect, type ReactNode } from "react";
import { restoreSession } from "@/lib/auth";
import { onSessionCleared } from "@/lib/authSession";
import { clearSession, hydrateSession } from "@/redux/slices/authSlice";
import { useAppDispatch } from "@/redux/hooks";

export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let active = true;
    restoreSession()
      .then((session) => {
        if (active) dispatch(hydrateSession(session));
      })
      .catch(() => {
        if (active) dispatch(hydrateSession(null));
      });
    return () => {
      active = false;
    };
  }, [dispatch]);

  useEffect(() => {
    return onSessionCleared(() => {
      dispatch(clearSession());
    });
  }, [dispatch]);

  return children;
}
