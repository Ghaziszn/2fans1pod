"use client";

import { useState, type FormEvent } from "react";

export function ContactForm({ accessKey }: { accessKey: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (String(form.get("company") || "").trim()) {
      setStatus("sent");
      setMessage("Message sent.");
      return;
    }
    if (!accessKey) {
      setStatus("error");
      setMessage("The form is not connected yet. Add WEB3FORMS_ACCESS_KEY and rebuild.");
      return;
    }
    setStatus("sending");
    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: accessKey,
          name: form.get("name"),
          email: form.get("email"),
          message: form.get("message"),
          subject: "2fans1pod contact",
        }),
      });
      const payload = (await response.json()) as { success?: boolean; message?: string };
      if (!response.ok || !payload.success) {
        setStatus("error");
        setMessage(payload.message || "The form could not send. Try again in a minute.");
        return;
      }
      setStatus("sent");
      setMessage("Message sent. We will read it.");
      event.currentTarget.reset();
    } catch {
      setStatus("error");
      setMessage("The form could not send. Check the connection and try again.");
    }
  }

  return (
    <form className="grid max-w-xl gap-3" onSubmit={onSubmit}>
      <label className="grid gap-1 text-sm">
        Name
        <input required name="name" className="min-h-11 rounded-md border border-line bg-surface px-3" />
      </label>
      <label className="grid gap-1 text-sm">
        Email
        <input required type="email" name="email" className="min-h-11 rounded-md border border-line bg-surface px-3" />
      </label>
      <label className="grid gap-1 text-sm">
        Message
        <textarea required name="message" rows={6} className="rounded-md border border-line bg-surface px-3 py-2" />
      </label>
      <label className="absolute left-[-9999px]" aria-hidden="true">
        Company
        <input name="company" tabIndex={-1} autoComplete="off" />
      </label>
      <button type="submit" className="min-h-11 rounded-md bg-accent px-4 font-medium text-accent-ink" disabled={status === "sending"}>
        {status === "sending" ? "Sending" : "Send"}
      </button>
      {message ? <p role="status">{message}</p> : null}
    </form>
  );
}
