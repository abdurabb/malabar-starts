"use client";

import { useState, type FormEvent } from "react";

type ContactFields = {
  name: string;
  phone: string;
  email: string;
  message: string;
};

function formatMessage(fields: ContactFields) {
  return [
    "Malabar Starts Food Stuff — contact",
    `Name: ${fields.name}`,
    `Phone: ${fields.phone}`,
    fields.email ? `Email: ${fields.email}` : null,
    `Message: ${fields.message}`,
    "Sharjah, United Arab Emirates",
  ]
    .filter(Boolean)
    .join("\n");
}

export function InquiryForm() {
  const [contact, setContact] = useState<ContactFields | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();

    if (name.length < 2) {
      setError("Add your name.");
      return;
    }
    if (phone.replace(/\D/g, "").length < 8) {
      setError("Add a phone number we can call.");
      return;
    }
    if (email && !email.includes("@")) {
      setError("Add a valid email, or leave it blank.");
      return;
    }
    if (message.length < 2) {
      setError("Add a short message.");
      return;
    }

    setError("");
    setCopied(false);
    setContact({ name, phone, email, message });
  }

  async function copyMessage() {
    if (!contact) return;
    try {
      await navigator.clipboard.writeText(formatMessage(contact));
      setCopied(true);
    } catch {
      setCopied(false);
      setError("Clipboard is blocked. Select the note below and copy it.");
    }
  }

  if (contact) {
    return (
      <div className="rounded-[1.5rem] bg-paper p-6 text-ink sm:p-8" role="status">
        <p className="text-xs uppercase tracking-[0.18em] text-wine">Message ready</p>
        <h3 className="mt-3 font-display text-4xl leading-none tracking-tight">Thank you, {contact.name}.</h3>
        <p className="mt-4 text-sm leading-6 text-ink/70">
          Copy this note and send it to the Sharjah counter. It includes {contact.phone}.
        </p>
        <pre className="mt-6 overflow-x-auto whitespace-pre-wrap rounded-2xl bg-ivory px-4 py-4 font-sans text-sm leading-6 text-ink">
          {formatMessage(contact)}
        </pre>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={copyMessage}
            className="inline-flex items-center justify-center rounded-full bg-wine px-5 py-3 text-sm text-white transition-colors hover:bg-wine-deep"
          >
            {copied ? "Copied" : "Copy message"}
          </button>
          <button
            type="button"
            onClick={() => {
              setContact(null);
              setCopied(false);
              setError("");
            }}
            className="inline-flex items-center justify-center rounded-full border border-ink/15 px-5 py-3 text-sm text-ink"
          >
            Write another
          </button>
        </div>
        {error ? (
          <p className="mt-4 text-sm text-wine" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="rounded-[1.5rem] bg-paper p-6 text-ink sm:p-8">
      <p className="text-xs uppercase tracking-[0.18em] text-wine">Contact form</p>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm text-ink/70">Name</span>
          <input
            name="name"
            autoComplete="name"
            placeholder="Your name"
            className="mt-2 w-full rounded-2xl border border-ink/12 bg-ivory px-4 py-3 text-ink outline-none placeholder:text-ink/35"
          />
        </label>
        <label className="block">
          <span className="text-sm text-ink/70">Phone</span>
          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            placeholder="05x xxx xxxx"
            className="mt-2 w-full rounded-2xl border border-ink/12 bg-ivory px-4 py-3 text-ink outline-none placeholder:text-ink/35"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-sm text-ink/70">Email</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Optional"
            className="mt-2 w-full rounded-2xl border border-ink/12 bg-ivory px-4 py-3 text-ink outline-none placeholder:text-ink/35"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-sm text-ink/70">Message</span>
          <textarea
            name="message"
            rows={5}
            placeholder="How can the counter help?"
            className="mt-2 w-full resize-y rounded-2xl border border-ink/12 bg-ivory px-4 py-3 text-ink outline-none placeholder:text-ink/35"
          />
        </label>
      </div>
      {error ? (
        <p className="mt-4 text-sm text-wine" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-wine px-5 py-3.5 text-sm text-white transition-colors hover:bg-wine-deep sm:w-auto"
      >
        Prepare message
      </button>
    </form>
  );
}
