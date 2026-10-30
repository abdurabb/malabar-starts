import type { Metadata } from "next";
import { BrandsAdmin } from "@/components/admin/brands-admin";

export const instant = false;

export const metadata: Metadata = {
  title: "Brands",
};

export default function AdminBrandsPage() {
  return <BrandsAdmin />;
}
