"use client";

import Link from "next/link";
import { AddressFields } from "@/components/shop/address-fields";
import { ChoiceGroup } from "@/components/shop/filter-controls";
import { formatAddressLines } from "@/lib/addresses";
import { statusLabel } from "@/types/status";
import type { Address, AddressFormState } from "@/types/address";
import type { DeliveryMode } from "@/types/order";

export function DeliveryPicker({
  addresses,
  mode,
  onModeChange,
  addressId,
  onAddressId,
  draft,
  onDraft,
  saveAddress,
  onSaveAddress,
  makeDefault,
  onMakeDefault,
  manageHref,
}: {
  addresses: Address[];
  mode: DeliveryMode;
  onModeChange: (mode: DeliveryMode) => void;
  addressId: string;
  onAddressId: (id: string) => void;
  draft: AddressFormState;
  onDraft: (next: AddressFormState) => void;
  saveAddress: boolean;
  onSaveAddress: (value: boolean) => void;
  makeDefault: boolean;
  onMakeDefault: (value: boolean) => void;
  manageHref?: string;
}) {
  const ordered = [...addresses].sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
  const showSaved = mode === "saved" && ordered.length > 0;

  return (
    <div>
      {ordered.length > 0 ? (
        <ChoiceGroup<DeliveryMode>
          label="Delivery"
          value={mode}
          onChange={onModeChange}
          options={[
            { value: "saved", label: "Saved" },
            { value: "temporary", label: "One-time" },
          ]}
        />
      ) : (
        <div className="rounded-[1.25rem] border border-dashed border-wine/30 bg-blush/50 px-4 py-3 text-sm leading-6 text-ink/70">
          No saved addresses yet. Enter where this order should go. You can keep it for next time, or use it once.
        </div>
      )}
      {ordered.length > 0 ? (
        <p className="mt-3 text-sm text-ink/55">
          {showSaved ? "Deliver to an address on your profile." : "Used for this order only, unless you save it."}
        </p>
      ) : null}

      {showSaved ? (
        <div className="mt-4">
          <div role="radiogroup" aria-label="Saved addresses" className="grid gap-3">
            {ordered.map((address) => {
              const selected = address.id === addressId;
              return (
                <button
                  key={address.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => onAddressId(address.id)}
                  className={`rounded-[1.25rem] border px-4 py-4 text-left transition ${
                    selected
                      ? "border-wine bg-paper shadow-[0_10px_30px_rgba(141,48,64,0.08)]"
                      : "border-ink/10 bg-paper hover:border-wine/40"
                  }`}
                >
                  <span className="flex items-start justify-between gap-3">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-blush px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-wine">
                        {statusLabel(address.type)}
                      </span>
                      {address.label ? <span className="text-sm text-ink/70">{address.label}</span> : null}
                      {address.isDefault ? (
                        <span className="rounded-full bg-wheat px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-ink/70">
                          Default
                        </span>
                      ) : null}
                    </span>
                    <span
                      className={`grid size-6 shrink-0 place-items-center rounded-full ${
                        selected ? "bg-wine text-white" : "border border-ink/15 bg-ivory"
                      }`}
                      aria-hidden="true"
                    >
                      {selected ? (
                        <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2.4">
                          <path d="M5 12.5 9.2 17 19 7" />
                        </svg>
                      ) : null}
                    </span>
                  </span>
                  <span className="mt-3 block text-base font-medium leading-snug">{address.fullName}</span>
                  {formatAddressLines(address).map((line, index) => (
                    <span key={`${address.id}-${index}`} className="mt-1 block text-sm text-ink/70">
                      {line}
                    </span>
                  ))}
                  <span className="mt-2 block text-sm text-ink/55">{address.mobile}</span>
                </button>
              );
            })}
          </div>
          {manageHref ? (
            <div className="mt-3 flex justify-end">
              <Link href={manageHref} className="text-sm text-wine">
                Manage addresses
              </Link>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="mt-4 rounded-[1.25rem] border border-ink/10 bg-paper p-4 sm:p-5">
          <AddressFields value={draft} onChange={onDraft} />
          <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl border border-ink/10 bg-ivory px-4 py-3">
            <input
              type="checkbox"
              checked={saveAddress}
              onChange={(event) => {
                onSaveAddress(event.target.checked);
                if (!event.target.checked) onMakeDefault(false);
              }}
              className="mt-1 size-4 accent-wine"
            />
            <span>
              <span className="block text-sm">Save this address</span>
              <span className="mt-0.5 block text-xs leading-5 text-ink/55">Keep it on your profile for the next order.</span>
            </span>
          </label>
          {saveAddress && addresses.length === 0 ? (
            <p className="mt-3 text-sm text-ink/60">This will be your default address.</p>
          ) : null}
          {saveAddress && addresses.length > 0 ? (
            <label className="mt-3 flex cursor-pointer items-start gap-3 rounded-2xl border border-ink/10 bg-ivory px-4 py-3">
              <input
                type="checkbox"
                checked={makeDefault}
                onChange={(event) => onMakeDefault(event.target.checked)}
                className="mt-1 size-4 accent-wine"
              />
              <span>
                <span className="block text-sm">Make this the default</span>
                <span className="mt-0.5 block text-xs leading-5 text-ink/55">The previous default will step aside.</span>
              </span>
            </label>
          ) : null}
        </div>
      )}
    </div>
  );
}
