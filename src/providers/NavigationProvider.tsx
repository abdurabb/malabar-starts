"use client";

import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";

export function NavigationProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return children;
}
