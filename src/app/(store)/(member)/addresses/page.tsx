import { Suspense } from "react";
import type { Metadata } from "next";
import { SavedAddresses } from "@/components/shop/saved-addresses";
import { PageFrame } from "@/components/shop/page-frame";
import { listAddresses } from "@/lib/addresses";
import { loadPage } from "@/lib/load";

export const instant = false;

export const metadata: Metadata = {
  title: "Addresses",
};

export default function AddressesPage() {
  return (
    <PageFrame
      eyebrow="Account"
      title="Addresses"
      lede="One address is the default. Make another the default before you delete the current one."
    >
      <Suspense fallback={<p className="text-sm text-ink/60">Opening addresses…</p>}>
        <AddressesPageData />
      </Suspense>
    </PageFrame>
  );
}

async function AddressesPageData() {
  const loaded = await loadPage(
    () => listAddresses({ page: 1, limit: 8, sort: "newest" }),
    null,
    "Saved addresses could not be loaded.",
  );
  return (
    <SavedAddresses
      initialAddresses={loaded.data?.addresses ?? []}
      initialPagination={loaded.data?.pagination ?? null}
      initialError={loaded.error}
    />
  );
}
