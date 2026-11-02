"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useServerSeed } from "@/hooks/useServerSeed";
import { createPortal } from "react-dom";
import { FormError } from "@/components/auth/fields";
import { AddressFields } from "@/components/shop/address-fields";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { useAuth } from "@/hooks/useAuth";
import {
  addressError,
  addressToForm,
  createAddress,
  deleteAddress,
  emptyAddressForm,
  formatAddressLines,
  listAddresses,
  toAddressCreate,
  toAddressUpdate,
  updateAddress,
} from "@/lib/addresses";
import { errorText } from "@/lib/apiError";
import { toast } from "@/lib/toast";
import { statusLabel } from "@/types/status";
import type { Address, AddressFormState } from "@/types/address";
import type { Pagination } from "@/types/product";

const limit = 8;

function deleteHint(total: number) {
  if (total < 2) return "Add another address and make it the default before deleting this one.";
  return "Make another address the default before deleting this one.";
}

export function SavedAddresses({
  initialAddresses = [],
  initialPagination = null,
  initialError = "",
}: {
  initialAddresses?: Address[];
  initialPagination?: Pagination | null;
  initialError?: string;
}) {
  const { session } = useAuth();
  const { confirm, dialog } = useConfirm();
  const seeded = initialPagination !== null && !initialError;
  const consumeSeed = useServerSeed(seeded);
  const [addresses, setAddresses] = useState<Address[]>(seeded ? initialAddresses : []);
  const [pagination, setPagination] = useState<Pagination | null>(seeded ? initialPagination : null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(!seeded);
  const [error, setError] = useState("");
  const [version, setVersion] = useState(0);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [form, setForm] = useState<AddressFormState>(emptyAddressForm);
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (consumeSeed()) return;
    let active = true;
    setLoading(true);
    listAddresses({ page, limit, sort: "newest" })
      .then((result) => {
        if (!active) return;
        setAddresses(result.addresses);
        setPagination(result.pagination);
        setError("");
        if (result.pagination.totalPages > 0 && page > result.pagination.totalPages) {
          setPage(result.pagination.totalPages);
        }
      })
      .catch((caught) => {
        if (!active) return;
        setAddresses([]);
        setPagination(null);
        setError(errorText(caught, "Saved addresses could not be loaded."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [page, version]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !pending) setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, pending]);

  const ordered = [...addresses].sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
  const totalPages = pagination?.totalPages ?? 0;
  const addressTotal = pagination?.total ?? addresses.length;
  const lockDefault = Boolean(editing?.isDefault) || (!editing && addresses.length === 0);

  function openCreate() {
    setEditing(null);
    setForm({
      ...emptyAddressForm,
      fullName: session?.user.name ?? "",
      mobile: session?.user.mobile ?? "",
      isDefault: addresses.length === 0,
    });
    setFormError("");
    setOpen(true);
  }

  function openEdit(address: Address) {
    setEditing(address);
    setForm(addressToForm(address));
    setFormError("");
    setOpen(true);
  }

  function close() {
    if (pending) return;
    setOpen(false);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const next = { ...form, isDefault: lockDefault || form.isDefault };
    const issue = addressError(next);
    if (issue) {
      setFormError(issue);
      return;
    }
    setPending(true);
    setFormError("");
    try {
      const result = editing
        ? await updateAddress(editing.id, toAddressUpdate(next))
        : await createAddress(toAddressCreate(next));
      toast(result.message ?? (editing ? "Address updated" : "Address created"));
      setOpen(false);
      if (!editing) setPage(1);
      setVersion((current) => current + 1);
    } catch (caught) {
      setFormError(errorText(caught, editing ? "The address could not be updated." : "The address could not be saved."));
    } finally {
      setPending(false);
    }
  }

  async function onMakeDefault(address: Address) {
    if (address.isDefault) return;
    try {
      const result = await updateAddress(address.id, { isDefault: true });
      toast(result.message ?? "Default address updated");
      setVersion((current) => current + 1);
    } catch (caught) {
      toast(errorText(caught, "The default address could not be changed."));
    }
  }

  async function onDelete(address: Address) {
    if (address.isDefault) {
      toast(deleteHint(addressTotal));
      return;
    }
    const ok = await confirm({
      title: "Delete this address?",
      message: `${address.fullName}, ${address.city}. The default address stays in place.`,
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!ok) return;
    try {
      const result = await deleteAddress(address.id);
      toast(result.message);
      if (editing?.id === address.id) setOpen(false);
      if (addresses.length === 1 && page > 1) setPage(page - 1);
      setVersion((current) => current + 1);
    } catch (caught) {
      toast(errorText(caught, "The address could not be deleted."));
    }
  }

  const formDialog =
    open && mounted
      ? createPortal(
          <div className="fixed inset-0 z-[80] flex items-end justify-center p-3 sm:items-center sm:p-6">
            <button type="button" aria-label="Close address form" className="absolute inset-0 bg-ink/40" onClick={close} />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="address-form-title"
              className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[1.75rem] bg-paper p-5 shadow-2xl sm:p-7"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-wine">{editing ? "Update" : "New address"}</p>
                  <h2 id="address-form-title" className="page-title mt-1">
                    {editing ? "Edit address" : "Add an address"}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={close}
                  className="inline-flex size-11 items-center justify-center rounded-full border border-ink/15"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
              <form onSubmit={onSubmit} className="mt-6">
                <AddressFields
                  value={{ ...form, isDefault: lockDefault || form.isDefault }}
                  onChange={(next) => {
                    setForm(next);
                    setFormError("");
                  }}
                  autoFocus
                />
                <label className="mt-4 flex items-start gap-3 rounded-2xl border border-ink/10 bg-ivory px-4 py-3">
                  <input
                    type="checkbox"
                    checked={lockDefault || form.isDefault}
                    disabled={lockDefault}
                    onChange={(event) => setForm((current) => ({ ...current, isDefault: event.target.checked }))}
                    className="mt-1 size-4 accent-wine disabled:opacity-60"
                  />
                  <span>
                    <span className="block text-sm">Default address</span>
                    <span className="mt-0.5 block text-xs leading-5 text-ink/55">
                      {lockDefault
                        ? editing
                          ? "Choose another address as the default before changing this one."
                          : "The first saved address becomes the default."
                        : "Only one address is the default. Saving this clears the previous one."}
                    </span>
                  </span>
                </label>
                <div className="mt-4">
                  <FormError message={formError} />
                </div>
                <div className="mt-5 flex justify-end gap-3">
                  <button type="button" onClick={close} disabled={pending} className="h-12 rounded-full border border-ink/15 px-5 text-sm">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={pending}
                    className="h-12 rounded-full bg-wine px-5 text-sm text-white hover:bg-wine-deep disabled:opacity-40"
                  >
                    {pending ? "Saving…" : editing ? "Save address" : "Add address"}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <section id="addresses" className="rounded-[1.5rem] border border-ink/10 bg-paper p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-end gap-3">
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex h-12 items-center rounded-full bg-wine px-5 text-sm text-white hover:bg-wine-deep"
        >
          Add address
        </button>
      </div>
      {error ? <p className="mt-4 rounded-2xl bg-blush px-4 py-3 text-sm text-wine">{error}</p> : null}
      {loading && addresses.length === 0 ? <p className="mt-4 text-sm text-ink/60">Loading addresses…</p> : null}
      {!loading && !error && addresses.length === 0 ? (
        <p className="mt-5 text-sm text-ink/60">No saved addresses yet. Add one here, or enter a one-time address at checkout.</p>
      ) : null}
      {ordered.length > 0 ? (
        <ul className="mt-5 grid gap-3">
          {ordered.map((address) => (
            <li key={address.id} className="rounded-[1.25rem] border border-ink/10 px-4 py-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-blush px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-wine">
                  {statusLabel(address.type)}
                </span>
                {address.label ? <span className="text-sm text-ink/70">{address.label}</span> : null}
                {address.isDefault ? (
                  <span className="rounded-full bg-wheat px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-ink/70">
                    Default
                  </span>
                ) : null}
              </div>
              <p className="mt-3 text-base font-medium leading-snug">{address.fullName}</p>
              <div className="mt-2 text-sm leading-6 text-ink/70">
                {formatAddressLines(address).map((line, index) => (
                  <p key={`${address.id}-${index}`}>{line}</p>
                ))}
                <p>{address.mobile}</p>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                <button type="button" onClick={() => openEdit(address)} className="text-wine">
                  Edit
                </button>
                {address.isDefault ? null : (
                  <button type="button" onClick={() => onMakeDefault(address)} className="text-ink/70 hover:text-wine">
                    Make default
                  </button>
                )}
                {address.isDefault ? (
                  <p className="text-ink/50">{deleteHint(addressTotal)}</p>
                ) : (
                  <button type="button" onClick={() => onDelete(address)} className="text-wine">
                    Delete
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : null}
      {totalPages > 1 ? (
        <div className="mt-5 flex items-center justify-between gap-4">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((current) => current - 1)}
            className="rounded-full border border-ink/15 px-4 py-2 text-sm disabled:opacity-40"
          >
            Previous
          </button>
          <p className="text-sm text-ink/60">
            Page {pagination?.page} of {totalPages}
          </p>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((current) => current + 1)}
            className="rounded-full border border-ink/15 px-4 py-2 text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      ) : null}
      {formDialog}
      {dialog}
    </section>
  );
}
