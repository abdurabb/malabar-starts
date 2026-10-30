"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { FormError } from "@/components/auth/fields";
import { ChoiceGroup } from "@/components/shop/filter-controls";
import { useAuth } from "@/hooks/useAuth";
import { errorText } from "@/lib/apiError";
import { createUser, updateUser } from "@/lib/users";
import { toast } from "@/lib/toast";
import type { Role } from "@/types/auth";
import type { ManagedUser, UserUpdate } from "@/types/user";

const inputClass =
  "mt-2 w-full rounded-2xl border border-ink/10 bg-ivory px-4 py-3 text-sm text-ink outline-none transition placeholder:text-ink/35 focus:border-wine";

type FormState = {
  name: string;
  email: string;
  mobile: string;
  password: string;
  confirm: string;
  role: Role;
};

const emptyForm: FormState = {
  name: "",
  email: "",
  mobile: "",
  password: "",
  confirm: "",
  role: "user",
};

function toForm(user: ManagedUser): FormState {
  return {
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    password: "",
    confirm: "",
    role: user.role,
  };
}

function accountError(form: FormState, creating: boolean) {
  const name = form.name.trim();
  const email = form.email.trim();
  const mobile = form.mobile.trim();
  if (name.length < 2) return name ? "Name must be at least 2 characters" : "Name is required";
  if (name.length > 100) return "Name cannot exceed 100 characters";
  if (!email.includes("@")) return "Invalid email";
  if (!/^\+?[0-9]{7,15}$/.test(mobile)) return "Invalid mobile number";
  if (creating || form.password || form.confirm) {
    if (form.password.length < 8) return form.password ? "Password must be at least 8 characters" : "Password is required";
    if (form.password.length > 64) return "Password cannot exceed 64 characters";
    if (!/^(?=.*[A-Za-z])(?=.*\d).+$/.test(form.password)) {
      return "Password must include at least one letter and one number";
    }
    if (form.password !== form.confirm) return "The passwords do not match.";
  }
  return "";
}

function changedFields(user: ManagedUser, form: FormState, lockRole: boolean): UserUpdate {
  const next: UserUpdate = {};
  const name = form.name.trim();
  const email = form.email.trim().toLowerCase();
  const mobile = form.mobile.trim();
  if (name !== user.name) next.name = name;
  if (email !== user.email) next.email = email;
  if (mobile !== user.mobile) next.mobile = mobile;
  if (!lockRole && form.role !== user.role) next.role = form.role;
  if (form.password) next.password = form.password;
  return next;
}

export function UserFormDialog({
  user,
  onClose,
  onSaved,
}: {
  user: ManagedUser | null;
  onClose: () => void;
  onSaved: (created: boolean) => void;
}) {
  const { session } = useAuth();
  const lockRole = Boolean(user && session?.user.id === user.id);
  const [form, setForm] = useState<FormState>(() => (user ? toForm(user) : emptyForm));
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
    const message = accountError(form, !user);
    if (message) {
      setError(message);
      return;
    }
    setPending(true);
    setError("");
    try {
      if (user) {
        const input = changedFields(user, form, lockRole);
        if (Object.keys(input).length === 0) {
          setError("At least one field is required");
          setPending(false);
          return;
        }
        const result = await updateUser(user.id, input);
        toast(result.message ?? "User updated");
        onSaved(false);
      } else {
        const result = await createUser({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          mobile: form.mobile.trim(),
          password: form.password,
          role: form.role,
        });
        toast(result.message ?? "User created");
        onSaved(true);
      }
    } catch (caught) {
      setError(errorText(caught, user ? "The user could not be updated." : "The user could not be created."));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-6">
      <button type="button" aria-label="Close user form" className="absolute inset-0 cursor-pointer bg-ink/40" onClick={close} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-form-title"
        className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[1.75rem] bg-paper p-5 shadow-2xl sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-wine">{user ? "Update" : "New user"}</p>
            <h2 id="user-form-title" className="mt-1 font-display text-4xl tracking-tight">
              {user ? user.name : "Add a user"}
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
        <form onSubmit={onSubmit} className="mt-6" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm text-ink/70 sm:col-span-2">
              Name
              <input
                value={form.name}
                onChange={(event) => setField("name", event.target.value)}
                maxLength={100}
                autoComplete="name"
                className={inputClass}
                autoFocus
              />
            </label>
            <label className="block text-sm text-ink/70">
              Email
              <input
                value={form.email}
                onChange={(event) => setField("email", event.target.value)}
                type="email"
                autoComplete="email"
                className={inputClass}
              />
            </label>
            <label className="block text-sm text-ink/70">
              Mobile
              <input
                value={form.mobile}
                onChange={(event) => setField("mobile", event.target.value)}
                type="tel"
                autoComplete="tel"
                placeholder="+971501234567"
                className={inputClass}
              />
            </label>
            <label className="block text-sm text-ink/70">
              Password
              <input
                value={form.password}
                onChange={(event) => setField("password", event.target.value)}
                type="password"
                autoComplete="new-password"
                placeholder={user ? "Leave blank to keep the current password" : "8 or more characters"}
                className={inputClass}
              />
            </label>
            <label className="block text-sm text-ink/70">
              Confirm password
              <input
                value={form.confirm}
                onChange={(event) => setField("confirm", event.target.value)}
                type="password"
                autoComplete="new-password"
                placeholder="Repeat the password"
                className={inputClass}
              />
            </label>
            <div className="sm:col-span-2">
              {lockRole ? (
                <p className="text-sm text-ink/70">
                  Role
                  <span className="mt-2 flex h-12 items-center rounded-full bg-[#f3e6d4] px-4 text-ink">
                    {form.role === "admin" ? "Admin" : "Customer"}
                  </span>
                </p>
              ) : (
                <ChoiceGroup
                  label="Role"
                  value={form.role}
                  onChange={(value) => setField("role", value)}
                  options={[
                    { value: "user", label: "Customer" },
                    { value: "admin", label: "Admin" },
                  ]}
                />
              )}
            </div>
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
              {pending ? "Saving…" : user ? "Update user" : "Save user"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
