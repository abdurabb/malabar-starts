"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useServerSeed } from "@/hooks/useServerSeed";
import { UserCart } from "@/components/admin/user-cart";
import { UserFormDialog } from "@/components/admin/user-form-dialog";
import { UserOrders } from "@/components/admin/user-orders";
import { UserPayments } from "@/components/admin/user-payments";
import { ReviewsAdmin } from "@/components/admin/reviews-admin";
import { UserWishlist } from "@/components/admin/user-wishlist";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { useAuth } from "@/hooks/useAuth";
import { ApiError, errorText } from "@/lib/apiError";
import { deleteUser, getUser, setUserBlocked } from "@/lib/users";
import { toast } from "@/lib/toast";
import type { ManagedUser } from "@/types/user";

const activities = [
  { id: "cart", label: "View cart" },
  { id: "wishlist", label: "View wishlist" },
  { id: "orders", label: "View orders" },
  { id: "payments", label: "View payments" },
  { id: "reviews", label: "View reviews" },
] as const;

type Activity = (typeof activities)[number]["id"];

function formatWhen(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export function UserAdminDetail({
  id,
  initialUser = null,
  initialError = "",
}: {
  id: string;
  initialUser?: ManagedUser | null;
  initialError?: string;
}) {
  const router = useRouter();
  const { session } = useAuth();
  const { confirm, dialog } = useConfirm();
  const seeded = initialUser !== null && !initialError;
  const consumeSeed = useServerSeed(seeded);
  const [user, setUser] = useState<ManagedUser | null>(seeded ? initialUser : null);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(seeded);
  const [editing, setEditing] = useState(false);
  const [version, setVersion] = useState(0);
  const [activity, setActivity] = useState<Activity | null>(null);
  const self = Boolean(user && session?.user.id === user.id);

  useEffect(() => {
    if (consumeSeed()) return;
    setUser(null);
    setReady(false);
    setActivity(null);
  }, [id]);

  useEffect(() => {
    if (consumeSeed()) return;
    let active = true;
    setError("");
    getUser(id)
      .then((item) => {
        if (!active) return;
        setUser(item);
      })
      .catch((caught) => {
        if (!active) return;
        setUser(null);
        setError(caught instanceof ApiError && caught.status === 404 ? "User not found" : errorText(caught, "This user could not be opened."));
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, [id, version]);

  async function onStatus() {
    if (!user) return;
    const nextBlocked = !user.isBlocked;
    const ok = await confirm({
      title: nextBlocked ? "Block this user?" : "Unblock this user?",
      message: nextBlocked ? `${user.name} will not be able to sign in.` : `${user.name} will be able to sign in again.`,
      confirmLabel: nextBlocked ? "Block" : "Unblock",
      tone: nextBlocked ? "danger" : "default",
    });
    if (!ok) return;
    try {
      const result = await setUserBlocked(user.id, nextBlocked);
      setUser(result.user);
      toast(result.message ?? (result.user.isBlocked ? "User blocked" : "User unblocked"));
    } catch (caught) {
      toast(errorText(caught, "The status could not be changed."));
    }
  }

  async function onDelete() {
    if (!user) return;
    const ok = await confirm({
      title: "Delete this user?",
      message: `${user.name} will be removed. This cannot be undone.`,
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!ok) return;
    try {
      const result = await deleteUser(user.id);
      toast(result.message);
      router.replace("/admin/customers");
    } catch (caught) {
      toast(errorText(caught, "The user could not be deleted."));
    }
  }

  if (!ready) {
    return (
      <>
        <p className="text-sm text-ink/60">Opening this user…</p>
        {dialog}
      </>
    );
  }

  if (!user) {
    return (
      <div>
        <h2 className="page-title">{error || "User not found"}</h2>
        <Link href="/admin/customers" className="mt-4 inline-flex text-sm text-wine">
          Back to users
        </Link>
        {dialog}
      </div>
    );
  }

  const facts = [
    ["Email", user.email],
    ["Mobile", user.mobile],
    ["Role", user.role === "admin" ? "Admin" : "Customer"],
    ["Email status", user.isEmailVerified ? "Verified" : "Not verified"],
    ["Added", formatWhen(user.createdAt)],
    ["Updated", formatWhen(user.updatedAt)],
  ];

  return (
    <div>
      <Link href="/admin/customers" className="text-sm text-wine">
        Back to users
      </Link>
      <div className="mt-4 rounded-2xl border border-ink/10 bg-paper p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-4">
            <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-blush font-display text-3xl text-wine">
              {user.name.slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="text-[0.65rem] uppercase tracking-[0.16em] text-wine">{user.role === "admin" ? "Admin" : "Customer"}</p>
              <h2 className="page-title mt-1">{user.name}</h2>
              <p className="mt-1 truncate text-sm text-ink/55">{user.email}</p>
            </div>
          </div>
          <span
            className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] ${
              user.isBlocked ? "bg-blush text-wine" : "bg-mint text-leaf"
            }`}
          >
            {user.isBlocked ? "Blocked" : "Active"}
          </span>
        </div>
        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          {facts.map(([label, value]) => (
            <div key={label}>
              <dt className="text-[0.65rem] uppercase tracking-[0.14em] text-ink/45">{label}</dt>
              <dd className="mt-1 text-sm text-ink">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="cursor-pointer rounded-full bg-wine px-4 py-2 text-sm text-white hover:bg-wine-deep"
          >
            Edit
          </button>
          {self ? null : (
            <>
              <button
                type="button"
                onClick={onStatus}
                className="cursor-pointer rounded-full border border-ink/15 px-4 py-2 text-sm hover:border-wine hover:text-wine"
              >
                {user.isBlocked ? "Unblock" : "Block"}
              </button>
              <button type="button" onClick={onDelete} className="cursor-pointer rounded-full px-4 py-2 text-sm text-wine">
                Delete
              </button>
            </>
          )}
        </div>
      </div>
      <section className="mt-4 rounded-2xl border border-ink/10 bg-paper p-4 sm:p-5">
        <h3 className="page-title">Account activity</h3>
        <div className="mt-4 flex flex-wrap gap-2">
          {activities.map((item) => {
            const selected = activity === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setActivity(selected ? null : item.id)}
                className={`cursor-pointer rounded-full border px-4 py-2 text-sm ${
                  selected ? "border-wine bg-blush text-wine" : "border-ink/15 hover:border-wine hover:text-wine"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
        {activity === "cart" ? <UserCart key={user.id} userId={user.id} /> : null}
        {activity === "wishlist" ? <UserWishlist key={user.id} userId={user.id} /> : null}
        {activity === "orders" ? <UserOrders key={user.id} userId={user.id} /> : null}
        {activity === "payments" ? <UserPayments key={user.id} userId={user.id} /> : null}
        {activity === "reviews" ? <ReviewsAdmin key={user.id} userId={user.id} embedded /> : null}
      </section>
      {editing ? (
        <UserFormDialog
          user={user}
          onClose={() => setEditing(false)}
          onSaved={() => {
            setEditing(false);
            setVersion((current) => current + 1);
          }}
        />
      ) : null}
      {dialog}
    </div>
  );
}
