"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Field, fieldClass, FormError } from "@/components/auth/fields";
import { errorText } from "@/lib/apiError";
import { register } from "@/lib/auth";
import { routes } from "@/lib/navigation";

export function SignupForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const mobile = String(data.get("mobile") ?? "").trim();
    const password = String(data.get("password") ?? "");
    const confirm = String(data.get("confirm") ?? "");

    if (name.length < 2) {
      setError(name ? "Name must be at least 2 characters" : "Name is required");
      return;
    }
    if (name.length > 100) {
      setError("Name cannot exceed 100 characters");
      return;
    }
    if (!email.includes("@")) {
      setError("Invalid email");
      return;
    }
    if (!/^\+?[0-9]{7,15}$/.test(mobile)) {
      setError("Invalid mobile number");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password.length > 64) {
      setError("Password cannot exceed 64 characters");
      return;
    }
    if (!/^(?=.*[A-Za-z])(?=.*\d).+$/.test(password)) {
      setError("Password must include at least one letter and one number");
      return;
    }
    if (password !== confirm) {
      setError("The passwords do not match.");
      return;
    }

    setPending(true);
    setError("");
    try {
      await register({ name, email, mobile, password });
      router.push(routes.verifyOtp);
    } catch (caught) {
      setError(errorText(caught, "Signup did not go through."));
      setPending(false);
    }
  }

  return (
    <AuthShell
      title="Create an account"
      subtitle="Signup creates a customer account. We email a 6-digit code that is valid for 10 minutes."
    >
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <Field label="Name">
          <input name="name" autoComplete="name" placeholder="Your name" className={fieldClass} />
        </Field>
        <Field label="Email">
          <input
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@email.com"
            className={fieldClass}
          />
        </Field>
        <Field label="Mobile">
          <input
            name="mobile"
            type="tel"
            autoComplete="tel"
            placeholder="+971501234567"
            className={fieldClass}
          />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Password">
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="8 or more characters"
              className={fieldClass}
            />
          </Field>
          <Field label="Confirm password">
            <input
              name="confirm"
              type="password"
              autoComplete="new-password"
              placeholder="Repeat the password"
              className={fieldClass}
            />
          </Field>
        </div>
        <FormError message={error} />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex w-full items-center justify-center rounded-full bg-wine px-5 py-3.5 text-sm text-white transition-colors hover:bg-wine-deep disabled:opacity-60"
        >
          {pending ? "Sending code…" : "Continue to verification"}
        </button>
      </form>
      <p className="mt-6 text-sm text-ink/70">
        Already have an account?{" "}
        <Link href={routes.login} className="text-wine">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}
