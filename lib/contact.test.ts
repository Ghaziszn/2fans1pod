import { describe, expect, it } from "vitest";
import { submitContact } from "./contact";

function form(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

const note = { name: "Pat", email: "pat@example.com", message: "Hello" };

describe("contact form", () => {
  it("says the form is not connected when the key is missing", async () => {
    const result = await submitContact(form(note), "");
    expect(result).toEqual({
      status: "error",
      message: "The form is not connected yet. Please try again later.",
      clear: false,
    });
  });

  it("pretends a filled company field was sent and does not clear the form", async () => {
    let called = false;
    const fetchImpl = async () => {
      called = true;
      return new Response(null, { status: 500 });
    };
    const result = await submitContact(form({ ...note, company: "bot" }), "key", fetchImpl);
    expect(called).toBe(false);
    expect(result).toEqual({ status: "sent", message: "Message sent.", clear: false });
  });

  it("clears the form only after the inbox accepts the note", async () => {
    const fetchImpl = async () => new Response(JSON.stringify({ success: true }), { status: 200 });
    const result = await submitContact(form(note), "key", fetchImpl);
    expect(result).toEqual({ status: "sent", message: "Message sent. We will read it.", clear: true });
  });

  it("keeps the form when the inbox refuses the note", async () => {
    const fetchImpl = async () => new Response(JSON.stringify({ success: false, message: "Blocked." }), { status: 200 });
    const result = await submitContact(form(note), "key", fetchImpl);
    expect(result).toEqual({ status: "error", message: "Blocked.", clear: false });
  });

  it("keeps the form when the request fails", async () => {
    const fetchImpl = async () => {
      throw new Error("offline");
    };
    const result = await submitContact(form(note), "key", fetchImpl);
    expect(result.status).toBe("error");
    expect(result.clear).toBe(false);
  });
});
