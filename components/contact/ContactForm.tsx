"use client";

import { useRef, useState, type FormEvent } from "react";
import { submitContact } from "@/lib/contact";

export function ContactForm({ accessKey }: { accessKey: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = formRef.current;
    if (!form) return;
    const data = new FormData(form);
    const willSend = !String(data.get("company") || "").trim() && Boolean(accessKey);
    if (willSend) setStatus("sending");
    const result = await submitContact(data, accessKey);
    setStatus(result.status);
    setMessage(result.message);
    if (result.clear) form.reset();
  }

  return (
    <form ref={formRef} className="grid max-w-xl gap-3" onSubmit={onSubmit}>
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
