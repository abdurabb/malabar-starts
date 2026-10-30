"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Field, fieldClass, FormError } from "@/components/auth/fields";
import { errorText } from "@/lib/apiError";
import { forgotPassword } from "@/lib/auth";
import { routes } from "@/lib/navigation";

export function ForgotPasswordForm() {
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email") ?? "").trim();
    if (!email.includes("@")) {
      setError("Invalid email");
      return;
    }

    setPending(true);
    setError("");
    setNotice("");
    try {
      const result = await forgotPassword(email);
      setNotice(result.message);
      setPending(false);
    } catch (caught) {
      setError(errorText(caught, "The reset email could not be sent."));
      setPending(false);
    }
  }

  return (
    <AuthShell
      title="Reset password"
      subtitle="We email a reset link. It opens on the server and expires in 15 minutes. After the password changes, come back here to log in."
    >
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <Field label="Email">
          <input
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@email.com"
            className={fieldClass}
          />
        </Field>
        {notice ? <p className="rounded-2xl bg-[#f3e6d4] px-4 py-3 text-sm text-ink">{notice}</p> : null}
        <FormError message={error} />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex w-full items-center justify-center rounded-full bg-wine px-5 py-3.5 text-sm text-white hover:bg-wine-deep disabled:opacity-60"
        >
          {pending ? "Sending…" : "Send reset link"}
        </button>
      </form>
      <p className="mt-6 text-sm text-ink/70">
        <Link href={routes.login} className="text-wine">
          Back to login
        </Link>
      </p>
    </AuthShell>
  );
}
