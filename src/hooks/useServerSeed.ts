"use client";

import { useCallback, useEffect, useRef } from "react";

export function useServerSeed(seeded: boolean) {
  const skip = useRef(seeded);

  useEffect(() => {
    if (!seeded) return;
    const handle = window.setTimeout(() => {
      skip.current = false;
    }, 0);
    return () => window.clearTimeout(handle);
  }, [seeded]);

  return useCallback(() => skip.current, []);
}
