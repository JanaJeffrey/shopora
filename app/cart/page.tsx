"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  ShieldCheck,
  Truck,
  Loader2,
} from "lucide-react";
import { useCartStore } from "../../store/cart-store";
import { formatPrice } from "../../lib/currency";
import { useHasHydrated } from "../../lib/use-has-hydrated";

export default function CartPage() {
  const hasHydrated = useHasHydrated();

  const persistedItems = useCartStore((state) => state.items);
  const increaseQuantity = useCartStore(
    (state) => state.increaseQuantity
  );
  const decreaseQuantity = useCartStore(
    (state) => state.decreaseQuantity
  );
  const removeFromCart = useCartStore(
    (state) => state.removeFromCart
  );
  const clearCart = useCartStore(
    (state) => state.clearCart
  );
  const totalItems = useCartStore(
    (state) => state.totalItems
  );
  const subtotal = useCartStore(
    (state) => state.subtotal
  );

  // The cart is persisted to localStorage, which doesn't exist during
  // SSR, so we render a neutral loading state until the client has
  // hydrated to avoid a hydration mismatch (see lib/use-has-hydrated.ts).
  if (!hasHydrated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-(--background)">
        <Loader2
          size={32}
          className="animate-spin text-(--primary)"
        />
      </main>
    );
  }

  const items = persistedItems;
  const itemCount = totalItems();
  const cartSubtotal = subtotal();

  /*
   * Delivery is intentionally kept simple for now.
   * We'll replace this with the real checkout/shipping
   * calculation later.
   */
  const deliveryFee =
    cartSubtotal > 0 ? 2500 : 0;

  const total = cartSubtotal + deliveryFee;

  return (
    <main className="min-h-screen bg-(--background)">
      {/* ============================================================
          HEADER
      ============================================================ */}
      <section className="border-b border-(--border) bg-(--surface)">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm font-bold text-(--muted) transition hover:text-(--primary)"
          >
            <ArrowLeft size={17} />
            Continue shopping
          </Link>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-(--accent-dark)">
                Your Shopora Cart
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                Shopping Cart
              </h1>

              <p className="mt-2 text-sm text-(--muted)">
                Review your items before checking out.
              </p>
            </div>

            {items.length > 0 && (
              <p className="text-sm font-bold text-(--muted)">
                {itemCount}{" "}
                {itemCount === 1 ? "item" : "items"}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ============================================================
          EMPTY CART
      ============================================================ */}
      {items.length === 0 ? (
        <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="rounded-[2rem] border border-(--border) bg-(--surface) px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-(--primary-light) text-(--primary)">
              <ShoppingBag size={34} />
            </div>

            <h2 className="mt-6 text-2xl font-black sm:text-3xl">
              Your cart is empty
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-(--muted)">
              Looks like you haven&apos;t added anything yet.
              Discover something you love and add it to your
              Shopora cart.
            </p>

            <Link
              href="/products"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-(--primary) px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-purple-200 transition hover:-translate-y-0.5 hover:bg-(--primary-dark)"
            >
              Start shopping
              <ShoppingBag size={18} />
            </Link>
          </div>
        </section>
      ) : (
        /* ============================================================
           CART CONTENT
        ============================================================ */
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            {/* ========================================================
                CART ITEMS
            ======================================================== */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black sm:text-2xl">
                    Cart items
                  </h2>

                  <p className="mt-1 text-sm text-(--muted)">
                    {itemCount}{" "}
                    {itemCount === 1
                      ? "product"
                      : "products"}{" "}
                    in your cart
                  </p>
                </div>

                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs font-bold text-(--danger) transition hover:opacity-70"
                >
                  Clear cart
                </button>
              </div>

              <div className="space-y-4">
                {items.map((item) => (
                  <article
                    key={item.id}
                    className="overflow-hidden rounded-2xl border border-(--border) bg-(--surface) shadow-sm transition hover:shadow-md sm:rounded-3xl"
                  >
                    <div className="flex gap-4 p-4 sm:gap-6 sm:p-5">
                      {/* Product image */}
                      <Link
                        href={`/products/${item.slug}`}
                        className="h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-(--surface-soft) sm:h-36 sm:w-36"
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover transition duration-300 hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs font-bold text-(--muted)">
                            No image
                          </div>
                        )}
                      </Link>

                      {/* Product information */}
                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-(--muted)">
                              Shopora
                            </p>

                            <Link
                              href={`/products/${item.slug}`}
                            >
                              <h3 className="mt-1 line-clamp-2 text-sm font-black leading-5 transition hover:text-(--primary) sm:text-base">
                                {item.name}
                              </h3>
                            </Link>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              removeFromCart(item.id)
                            }
                            aria-label={`Remove ${item.name} from cart`}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-(--muted) transition hover:bg-red-50 hover:text-(--danger)"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>

                        <div className="mt-auto pt-4">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="text-lg font-black text-(--primary)">
                                {formatPrice(item.price)}
                              </p>

                              <p className="mt-0.5 text-xs font-semibold text-(--muted)">
                                {item.stock} available
                              </p>
                            </div>

                            {/* Quantity controls */}
                            <div className="flex items-center overflow-hidden rounded-xl border border-(--border)">
                              <button
                                type="button"
                                onClick={() =>
                                  decreaseQuantity(item.id)
                                }
                                className="flex h-10 w-10 items-center justify-center bg-(--surface-soft) transition hover:bg-(--primary-light) hover:text-(--primary)"
                                aria-label="Decrease quantity"
                              >
                                <Minus size={15} />
                              </button>

                              <span className="flex h-10 min-w-10 items-center justify-center border-x border-(--border) px-2 text-sm font-black">
                                {item.quantity}
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  increaseQuantity(item.id)
                                }
                                disabled={
                                  item.quantity >= item.stock
                                }
                                className="flex h-10 w-10 items-center justify-center bg-(--surface-soft) transition hover:bg-(--primary-light) hover:text-(--primary) disabled:cursor-not-allowed disabled:opacity-30"
                                aria-label="Increase quantity"
                              >
                                <Plus size={15} />
                              </button>
                            </div>
                          </div>

                          <div className="mt-3 flex items-center justify-between border-t border-(--border) pt-3">
                            <span className="text-xs font-semibold text-(--muted)">
                              Item total
                            </span>

                            <span className="text-sm font-black text-(--text)">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* Trust features */}
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-2xl border border-(--border) bg-(--surface) p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--primary-light) text-(--primary)">
                    <ShieldCheck size={19} />
                  </div>

                  <div>
                    <p className="text-sm font-black">
                      Secure shopping
                    </p>

                    <p className="text-xs text-(--muted)">
                      Your shopping experience is protected.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-(--border) bg-(--surface) p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--accent-light) text-(--accent-dark)">
                    <Truck size={19} />
                  </div>

                  <div>
                    <p className="text-sm font-black">
                      Fast delivery
                    </p>

                    <p className="text-xs text-(--muted)">
                      Get your products delivered to you.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================================
                ORDER SUMMARY
            ======================================================== */}
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div className="overflow-hidden rounded-[2rem] border border-(--border) bg-(--surface) shadow-sm">
                <div className="bg-linear-to-br from-(--primary-soft) to-(--accent-soft) p-6">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-(--primary)">
                    Order summary
                  </p>

                  <h2 className="mt-2 text-2xl font-black">
                    Almost yours.
                  </h2>
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-(--muted)">
                        Subtotal
                      </span>

                      <span className="font-bold">
                        {formatPrice(cartSubtotal)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-(--muted)">
                        Delivery
                      </span>

                      <span className="font-bold">
                        {formatPrice(deliveryFee)}
                      </span>
                    </div>
                  </div>

                  <div className="my-5 h-px bg-(--border)" />

                  <div className="flex items-center justify-between">
                    <span className="text-base font-black">
                      Total
                    </span>

                    <span className="text-2xl font-black text-(--primary)">
                      {formatPrice(total)}
                    </span>
                  </div>

                  <Link
                    href="/checkout"
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-(--accent) px-5 py-4 text-sm font-black text-white shadow-lg shadow-orange-100 transition hover:-translate-y-0.5 hover:bg-(--accent-dark)"
                  >
                    Proceed to checkout
                    <Plus
                      size={17}
                      className="rotate-45"
                    />
                  </Link>

                  <Link
                    href="/products"
                    className="mt-3 flex w-full items-center justify-center rounded-xl border border-(--border) px-5 py-3.5 text-sm font-bold transition hover:border-(--primary) hover:bg-(--primary-soft) hover:text-(--primary)"
                  >
                    Continue shopping
                  </Link>

                  <p className="mt-5 text-center text-[11px] leading-5 text-(--muted)">
                    Delivery charges may vary depending on
                    your location. Final charges will be shown
                    during checkout.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </section>
      )}
    </main>
  );
}