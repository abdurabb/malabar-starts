"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Field, fieldClass, FormError } from "@/components/auth/fields";
import { errorText, isUnverifiedEmail } from "@/lib/apiError";
import { login, resendOtp } from "@/lib/auth";
import { destinationFor, routes } from "@/lib/navigation";
import { useAppDispatch } from "@/redux/hooks";
import { setSession } from "@/redux/slices/authSlice";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");

    if (!email.includes("@")) {
      setError("Invalid email");
      return;
    }
    if (!password) {
      setError("Password is required");
      return;
    }

    setPending(true);
    setError("");
    try {
      const session = await login({ email, password });
      dispatch(setSession(session));
      router.replace(destinationFor(session, searchParams.get("next")));
    } catch (caught) {
      if (isUnverifiedEmail(caught)) {
        try {
          await resendOtp(email);
          router.push(routes.verifyOtp);
          return;
        } catch (resendError) {
          setError(errorText(resendError, "A new code could not be sent."));
          setPending(false);
          return;
        }
      }
      setError(errorText(caught, "Login did not go through."));
      setPending(false);
    }
  }

  return (
    <AuthShell
      title="Log in"
      subtitle="Use the email and password for your account. A verified email returns a token that lasts 7 days."
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
        <Field label="Password">
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Your password"
            className={fieldClass}
          />
        </Field>
        <FormError message={error} />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex w-full items-center justify-center rounded-full bg-wine px-5 py-3.5 text-sm text-white transition-colors hover:bg-wine-deep disabled:opacity-60"
        >
          {pending ? "Checking…" : "Log in"}
        </button>
      </form>
      <p className="mt-6 text-sm text-ink/70">
        <Link href={routes.forgotPassword} className="text-wine">
          Forgot password
        </Link>
      </p>
      <p className="mt-3 text-sm text-ink/70">
        New to the counter?{" "}
        <Link href={routes.signup} className="text-wine">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
