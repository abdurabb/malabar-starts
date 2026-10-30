import type { Metadata } from "next";
import { CouponsAdmin } from "@/components/admin/coupons-admin";

export const instant = false;

export const metadata: Metadata = {
  title: "Coupons",
};

export default function AdminCouponsPage() {
  return <CouponsAdmin />;
}
