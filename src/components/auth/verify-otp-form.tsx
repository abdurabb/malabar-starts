"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Field, fieldClass, FormError } from "@/components/auth/fields";
import { errorText } from "@/lib/apiError";
import { resendOtp, verifyOtp } from "@/lib/auth";
import { clearPendingEmail, readPendingEmail } from "@/lib/authSession";
import { destinationFor, routes } from "@/lib/navigation";
import { useAppDispatch } from "@/redux/hooks";
import { setSession } from "@/redux/slices/authSlice";

export function VerifyOtpForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState("");
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const stored = readPendingEmail();
    if (!stored) {
      router.replace(routes.signup);
      return;
    }
    setEmail(stored);
    setReady(true);
  }, [router]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = String(new FormData(event.currentTarget).get("otp") ?? "").trim();
    if (!/^\d{6}$/.test(code)) {
      setError("OTP must be a 6 digit code");
      return;
    }
    setPending(true);
    setError("");
    setNotice("");
    try {
      const session = await verifyOtp(email, code);
      dispatch(setSession(session));
      router.replace(destinationFor(session));
    } catch (caught) {
      setError(errorText(caught, "The code could not be checked."));
      setPending(false);
    }
  }

  async function onResend() {
    setError("");
    setNotice("");
    try {
      const result = await resendOtp(email);
      setNotice(result.message);
    } catch (caught) {
      setError(errorText(caught, "A new code could not be sent."));
    }
  }

  if (!ready || !email) {
    return (
      <AuthShell title="Verify the code" subtitle="Looking up the email for this code.">
        <p className="text-sm text-ink/60">Sending you back to signup if this tab has no email waiting.</p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Verify the code"
      subtitle={`Enter the 6-digit code sent to ${email}. It is valid for 10 minutes.`}
    >
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <Field label="One-time code">
          <input
            name="otp"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="000000"
            className={`${fieldClass} tracking-[0.4em]`}
          />
        </Field>
        {notice ? <p className="rounded-2xl bg-[#f3e6d4] px-4 py-3 text-sm text-ink">{notice}</p> : null}
        <FormError message={error} />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex w-full items-center justify-center rounded-full bg-wine px-5 py-3.5 text-sm text-white hover:bg-wine-deep disabled:opacity-60"
        >
          {pending ? "Checking…" : "Verify and continue"}
        </button>
      </form>
      <div className="mt-6 flex items-center justify-between text-sm">
        <button type="button" onClick={onResend} className="text-wine">
          Send a new code
        </button>
        <button
          type="button"
          onClick={() => {
            clearPendingEmail();
            router.push(routes.signup);
          }}
          className="text-ink/60"
        >
          Start over
        </button>
      </div>
      <p className="mt-6 text-sm text-ink/70">
        Already verified?{" "}
        <Link href={routes.login} className="text-wine">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}
