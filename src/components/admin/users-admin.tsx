"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useServerSeed } from "@/hooks/useServerSeed";
import { UserFormDialog } from "@/components/admin/user-form-dialog";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { ChoiceGroup, controlClass } from "@/components/shop/filter-controls";
import { useAuth } from "@/hooks/useAuth";
import { errorText } from "@/lib/apiError";
import { deleteUser, listUsers, setUserBlocked } from "@/lib/users";
import { toast } from "@/lib/toast";
import type { ManagedUser, Pagination, UserListStatus } from "@/types/user";

const limit = 12;

function roleLabel(role: ManagedUser["role"]) {
  return role === "admin" ? "Admin" : "Customer";
}

export function UsersAdmin({
  initialUsers = [],
  initialPagination = null,
  initialError = "",
}: {
  initialUsers?: ManagedUser[];
  initialPagination?: Pagination | null;
  initialError?: string;
}) {
  const { session } = useAuth();
  const { confirm, dialog } = useConfirm();
  const seeded = initialPagination !== null && !initialError;
  const consumeSeed = useServerSeed(seeded);
  const [users, setUsers] = useState<ManagedUser[]>(seeded ? initialUsers : []);
  const [pagination, setPagination] = useState<Pagination | null>(seeded ? initialPagination : null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [status, setStatus] = useState<UserListStatus>("all");
  const [editing, setEditing] = useState<ManagedUser | null>(null);
  const [open, setOpen] = useState(false);
  const [listError, setListError] = useState("");
  const [loading, setLoading] = useState(!seeded);
  const [version, setVersion] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    if (consumeSeed()) return;
    let active = true;
    setLoading(true);
    listUsers({
      page,
      limit,
      search: appliedSearch || undefined,
      status: status === "all" ? undefined : status,
    })
      .then((result) => {
        if (!active) return;
        setUsers(result.users);
        setPagination(result.pagination);
        setListError("");
        if (result.pagination.totalPages > 0 && page > result.pagination.totalPages) {
          setPage(result.pagination.totalPages);
        }
      })
      .catch((caught) => {
        if (!active) return;
        setUsers([]);
        setPagination(null);
        setListError(errorText(caught, "Users could not be loaded."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [page, appliedSearch, status, version]);

  useEffect(() => {
    const next = search.trim();
    if (next === appliedSearch) return;
    const handle = window.setTimeout(() => {
      setPage(1);
      setAppliedSearch(next);
    }, 350);
    return () => window.clearTimeout(handle);
  }, [search, appliedSearch]);

  function openCreate() {
    setEditing(null);
    setOpen(true);
  }

  function clearFilters() {
    setStatus("all");
    setPage(1);
  }

  function onSaved(created: boolean) {
    setOpen(false);
    if (created) setPage(1);
    setVersion((current) => current + 1);
  }

  async function onStatus(user: ManagedUser) {
    const nextBlocked = !user.isBlocked;
    const ok = await confirm({
      title: nextBlocked ? "Block this user?" : "Unblock this user?",
      message: nextBlocked
        ? `${user.name} will not be able to sign in.`
        : `${user.name} will be able to sign in again.`,
      confirmLabel: nextBlocked ? "Block" : "Unblock",
      tone: nextBlocked ? "danger" : "default",
    });
    if (!ok) return;
    try {
      const result = await setUserBlocked(user.id, nextBlocked);
      toast(result.message ?? (result.user.isBlocked ? "User blocked" : "User unblocked"));
      if (users.length === 1 && page > 1 && status !== "all") setPage(page - 1);
      setVersion((current) => current + 1);
    } catch (caught) {
      toast(errorText(caught, "The status could not be changed."));
    }
  }

  async function onDelete(user: ManagedUser) {
    const ok = await confirm({
      title: "Delete this user?",
      message: `${user.name} will be removed. This cannot be undone.`,
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!ok) return;
    try {
      const result = await deleteUser(user.id);
      if (editing?.id === user.id) setOpen(false);
      toast(result.message);
      if (users.length === 1 && page > 1) setPage(page - 1);
      setVersion((current) => current + 1);
    } catch (caught) {
      toast(errorText(caught, "The user could not be deleted."));
    }
  }

  const totalPages = pagination?.totalPages ?? 0;
  const activeFilters = status === "all" ? 0 : 1;
  const selfId = session?.user.id;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setFiltersOpen((current) => !current)}
          aria-expanded={filtersOpen}
          className={`inline-flex h-12 shrink-0 cursor-pointer items-center gap-2 rounded-full border px-5 text-sm transition ${
            filtersOpen ? "border-wine bg-blush text-wine" : "border-ink/15 bg-paper text-ink hover:border-wine"
          }`}
        >
          <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 6h16M7 12h10M10 18h4" />
          </svg>
          Filters
          {activeFilters > 0 ? (
            <span className="grid size-5 place-items-center rounded-full bg-wine text-[11px] text-white">{activeFilters}</span>
          ) : null}
        </button>
        <label className="relative min-w-[12rem] flex-1">
          <svg
            viewBox="0 0 24 24"
            className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-wine"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <circle cx="11" cy="11" r="6.5" />
            <path d="M16 16.5 20 20.5" />
          </svg>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, email, or mobile"
            maxLength={100}
            aria-label="Search users"
            className={`${controlClass} pl-11`}
          />
        </label>
        {pagination ? <p className="hidden shrink-0 text-sm text-ink/55 sm:block">{pagination.total} users</p> : null}
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex h-12 shrink-0 cursor-pointer items-center rounded-full bg-wine px-5 text-sm text-white transition hover:bg-wine-deep"
        >
          Add user
        </button>
      </div>

      {filtersOpen ? (
        <form className="mt-6 rounded-[1.75rem] border border-ink/10 bg-paper p-4 sm:p-5" onSubmit={(event) => event.preventDefault()}>
          <div className="max-w-md">
            <ChoiceGroup
              label="Account"
              value={status}
              onChange={(value) => {
                setStatus(value);
                setPage(1);
              }}
              options={[
                { value: "all", label: "All" },
                { value: "active", label: "Active" },
                { value: "blocked", label: "Blocked" },
              ]}
            />
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={clearFilters}
              disabled={activeFilters === 0}
              className="h-12 cursor-pointer rounded-full border border-ink/15 px-5 text-sm disabled:cursor-not-allowed disabled:opacity-40"
            >
              Clear filters
            </button>
          </div>
        </form>
      ) : null}

      {listError ? <p className="mt-4 rounded-2xl bg-blush px-4 py-3 text-sm text-wine">{listError}</p> : null}
      {loading ? <p className="mt-6 text-sm text-ink/60">Loading users…</p> : null}
      {!loading && !listError && users.length === 0 ? (
        <div className="mt-6 rounded-[1.75rem] border border-dashed border-ink/15 bg-paper px-6 py-12 text-center">
          <p className="text-base leading-7 text-ink/70">No users in this view.</p>
          <button type="button" onClick={openCreate} className="mt-5 cursor-pointer text-sm text-wine">
            Add the first one
          </button>
        </div>
      ) : null}

      <ul className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {users.map((user) => {
          const self = user.id === selfId;
          return (
            <li key={user.id} className="flex min-w-0 gap-3 rounded-2xl border border-ink/10 bg-paper p-2.5">
              <Link
                href={`/admin/customers/${user.id}`}
                className="grid size-16 shrink-0 place-items-center rounded-xl bg-blush font-display text-2xl text-wine"
                aria-label={`Open ${user.name}`}
              >
                {user.name.slice(0, 1).toUpperCase()}
              </Link>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link
                      href={`/admin/customers/${user.id}`}
                      className="block truncate font-display text-lg leading-tight tracking-tight hover:text-wine"
                    >
                      {user.name}
                    </Link>
                    <p className="mt-0.5 truncate text-xs text-ink/55">{user.email}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] ${
                      user.isBlocked ? "bg-blush text-wine" : "bg-mint text-leaf"
                    }`}
                  >
                    {user.isBlocked ? "Blocked" : "Active"}
                  </span>
                </div>
                <p className="mt-1.5 truncate text-xs text-ink/70">
                  {user.mobile} · {roleLabel(user.role)}
                  {self ? " · Signed in" : ""}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Link
                    href={`/admin/customers/${user.id}`}
                    className="cursor-pointer rounded-full border border-ink/15 px-2.5 py-1 text-xs hover:border-wine hover:text-wine"
                  >
                    Details
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(user);
                      setOpen(true);
                    }}
                    className="cursor-pointer rounded-full border border-ink/15 px-2.5 py-1 text-xs hover:border-wine hover:text-wine"
                  >
                    Edit
                  </button>
                  {self ? null : (
                    <>
                      <button
                        type="button"
                        onClick={() => onStatus(user)}
                        className="cursor-pointer rounded-full border border-ink/15 px-2.5 py-1 text-xs hover:border-wine hover:text-wine"
                      >
                        {user.isBlocked ? "Unblock" : "Block"}
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(user)}
                        className="cursor-pointer rounded-full px-2.5 py-1 text-xs text-wine"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {totalPages > 1 ? (
        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((current) => current - 1)}
            className="h-11 cursor-pointer rounded-full border border-ink/15 bg-paper px-4 text-sm disabled:cursor-not-allowed disabled:opacity-40"
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
            className="h-11 cursor-pointer rounded-full border border-ink/15 bg-paper px-4 text-sm disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      ) : null}

      {open ? <UserFormDialog user={editing} onClose={() => setOpen(false)} onSaved={onSaved} /> : null}
      {dialog}
    </div>
  );
}
