import type { Metadata } from "next";
import { SavedAddresses } from "@/components/shop/saved-addresses";
import { PageFrame } from "@/components/shop/page-frame";

export const instant = false;

export const metadata: Metadata = {
  title: "Addresses",
};

export default function AddressesPage() {
  return (
    <PageFrame eyebrow="Account" title="Addresses">
      <SavedAddresses />
    </PageFrame>
  );
}
