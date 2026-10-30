"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { FormError, fieldClass } from "@/components/auth/fields";
import { PageFrame } from "@/components/shop/page-frame";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { useAuth } from "@/hooks/useAuth";
import { errorText } from "@/lib/apiError";
import { changePassword, logout } from "@/lib/auth";
import { routes } from "@/lib/navigation";
import { toast } from "@/lib/toast";
import { updateUser } from "@/lib/users";
import { useAppDispatch } from "@/redux/hooks";
import { clearSession, setSession } from "@/redux/slices/authSlice";
import { clearShop } from "@/redux/slices/shopSlice";
import type { AuthUser } from "@/types/auth";

type ProfileForm = {
  name: string;
  mobile: string;
};

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const emptyPassword: PasswordForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

function profileError(form: ProfileForm) {
  const name = form.name.trim();
  const mobile = form.mobile.trim();
  if (name.length < 2) return name ? "Name must be at least 2 characters" : "Name is required";
  if (name.length > 100) return "Name cannot exceed 100 characters";
  if (!/^\+?[0-9]{7,15}$/.test(mobile)) return "Invalid mobile number";
  return "";
}

function passwordError(form: PasswordForm) {
  if (!form.currentPassword) return "Current password is required";
  if (form.newPassword.length < 8) return form.newPassword ? "Password must be at least 8 characters" : "New password is required";
  if (form.newPassword.length > 64) return "Password cannot exceed 64 characters";
  if (!/^(?=.*[A-Za-z])(?=.*\d).+$/.test(form.newPassword)) {
    return "Password must include at least one letter and one number";
  }
  if (form.newPassword !== form.confirmPassword) return "The passwords do not match.";
  return "";
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M9 6H6a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" />
      <path d="M13 16l4-4-4-4" />
      <path d="M17 12H9" />
    </svg>
  );
}

function toAuthUser(user: AuthUser, next: { name: string; email: string; mobile: string; isEmailVerified: boolean }): AuthUser {
  return {
    ...user,
    name: next.name,
    email: next.email,
    mobile: next.mobile,
    isEmailVerified: next.isEmailVerified,
  };
}

