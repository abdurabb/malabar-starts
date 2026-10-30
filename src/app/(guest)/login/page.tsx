import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { ScreenStatus } from "@/components/auth/screen-status";
import type { Metadata } from "next";

export const instant = false;

export const metadata: Metadata = {
  title: "Login",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<ScreenStatus label="Opening login…" />}>
      <LoginForm />
    </Suspense>
  );
}
