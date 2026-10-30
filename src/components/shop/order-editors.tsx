"use client";

import { useEffect, useState } from "react";
import { FormError } from "@/components/auth/fields";
import { DeliveryPicker } from "@/components/shop/delivery-picker";
import { addressToForm, emptyAddressForm } from "@/lib/addresses";
import { errorText } from "@/lib/apiError";
import { deliveryInput, noteError } from "@/lib/orders";
import type { Address, AddressFormState } from "@/types/address";
import type { DeliveryMode, OrderUpdateInput, ShippingAddress } from "@/types/order";

export function NoteEditor({
  note,
  busy,
  onSave,
}: {
  note: string | null;
  busy: boolean;
  onSave: (note: string | null) => Promise<void>;
}) {
  const [value, setValue] = useState(note ?? "");
  const [error, setError] = useState("");
  const length = value.trim().length;

  useEffect(() => {
    setValue(note ?? "");
  }, [note]);

  async function save() {
    const issue = noteError(value);
    if (issue) {
      setError(issue);
      return;
    }
    const next = value.trim();
    const previous = note ?? "";
    if (next === previous) return;
    setError("");
    try {
      await onSave(next ? next : null);
    } catch (caught) {
      setError(errorText(caught, "The note could not be saved."));
    }
  }

  return (
    <div className="mt-6 rounded-[1.25rem] border border-ink/10 bg-paper p-4 sm:p-5">
      <label className="block text-sm text-ink/70">
        Note
        <textarea
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setError("");
          }}
          rows={3}
          maxLength={500}
          placeholder="Optional note for this order"
          className="mt-2 w-full rounded-2xl border border-ink/10 bg-ivory px-4 py-3 text-sm outline-none focus:border-wine"
        />
      </label>
      <div className="mt-2 flex items-center justify-between gap-3">
        <p className={`text-xs ${length > 0 && length < 2 ? "text-wine" : "text-ink/45"}`}>{length}/500</p>
        <button
          type="button"
          onClick={save}
          disabled={busy}
          className="rounded-full border border-ink/15 px-4 py-2 text-sm disabled:opacity-40"
        >
          Save note
        </button>
      </div>
      {error ? <p className="mt-2 text-sm text-wine">{error}</p> : null}
    </div>
  );
}

export function OrderDeliveryEditor({
  shipping,
  addresses,
  busy,
  manageHref,
  onSave,
}: {
  shipping: ShippingAddress;
  addresses: Address[];
  busy: boolean;
  manageHref?: string;
  onSave: (body: OrderUpdateInput) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<DeliveryMode>("saved");
  const [addressId, setAddressId] = useState("");
  const [draft, setDraft] = useState<AddressFormState>(emptyAddressForm);
  const [saveAddress, setSaveAddress] = useState(false);
  const [makeDefault, setMakeDefault] = useState(false);
  const [error, setError] = useState("");

  function openEditor() {
    const preferred =
      addresses.find((item) => item.id === shipping.addressId) ??
      addresses.find((item) => item.isDefault) ??
      addresses[0];
    setDraft(addressToForm(shipping));
    setAddressId(preferred?.id ?? "");
    setMode(shipping.source === "temporary" || addresses.length === 0 ? "temporary" : "saved");
    setSaveAddress(false);
    setMakeDefault(false);
    setError("");
    setOpen(true);
  }

  async function save() {
    const built = deliveryInput({
      mode: addresses.length === 0 ? "temporary" : mode,
      addressId,
      draft,
      saveAddress,
      makeDefault: saveAddress && (addresses.length === 0 || makeDefault),
    });
    if ("error" in built) {
      setError(built.error);
      return;
    }
    setError("");
    try {
      await onSave(built.body);
      setOpen(false);
    } catch (caught) {
      setError(errorText(caught, "The delivery address could not be updated."));
    }
  }

  if (!open) {
    return (
      <button type="button" onClick={openEditor} className="mt-4 text-sm text-wine">
        Change delivery address
      </button>
    );
  }

  return (
    <div className="mt-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="font-display text-2xl tracking-tight">Change delivery</h3>
        <button type="button" onClick={() => setOpen(false)} disabled={busy} className="text-sm text-ink/60">
          Close
        </button>
      </div>
      <DeliveryPicker
        addresses={addresses}
        mode={addresses.length === 0 ? "temporary" : mode}
        onModeChange={(next) => {
          setMode(next);
          setError("");
          if (next === "temporary") {
            setSaveAddress(false);
            setMakeDefault(false);
          }
        }}
        addressId={addressId}
        onAddressId={setAddressId}
        draft={draft}
        onDraft={(next) => {
          setDraft(next);
          setError("");
        }}
        saveAddress={saveAddress}
        onSaveAddress={setSaveAddress}
        makeDefault={makeDefault}
        onMakeDefault={setMakeDefault}
        manageHref={manageHref}
      />
      <FormError message={error} />
      <button
        type="button"
        onClick={save}
        disabled={busy}
        className="mt-4 inline-flex rounded-full bg-wine px-5 py-3 text-sm text-white hover:bg-wine-deep disabled:opacity-40"
      >
        {busy ? "Saving…" : "Save delivery address"}
      </button>
    </div>
  );
}