export function ProfileView() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { session } = useAuth();
  const { confirm, dialog } = useConfirm();
  const user = session?.user;
  const [form, setForm] = useState<ProfileForm>({ name: "", mobile: "" });
  const [seededId, setSeededId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState<PasswordForm>(emptyPassword);
  const [passwordErrorText, setPasswordErrorText] = useState("");
  const [passwordPending, setPasswordPending] = useState(false);

  if (user && seededId !== user.id) {
    setSeededId(user.id);
    setForm({
      name: user.name,
      mobile: user.mobile,
    });
  }

  async function signOut() {
    const ok = await confirm({
      title: "Log out?",
      message: "You will need to sign in again on this device.",
      confirmLabel: "Log out",
    });
    if (!ok) return;
    logout();
    dispatch(clearSession());
    dispatch(clearShop());
    router.replace(routes.home);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || !session) return;
    const message = profileError(form);
    if (message) {
      setError(message);
      return;
    }
    const name = form.name.trim();
    const mobile = form.mobile.trim();
    const input: { name?: string; mobile?: string } = {};
    if (name !== user.name) input.name = name;
    if (mobile !== user.mobile) input.mobile = mobile;
    if (Object.keys(input).length === 0) {
      setError("Change a field before saving.");
      return;
    }
    setPending(true);
    setError("");
    try {
      const result = await updateUser(user.id, input);
      dispatch(
        setSession({
          token: session.token,
          user: toAuthUser(user, result.user),
        }),
      );
      toast(result.message ?? "Profile updated");
    } catch (caught) {
      setError(errorText(caught, "The profile could not be updated."));
    } finally {
      setPending(false);
    }
  }

  function openPassword() {
    setPasswordForm(emptyPassword);
    setPasswordErrorText("");
    setPasswordOpen(true);
  }

  function closePassword() {
    if (passwordPending) return;
    setPasswordOpen(false);
    setPasswordErrorText("");
  }

  async function onPasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = passwordError(passwordForm);
    if (message) {
      setPasswordErrorText(message);
      return;
    }
    setPasswordPending(true);
    setPasswordErrorText("");
    try {
      const result = await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm(emptyPassword);
      setPasswordOpen(false);
      toast(result.message ?? "Password updated");
    } catch (caught) {
      setPasswordErrorText(errorText(caught, "The password could not be changed."));
    } finally {
      setPasswordPending(false);
    }
  }

  if (!user) return null;

  return (
    <PageFrame eyebrow="Account" title={user.name} lede="Your account details.">
      <h1 className="mb-6 font-display text-4xl tracking-tight">Profile</h1>
      <div className="grid items-start gap-6 lg:grid-cols-[22rem_minmax(0,1fr)]">
        <section className="rounded-[1.5rem] border border-ink/10 bg-paper p-6 text-sm">
          <p className="font-display text-3xl tracking-tight">{user.name}</p>
          <p className="mt-2 text-ink/70">{user.email}</p>
          <dl className="mt-4 grid gap-3">
            <div>
              <dt className="text-xs uppercase tracking-[0.14em] text-ink/45">Mobile</dt>
              <dd className="mt-1 text-ink">{user.mobile}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.14em] text-ink/45">Role</dt>
              <dd className="mt-1 text-ink">{user.role}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.14em] text-ink/45">Email</dt>
              <dd className="mt-1 text-ink">{user.isEmailVerified ? "Verified" : "Not verified"}</dd>
            </div>
          </dl>
          <div className="mt-5 flex flex-nowrap items-center gap-2">
            <Link
              href={routes.orders}
              className="inline-flex h-8 shrink-0 items-center rounded-full bg-wine px-3 text-xs text-white hover:bg-wine-deep"
            >
              Your orders
            </Link>
            <Link
              href={routes.payments}
              className="inline-flex h-8 shrink-0 items-center rounded-full border border-ink/15 px-3 text-xs hover:border-wine hover:text-wine"
            >
              Payment history
            </Link>
            <button
              type="button"
              onClick={signOut}
              aria-label="Log out"
              title="Log out"
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors hover:border-wine hover:text-wine"
            >
              <LogoutIcon />
            </button>
          </div>
        </section>
        <form onSubmit={onSubmit} noValidate className="rounded-[1.5rem] border border-ink/10 bg-paper p-6">
          <h2 className="font-display text-3xl tracking-tight">Edit profile</h2>
          <p className="mt-2 text-sm leading-6 text-ink/60">Update your name or mobile.</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-sm text-ink/70">Name</span>
              <input
                value={form.name}
                autoComplete="name"
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                className={fieldClass}
              />
            </label>
            <label className="block">
              <span className="text-sm text-ink/70">Email</span>
              <input type="email" value={user.email} readOnly disabled className={`${fieldClass} text-ink/55`} />
            </label>
            <label className="block">
              <span className="text-sm text-ink/70">Mobile</span>
              <input
                value={form.mobile}
                autoComplete="tel"
                inputMode="tel"
                onChange={(event) => setForm((current) => ({ ...current, mobile: event.target.value }))}
                className={fieldClass}
              />
            </label>
          </div>
          <div className="mt-4">
            <FormError message={error} />
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex rounded-full bg-wine px-5 py-3 text-sm text-white hover:bg-wine-deep disabled:opacity-40"
            >
              {pending ? "Saving…" : "Save profile"}
            </button>
            <button
              type="button"
              onClick={openPassword}
              className="rounded-full border border-ink/15 px-5 py-3 text-sm hover:border-wine hover:text-wine"
            >
              Change password
            </button>
          </div>
        </form>
        {passwordOpen ? (
          <form onSubmit={onPasswordSubmit} noValidate className="rounded-[1.5rem] border border-ink/10 bg-paper p-6 lg:col-span-2">
            <h2 className="font-display text-3xl tracking-tight">Change password</h2>
            <p className="mt-2 text-sm leading-6 text-ink/60">Enter your current password, then choose a new one.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <label className="block">
                <span className="text-sm text-ink/70">Current password</span>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  autoComplete="current-password"
                  onChange={(event) => setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))}
                  className={fieldClass}
                />
              </label>
              <label className="block">
                <span className="text-sm text-ink/70">New password</span>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  autoComplete="new-password"
                  onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))}
                  className={fieldClass}
                />
              </label>
              <label className="block">
                <span className="text-sm text-ink/70">Confirm password</span>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  autoComplete="new-password"
                  onChange={(event) => setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))}
                  className={fieldClass}
                />
              </label>
            </div>
            <div className="mt-4">
              <FormError message={passwordErrorText} />
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={passwordPending}
                className="inline-flex rounded-full bg-wine px-5 py-3 text-sm text-white hover:bg-wine-deep disabled:opacity-40"
              >
                {passwordPending ? "Saving…" : "Update password"}
              </button>
              <button type="button" onClick={closePassword} disabled={passwordPending} className="rounded-full border border-ink/15 px-5 py-3 text-sm">
                Cancel
              </button>
            </div>
          </form>
        ) : null}
      </div>
      {dialog}
    </PageFrame>
  );
}
