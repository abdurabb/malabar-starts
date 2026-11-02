import type { Metadata } from "next";
import type { ReactNode } from "react";
import { privateRobots } from "@/lib/site";

export const metadata: Metadata = {
  robots: privateRobots,
};

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return <div className="flex flex-1 flex-col">{children}</div>;
}
