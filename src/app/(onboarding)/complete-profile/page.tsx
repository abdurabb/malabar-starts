import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const instant = false;

export const metadata: Metadata = {
  title: "Finish profile",
};

export default function CompleteProfilePage() {
  redirect("/");
}
