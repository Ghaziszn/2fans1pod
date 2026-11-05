import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Send a note to 2fans1pod.",
};

export default function ContactPage() {
  const accessKey = process.env.WEB3FORMS_ACCESS_KEY || process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY || "";
  return (
    <div className="max-w-[720px]">
      <h1 className="text-5xl">Contact</h1>
      <p className="mt-3 leading-7 text-muted">Listeners, guests, and sponsors can send a note here. It goes to the show inbox.</p>
      <div className="mt-6">
        <ContactForm accessKey={accessKey} />
      </div>
    </div>
  );
}
