import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  WalletCards,
} from "lucide-react";
import { getProducts } from "../lib/products";
import { formatPrice } from "../lib/currency";
import HeroCarousel from "../components/HeroCarousel";
import ProductSearch from "../components/ProductSearch";

export default async function HomePage() {
  const products = await getProducts();

  const featuredProducts = products
    .filter((product) => product.status === "ACTIVE")
    .slice(0, 4);

  return (
    <main className="min-h-screen bg-(--background)">
      {/* HERO */}
      <section
        className="relative isolate overflow-hidden"
        style={{
          minHeight: "calc(100dvh - var(--navbar-height, 76px))",
        }}
      >
        {/* Background carousel */}
        <div className="absolute inset-0">
          <HeroCarousel />
        </div>

        {/* Legibility overlays */}
        <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-(--primary-dark)/85 via-(--primary-dark)/45 to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-black/10" />

        {/* Content */}
        <div className="relative z-10 flex min-h-[calc(100dvh-var(--navbar-height,76px))] items-end px-6 pb-8 pt-16 sm:px-10 sm:pb-10 sm:pt-20 lg:px-16">
          <div className="mx-auto w-full max-w-7xl">
            <div className="max-w-2xl">
              <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-white/80">
                Welcome to Shopora
              </p>

              <h1 className="text-4xl font-black leading-[1.05] tracking-tight text-white drop-shadow-sm sm:text-5xl lg:text-6xl">
                A better way
                <br />
                <span className="text-(--accent)">to shop.</span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-7 text-white/90 sm:text-lg">
                Discover products you&apos;ll love, compare your options,
                and shop with confidence—all in one place.
              </p>

              {/* Hero Search */}
              <div className="relative z-50 mt-8 max-w-xl">
                <ProductSearch inlineDropdown />
              </div>

              <Link
                href="/products"
                className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-white transition hover:gap-3"
              >
                Explore all products
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST FEATURES */}
      <section className="border-y border-(--border) bg-(--surface)">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:grid-cols-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-(--primary-light) p-3 text-(--primary)">
              <Truck size={23} />
            </div>

            <div>
              <h3 className="font-bold">Fast Delivery</h3>

              <p className="text-sm text-(--muted)">
                Get your orders delivered quickly.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-orange-100 p-3 text-(--accent)">
              <ShieldCheck size={23} />
            </div>

            <div>
              <h3 className="font-bold">Shop With Confidence</h3>

              <p className="text-sm text-(--muted)">
                Your shopping experience matters.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-(--primary-light) p-3 text-(--primary)">
              <WalletCards size={23} />
            </div>

            <div>
              <h3 className="font-bold">Flexible Payment</h3>

              <p className="text-sm text-(--muted)">
                Choose the payment option that suits you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-sm font-bold uppercase tracking-wider text-(--accent)">
              Shopora picks
            </p>

            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
              Featured products
            </h2>

            <p className="mt-2 text-(--muted)">
              Popular picks from our marketplace.
            </p>
          </div>

          <Link
            href="/products"
            className="hidden items-center gap-2 text-sm font-bold text-(--primary) sm:flex"
          >
            View all
            <ArrowRight size={17} />
          </Link>
        </div>

        {featuredProducts.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="group overflow-hidden rounded-3xl border border-(--border) bg-(--surface) transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="aspect-square overflow-hidden bg-gray-100">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-(--muted)">
                      No image
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-(--muted)">
                    Shopora
                  </p>

                  <h3 className="line-clamp-2 font-bold">
                    {product.name}
                  </h3>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xl font-black text-(--primary)">
                      {formatPrice(product.price)}
                    </span>

                    <span className="rounded-full bg-(--accent) px-3 py-1 text-xs font-bold text-white">
                      Shop
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-(--border) bg-(--surface) p-12 text-center">
            <p className="text-(--muted)">
              No products available yet.
            </p>
          </div>
        )}

        <Link
          href="/products"
          className="mt-8 flex items-center justify-center gap-2 rounded-full bg-(--primary) px-6 py-3.5 text-sm font-bold text-white sm:hidden"
        >
          View all products
          <ArrowRight size={17} />
        </Link>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-20">
        <div className="overflow-hidden rounded-4xl bg-(--accent) px-6 py-12 text-center sm:px-10 sm:py-16">
          <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            Ready to find something great?
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-white/85">
            Browse our products and discover a better way to shop.
          </p>

          <Link
            href="/products"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-(--primary) transition hover:scale-105"
          >
            Start shopping
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </main>
  );
}