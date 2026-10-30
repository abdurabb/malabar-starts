"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { FormError } from "@/components/auth/fields";
import { ChoiceGroup } from "@/components/shop/filter-controls";
import { errorText } from "@/lib/apiError";
import { createCoupon, setCouponStatus, updateCoupon } from "@/lib/coupons";
import { toast } from "@/lib/toast";
import type { Coupon, CouponType, CouponUpdate } from "@/types/coupon";

const inputClass =
  "mt-2 w-full rounded-2xl border border-ink/10 bg-ivory px-4 py-3 text-sm text-ink outline-none transition placeholder:text-ink/35 focus:border-wine";

const codePattern = /^[A-Z0-9-]{4,20}$/;

type FormState = {
  code: string;
  couponType: CouponType;
  value: string;
  description: string;
  usageLimitPerUser: string;
  isActive: boolean;
  startsAt: string;
  expiresAt: string;
};

const emptyForm: FormState = {
  code: "",
  couponType: "price",
  value: "",
  description: "",
  usageLimitPerUser: "1",
  isActive: true,
  startsAt: "",
  expiresAt: "",
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function toLocalInput(iso: string | null) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toIso(value: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function toForm(coupon: Coupon): FormState {
  return {
    code: coupon.code,
    couponType: coupon.couponType,
    value: String(coupon.value),
    description: coupon.description ?? "",
    usageLimitPerUser: String(coupon.usageLimitPerUser),
    isActive: coupon.isActive,
    startsAt: toLocalInput(coupon.startsAt),
    expiresAt: toLocalInput(coupon.expiresAt),
  };
}

function buildPatch(form: FormState, coupon: Coupon, code: string, value: number, description: string, usageLimitPerUser: number, startsAt: string | null, expiresAt: string | null) {
  const patch: CouponUpdate = {};
  if (code !== coupon.code) patch.code = code;
  if (form.couponType !== coupon.couponType) patch.couponType = form.couponType;
  if (value !== coupon.value) patch.value = value;
  if (description !== (coupon.description ?? "")) patch.description = description || null;
  if (usageLimitPerUser !== coupon.usageLimitPerUser) patch.usageLimitPerUser = usageLimitPerUser;
  if (form.startsAt !== toLocalInput(coupon.startsAt)) patch.startsAt = startsAt;
  if (form.expiresAt !== toLocalInput(coupon.expiresAt)) patch.expiresAt = expiresAt;
  return patch;
}

function validateForm(form: FormState, editing: boolean) {
  const code = form.code.trim().toUpperCase();
  if (editing && !code) return "Code is required";
  if (code && !codePattern.test(code)) return "Code must be 4 to 20 letters, numbers, or hyphens";

  const value = Number(form.value);
  if (!form.value.trim() || !Number.isFinite(value)) return "Value is required";
  if (value <= 0) return "Value must be greater than 0";
  if (form.couponType === "percentage" && value > 100) return "Percent off cannot exceed 100";
  if (form.couponType === "price" && value > 1_000_000) return "Amount off cannot exceed 1,000,000";

  if (form.description.trim().length > 500) return "Description cannot exceed 500 characters";

  const usage = Number(form.usageLimitPerUser);
  if (!Number.isInteger(usage) || usage < 1 || usage > 1000) {
    return "Uses per customer must be a whole number from 1 to 1000";
  }

  const starts = form.startsAt ? new Date(form.startsAt) : null;
  const ends = form.expiresAt ? new Date(form.expiresAt) : null;
  if (starts && Number.isNaN(starts.getTime())) return "Start date is not valid";
  if (ends && Number.isNaN(ends.getTime())) return "End date is not valid";
  if (starts && ends && ends.getTime() <= starts.getTime()) return "End must be after the start";
  return "";
}

export function CouponFormDialog({
  coupon,
  onClose,
  onSaved,
}: {
  coupon: Coupon | null;
  onClose: () => void;
  onSaved: (created: boolean) => void;
}) {
  const [form, setForm] = useState<FormState>(() => (coupon ? toForm(coupon) : emptyForm));
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !pending) onCloseRef.current();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [pending]);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function close() {
    if (pending) return;
    onClose();
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = validateForm(form, Boolean(coupon));
    if (message) {
      setError(message);
      return;
    }

    const code = form.code.trim().toUpperCase();
    const value = Number(form.value);
    const description = form.description.trim();
    const usageLimitPerUser = Number(form.usageLimitPerUser);
    const startsAt = toIso(form.startsAt);
    const expiresAt = toIso(form.expiresAt);

    const patch = coupon ? buildPatch(form, coupon, code, value, description, usageLimitPerUser, startsAt, expiresAt) : null;
    const statusChanged = Boolean(coupon && form.isActive !== coupon.isActive);
    if (patch && Object.keys(patch).length === 0 && !statusChanged) {
      setError("Nothing to update");
      return;
    }

    setPending(true);
    setError("");
    try {
      if (coupon && patch) {
        if (Object.keys(patch).length > 0) {
          const result = await updateCoupon(coupon.id, patch);
          toast(result.message ?? "Coupon updated");
        }
        if (statusChanged) {
          const result = await setCouponStatus(coupon.id, form.isActive);
          toast(result.message ?? (form.isActive ? "Coupon activated" : "Coupon deactivated"));
        }
        onSaved(false);
      } else {
        const result = await createCoupon({
          couponType: form.couponType,
          value,
          ...(code ? { code } : {}),
          ...(description ? { description } : {}),
          usageLimitPerUser,
          isActive: form.isActive,
          ...(startsAt ? { startsAt } : {}),
          ...(expiresAt ? { expiresAt } : {}),
        });
        toast(result.message ?? "Coupon created");
        onSaved(true);
      }
    } catch (caught) {
      setError(errorText(caught, "The coupon could not be saved."));
    } finally {
      setPending(false);
    }
  }

  const amountLabel = form.couponType === "percentage" ? "Percent off" : "Amount off (AED)";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-6">
      <button type="button" aria-label="Close coupon form" className="absolute inset-0 cursor-pointer bg-ink/40" onClick={close} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="coupon-form-title"
        className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[1.75rem] bg-paper p-5 shadow-2xl sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-wine">{coupon ? "Update" : "New offer"}</p>
            <h2 id="coupon-form-title" className="mt-1 font-display text-4xl tracking-tight">
              {coupon ? coupon.code : "Add a coupon"}
            </h2>
          </div>
          <button
            type="button"
            onClick={close}
            className="inline-flex size-11 cursor-pointer items-center justify-center rounded-full border border-ink/15"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <form onSubmit={onSubmit} className="mt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <ChoiceGroup
                label="Offer"
                value={form.couponType}
                onChange={(value) => setField("couponType", value)}
                options={[
                  { value: "price", label: "Fixed amount" },
                  { value: "percentage", label: "Percent" },
                ]}
              />
            </div>
            <label className="block text-sm text-ink/70">
              {amountLabel}
              <input
                value={form.value}
                onChange={(event) => setField("value", event.target.value)}
                inputMode="decimal"
                autoFocus
                className={inputClass}
              />
            </label>
            <label className="block text-sm text-ink/70">
              Code
              <input
                value={form.code}
                onChange={(event) => setField("code", event.target.value.toUpperCase())}
                maxLength={20}
                placeholder={coupon ? "" : "Leave blank to generate"}
                className={`${inputClass} uppercase`}
              />
            </label>
            <label className="block text-sm text-ink/70">
              Uses per customer
              <input
                value={form.usageLimitPerUser}
                onChange={(event) => setField("usageLimitPerUser", event.target.value)}
                inputMode="numeric"
                className={inputClass}
              />
            </label>
            <div className="flex items-end">
              <button
                type="button"
                role="switch"
                aria-checked={form.isActive}
                onClick={() => setField("isActive", !form.isActive)}
                className="flex h-12 w-full cursor-pointer items-center justify-between rounded-full bg-[#f3e6d4] px-4 text-sm"
              >
                <span>{form.isActive ? "Offer is active" : "Saved as inactive"}</span>
                <span className={`relative h-6 w-11 rounded-full ${form.isActive ? "bg-wine" : "bg-ink/20"}`}>
                  <span className={`absolute top-0.5 size-5 rounded-full bg-white transition ${form.isActive ? "left-5" : "left-0.5"}`} />
                </span>
              </button>
            </div>
            <label className="block text-sm text-ink/70 sm:col-span-2">
              Description
              <textarea
                value={form.description}
                onChange={(event) => setField("description", event.target.value)}
                maxLength={500}
                rows={3}
                className={inputClass}
              />
            </label>
            <label className="block text-sm text-ink/70">
              Starts
              <input
                type="datetime-local"
                value={form.startsAt}
                onChange={(event) => setField("startsAt", event.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block text-sm text-ink/70">
              Ends
              <input
                type="datetime-local"
                value={form.expiresAt}
                onChange={(event) => setField("expiresAt", event.target.value)}
                className={inputClass}
              />
            </label>
          </div>
          <div className="mt-4">
            <FormError message={error} />
          </div>
          <div className="mt-5 flex flex-wrap justify-end gap-3">
            <button type="button" onClick={close} className="h-12 cursor-pointer rounded-full border border-ink/15 px-5 text-sm">
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="h-12 cursor-pointer rounded-full bg-wine px-5 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? "Saving…" : coupon ? "Update coupon" : "Save coupon"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
