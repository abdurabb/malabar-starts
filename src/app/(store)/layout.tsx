import type { ReactNode } from "react";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
