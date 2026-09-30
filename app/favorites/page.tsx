"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Heart, Loader2 } from "lucide-react";
import { getFavorites } from "../../lib/favorites";
import type { Product } from "../../lib/products";
import { useAuthStore } from "../../store/auth-store";
import { useHasHydrated } from "../../lib/use-has-hydrated";
import ProductCard from "../../components/ProductCard";

export default function FavoritesPage() {
  const hasHydrated = useHasHydrated();
  const token = useAuthStore((state) => state.token);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!hasHydrated || !token) {
      return;
    }

    const load = async () => {
      try {
        const data = await getFavorites();
        setProducts(data);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load your favorites."
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [hasHydrated, token]);

  // Waiting for client hydration before reading the persisted auth
  // token, to avoid a hydration mismatch (see lib/use-has-hydrated.ts).
  if (!hasHydrated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-(--background)">
        <Loader2 size={32} className="animate-spin text-(--primary)" />
      </main>
    );
  }

  if (!token) {
    return (
      <main className="min-h-screen bg-(--background)">
        <section className="mx-auto max-w-md px-4 py-24 text-center sm:px-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-(--primary-light) text-(--primary)">
            <Heart size={28} />
          </div>

          <h1 className="mt-5 text-xl font-black text-(--text)">
            Log in to see your favorites
          </h1>

          <p className="mt-2 text-sm text-(--muted)">
            Your favorites are saved to your account.
          </p>

          <Link
            href="/login"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-(--primary) px-6 py-3.5 text-sm font-black text-white transition hover:bg-(--primary-dark)"
          >
            Log in
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-(--background)">
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm font-bold text-(--muted) transition hover:text-(--primary)"
        >
          <ArrowLeft size={16} />
          Continue shopping
        </Link>

        <h1 className="mt-4 text-3xl font-black tracking-tight text-(--text) sm:text-4xl">
          Your favorites
        </h1>

        <p className="mt-2 text-sm text-(--muted)">
          {products.length}{" "}
          {products.length === 1 ? "product" : "products"} saved
        </p>

        {loading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <Loader2
              size={32}
              className="animate-spin text-(--primary)"
            />
          </div>
        ) : error ? (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        ) : products.length === 0 ? (
          <div className="mt-8 rounded-[2rem] border border-(--border) bg-(--surface) px-6 py-20 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-(--primary-light) text-(--primary)">
              <Heart size={28} />
            </div>

            <h2 className="mt-5 text-2xl font-black text-(--text)">
              No favorites yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-(--muted)">
              Tap the heart icon on any product to save it here for
              later.
            </p>

            <Link
              href="/products"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-(--primary) px-6 py-3 text-sm font-black text-white transition hover:bg-(--primary-dark)"
            >
              Browse products
              <ArrowRight size={17} />
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
