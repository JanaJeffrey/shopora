"use client";

import { useState } from "react";
import {
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
} from "lucide-react";
import { SITE_CONFIG } from "../../lib/site-config";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    // ============================================================
    // NOTE: there's no backend endpoint for contact messages yet,
    // so this opens the visitor's email client with everything
    // pre-filled rather than pretending to submit somewhere. Once a
    // real endpoint exists (e.g. POST /api/contact), swap this for
    // a fetch() call the same way checkout/page.tsx calls the API.
    // ============================================================

    const subject = encodeURIComponent(
      `Message from ${name.trim()} via Shopora`
    );

    const body = encodeURIComponent(
      `${message.trim()}\n\n— ${name.trim()} (${email.trim()})`
    );

    window.location.href = `mailto:${SITE_CONFIG.contactEmail}?subject=${subject}&body=${body}`;
  };

  return (
    <main className="min-h-screen bg-(--background)">
      {/* ============================================================
          HEADER
      ============================================================ */}
      <section className="border-b border-(--border) bg-(--surface-warm)">
        <div className="mx-auto max-w-4xl px-4 py-14 text-center sm:px-6 sm:py-20">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-(--border-purple) bg-(--primary-light) px-3.5 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-(--primary)">
            <MessageCircle size={14} />
            Get in touch
          </div>

          <h1 className="mt-5 text-3xl font-black tracking-tight text-(--text) sm:text-4xl lg:text-5xl">
            We&apos;d love to
            <br />
            <span className="text-(--primary)">hear from you.</span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-(--muted)">
            Questions about an order, a product, or just want to say
            hi? Send us a message and we&apos;ll get back to you.
          </p>
        </div>
      </section>

      {/* ============================================================
          CONTENT
      ============================================================ */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-5">
          {/* ========================================================
              CONTACT DETAILS
          ======================================================== */}
          <div className="lg:col-span-2">
            <div className="rounded-[2rem] border border-(--border) bg-(--surface) p-7 shadow-sm sm:p-9">
              <h2 className="text-lg font-black text-(--text)">
                Contact details
              </h2>

              <div className="mt-6 space-y-5">
                <a
                  href={`mailto:${SITE_CONFIG.contactEmail}`}
                  className="flex items-start gap-3 transition hover:opacity-80"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-(--primary-light) text-(--primary)">
                    <Mail size={19} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-(--text)">
                      Email
                    </p>
                    <p className="text-sm text-(--muted)">
                      {SITE_CONFIG.contactEmail}
                    </p>
                  </div>
                </a>

                <a
                  href={`tel:${SITE_CONFIG.contactPhoneHref}`}
                  className="flex items-start gap-3 transition hover:opacity-80"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-(--accent-light) text-(--accent-dark)">
                    <Phone size={19} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-(--text)">
                      Phone
                    </p>
                    <p className="text-sm text-(--muted)">
                      {SITE_CONFIG.contactPhoneDisplay}
                    </p>
                  </div>
                </a>

                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-(--primary-light) text-(--primary)">
                    <MapPin size={19} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-(--text)">
                      Location
                    </p>
                    <p className="text-sm text-(--muted)">
                      {SITE_CONFIG.address}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-7 rounded-2xl bg-(--surface-soft) p-4">
                <p className="text-xs leading-5 text-(--muted)">
                  We typically reply within one business day.
                </p>
              </div>
            </div>
          </div>

          {/* ========================================================
              FORM
          ======================================================== */}
          <div className="lg:col-span-3">
            <form
              onSubmit={handleSubmit}
              className="rounded-[2rem] border border-(--border) bg-(--surface) p-7 shadow-sm sm:p-9"
            >
              <h2 className="text-lg font-black text-(--text)">
                Send a message
              </h2>

              <div className="mt-6 space-y-5">
                <div>
                  <label
                    htmlFor="name"
                    className="text-sm font-bold text-(--text)"
                  >
                    Full name
                  </label>

                  <input
                    id="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Your name"
                    className="mt-2 h-12 w-full rounded-xl border border-(--border) bg-(--surface-soft) px-4 text-sm outline-none transition focus:border-(--primary) focus:ring-4 focus:ring-(--primary-light)"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="text-sm font-bold text-(--text)"
                  >
                    Email address
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="mt-2 h-12 w-full rounded-xl border border-(--border) bg-(--surface-soft) px-4 text-sm outline-none transition focus:border-(--primary) focus:ring-4 focus:ring-(--primary-light)"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="text-sm font-bold text-(--text)"
                  >
                    Message
                  </label>

                  <textarea
                    id="message"
                    value={message}
                    onChange={(event) =>
                      setMessage(event.target.value)
                    }
                    rows={5}
                    placeholder="How can we help?"
                    className="mt-2 w-full resize-none rounded-xl border border-(--border) bg-(--surface-soft) px-4 py-3 text-sm outline-none transition focus:border-(--primary) focus:ring-4 focus:ring-(--primary-light)"
                  />
                </div>

                {error && (
                  <div
                    role="alert"
                    className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
                  >
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-(--primary) px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-purple-200 transition hover:-translate-y-0.5 hover:bg-(--primary-dark) sm:w-auto"
                >
                  <Send size={17} />
                  Send message
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
