"use client";

import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/providers/AuthProvider";
import { NavigationProvider } from "@/providers/NavigationProvider";
import { ReactQueryProvider } from "@/providers/ReactQueryProvider";
import { ReduxProvider } from "@/providers/ReduxProvider";
import { ShopProvider } from "@/providers/ShopProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ReduxProvider>
      <ReactQueryProvider>
        <AuthProvider>
          <ShopProvider>
            <NavigationProvider>
              {children}
              <Toaster />
            </NavigationProvider>
          </ShopProvider>
        </AuthProvider>
      </ReactQueryProvider>
    </ReduxProvider>
  );
}
