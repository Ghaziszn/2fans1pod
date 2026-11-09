export type ContactResult = { status: "sent" | "error"; message: string; clear: boolean };

export async function submitContact(form: FormData, accessKey: string, fetchImpl: typeof fetch = fetch): Promise<ContactResult> {
  if (String(form.get("company") || "").trim()) {
    return { status: "sent", message: "Message sent.", clear: false };
  }
  if (!accessKey) {
    return { status: "error", message: "The form is not connected yet. Please try again later.", clear: false };
  }
  try {
    const response = await fetchImpl("https://api.web3forms.com/submit", {
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
      return { status: "error", message: payload.message || "The form could not send. Try again in a minute.", clear: false };
    }
    return { status: "sent", message: "Message sent. We will read it.", clear: true };
  } catch {
    return { status: "error", message: "The form could not send. Check the connection and try again.", clear: false };
  }
}
