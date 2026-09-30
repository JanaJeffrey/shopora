import Link from "next/link";
import {
  ArrowRight,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";

const values = [
  {
    icon: ShieldCheck,
    title: "Trust, built in",
    description:
      "Every transaction on Shopora is protected end to end, from checkout to delivery.",
  },
  {
    icon: Truck,
    title: "Delivered reliably",
    description:
      "We work to get your order to you quickly, wherever you are.",
  },
  {
    icon: Sparkles,
    title: "Quality, curated",
    description:
      "We only list products we'd be happy to buy ourselves.",
  },
  {
    icon: HeartHandshake,
    title: "People first",
    description:
      "Real support from real people when something needs sorting out.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-(--background)">
      {/* ============================================================
          HERO
      ============================================================ */}
      <section className="border-b border-(--border) bg-(--surface-warm)">
        <div className="mx-auto max-w-4xl px-4 py-14 text-center sm:px-6 sm:py-20">
          <div className="mx-auto inline-flex items-center rounded-full border border-(--border-purple) bg-(--primary-light) px-3.5 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-(--primary)">
            About Shopora
          </div>

          <h1 className="mt-5 text-3xl font-black tracking-tight text-(--text) sm:text-4xl lg:text-5xl">
            A better way to shop,
            <br />
            <span className="text-(--primary)">built for everyone.</span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-(--muted)">
            Shopora started with a simple idea: online shopping
            should feel easy, honest, and a little bit delightful.
            No hidden fees, no confusing checkout, no guesswork —
            just quality products at fair prices, delivered
            reliably.
          </p>
        </div>
      </section>

      {/* ============================================================
          VALUES
      ============================================================ */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-black text-(--text) sm:text-3xl">
            What we stand for
          </h2>

          <p className="mt-3 text-sm leading-6 text-(--muted) sm:text-base">
            The principles behind every order, every page, every
            interaction.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((value) => (
            <div
              key={value.title}
              className="rounded-[1.75rem] border border-(--border) bg-(--surface) p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-(--primary-light) text-(--primary)">
                <value.icon size={22} />
              </div>

              <h3 className="mt-5 text-base font-black text-(--text)">
                {value.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-(--muted)">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================
          STORY
      ============================================================ */}
      <section className="mx-auto max-w-4xl px-4 pb-14 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-(--border) bg-(--surface) p-8 shadow-sm sm:p-12">
          <h2 className="text-2xl font-black text-(--text) sm:text-3xl">
            Our story
          </h2>

          <div className="mt-5 space-y-4 text-sm leading-7 text-(--muted) sm:text-base">
            <p>
              We were tired of online stores that made shopping
              feel like a chore — cluttered pages, unclear pricing,
              and checkout flows that seemed designed to lose your
              cart along the way. Shopora is our answer: a clean,
              fast, and genuinely trustworthy place to shop.
            </p>

            <p>
              From the products we list to the way payments are
              handled, every decision comes back to one question:
              would we be happy if this happened to us as a
              customer? If the answer is no, we don&apos;t ship it.
            </p>

            <p>
              We&apos;re still growing, and we&apos;re building
              Shopora one improvement at a time — with our
              customers&apos; experience always at the center.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================
          CTA
      ============================================================ */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 rounded-[2rem] bg-(--primary) px-8 py-10 text-center sm:flex-row sm:text-left">
          <div>
            <h2 className="text-2xl font-black text-white">
              Ready to start shopping?
            </h2>
            <p className="mt-1 text-sm text-white/80">
              Explore our full catalog and find something you love.
            </p>
          </div>

          <Link
            href="/products"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-(--accent) px-6 py-3.5 text-sm font-black text-white transition hover:opacity-90"
          >
            Shop now
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </main>
  );
}
