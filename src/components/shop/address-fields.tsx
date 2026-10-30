"use client";

import { ChoiceGroup } from "@/components/shop/filter-controls";
import { ADDRESS_TYPES } from "@/types/address";
import type { AddressFormState, AddressType } from "@/types/address";
import { statusLabel } from "@/types/status";

const inputClass =
  "mt-2 w-full rounded-2xl border border-ink/10 bg-ivory px-4 py-3 text-sm text-ink outline-none transition placeholder:text-ink/35 focus:border-wine";

export function AddressFields({
  value,
  onChange,
  autoFocus = false,
}: {
  value: AddressFormState;
  onChange: (next: AddressFormState) => void;
  autoFocus?: boolean;
}) {
  function set<K extends keyof AddressFormState>(key: K, next: AddressFormState[K]) {
    onChange({ ...value, [key]: next });
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="block text-sm text-ink/70 sm:col-span-2">
        Label
        <input
          value={value.label}
          onChange={(event) => set("label", event.target.value)}
          placeholder="Home, office, Mum’s kitchen"
          maxLength={40}
          autoComplete="off"
          className={inputClass}
        />
      </label>
      <div className="sm:col-span-2">
        <ChoiceGroup<AddressType>
          label="Type"
          value={value.type}
          onChange={(next) => set("type", next)}
          options={ADDRESS_TYPES.map((type) => ({ value: type, label: statusLabel(type) }))}
        />
      </div>
      <label className="block text-sm text-ink/70">
        Full name
        <input
          value={value.fullName}
          onChange={(event) => set("fullName", event.target.value)}
          autoComplete="name"
          maxLength={100}
          autoFocus={autoFocus}
          className={inputClass}
        />
      </label>
      <label className="block text-sm text-ink/70">
        Mobile
        <input
          value={value.mobile}
          onChange={(event) => set("mobile", event.target.value)}
          autoComplete="tel"
          inputMode="tel"
          maxLength={24}
          placeholder="+971501234567"
          className={inputClass}
        />
      </label>
      <label className="block text-sm text-ink/70 sm:col-span-2">
        Address line 1
        <input
          value={value.line1}
          onChange={(event) => set("line1", event.target.value)}
          autoComplete="address-line1"
          maxLength={200}
          placeholder="Street, building, apartment"
          className={inputClass}
        />
      </label>
      <label className="block text-sm text-ink/70">
        Address line 2
        <input
          value={value.line2}
          onChange={(event) => set("line2", event.target.value)}
          autoComplete="address-line2"
          maxLength={200}
          placeholder="Optional"
          className={inputClass}
        />
      </label>
      <label className="block text-sm text-ink/70">
        Landmark
        <input
          value={value.landmark}
          onChange={(event) => set("landmark", event.target.value)}
          maxLength={120}
          placeholder="Optional"
          className={inputClass}
        />
      </label>
      <label className="block text-sm text-ink/70">
        City
        <input
          value={value.city}
          onChange={(event) => set("city", event.target.value)}
          autoComplete="address-level2"
          maxLength={80}
          placeholder="Sharjah"
          className={inputClass}
        />
      </label>
      <label className="block text-sm text-ink/70">
        State
        <input
          value={value.state}
          onChange={(event) => set("state", event.target.value)}
          autoComplete="address-level1"
          maxLength={80}
          placeholder="Sharjah"
          className={inputClass}
        />
      </label>
      <label className="block text-sm text-ink/70">
        Country
        <input
          value={value.country}
          onChange={(event) => set("country", event.target.value)}
          autoComplete="country-name"
          maxLength={80}
          className={inputClass}
        />
      </label>
      <label className="block text-sm text-ink/70">
        Postal code
        <input
          value={value.postalCode}
          onChange={(event) => set("postalCode", event.target.value)}
          autoComplete="postal-code"
          maxLength={12}
          className={inputClass}
        />
      </label>
    </div>
  );
}
