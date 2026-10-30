import type { Metadata } from "next";
import { VerifyOtpForm } from "@/components/auth/verify-otp-form";

export const instant = false;

export const metadata: Metadata = {
  title: "Verify code",
};

export default function VerifyOtpPage() {
  return <VerifyOtpForm />;
}
