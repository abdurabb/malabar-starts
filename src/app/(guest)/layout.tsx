import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { ScreenStatus } from "@/components/auth/screen-status";
import { GuestGuard } from "@/guards/GuestGuard";
import { privateRobots } from "@/lib/site";

export const instant = false;

export const metadata: Metadata = {
  robots: privateRobots,
};

export default function GuestLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <Suspense fallback={<ScreenStatus label="Checking the desk…" />}>
        <GuestGuard>{children}</GuestGuard>
      </Suspense>
    </div>
  );
}
