"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  LockKeyhole,
  MapPin,
  ShieldCheck,
  ShoppingBag,
  Truck,
  Loader2,
} from "lucide-react";
import { useCartStore } from "../../store/cart-store";
import { useAuthStore } from "../../store/auth-store";
import { useHasHydrated } from "../../lib/use-has-hydrated";
import { formatPrice } from "../../lib/currency";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function CheckoutPage() {
  const router = useRouter();

  const hasHydrated = useHasHydrated();

  const items = useCartStore((state) => state.items);
  const totalItems = useCartStore((state) => state.totalItems);
  const subtotal = useCartStore((state) => state.subtotal);
  const clearCart = useCartStore((state) => state.clearCart);

  const token = useAuthStore((state) => state.token);

  const [paymentMethod, setPaymentMethod] =
    useState<"CARD" | "CASH_ON_DELIVERY">("CARD");

  const [shippingName, setShippingName] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingState, setShippingState] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const itemCount = totalItems();
  const cartSubtotal = subtotal();

  const deliveryFee = cartSubtotal > 0 ? 2500 : 0;
  const total = cartSubtotal + deliveryFee;

  // ============================================================
  // SYNC LOCAL CART -> BACKEND CART
  //
  // The cart on this page lives in the browser (zustand/localStorage)
  // so people can browse without an account. The backend, however,
  // is the source of truth for prices/stock when we actually charge
  // someone, so /api/payments/initialize and /api/orders/checkout
  // both read from the authenticated user's *backend* cart. We push
  // the local cart into the backend cart right before checking out.
  // ============================================================

  const syncCartToBackend = async () => {
    await fetch(`${API_URL}/cart`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    for (const item of items) {
      const response = await fetch(`${API_URL}/cart/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: item.id,
          quantity: item.quantity,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        throw new Error(
          data?.message ||
            `Unable to add ${item.name} to your cart.`
        );
      }
    }
  };

  // ============================================================
  // CHECKOUT
  // ============================================================

  const handleCheckout = async () => {
    setError("");

    // ----------------------------------------------------------
    // Require login
    // ----------------------------------------------------------

    if (!token) {
      router.push("/login");
      return;
    }

    // ----------------------------------------------------------
    // Validate cart
    // ----------------------------------------------------------

    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    // ----------------------------------------------------------
    // Validate shipping information
    // ----------------------------------------------------------

    if (
      !shippingName.trim() ||
      !shippingPhone.trim() ||
      !shippingAddress.trim() ||
      !shippingCity.trim() ||
      !shippingState.trim()
    ) {
      setError("Please complete all delivery information.");
      return;
    }

    try {
      setLoading(true);

      // ========================================================
      // PUSH THE LOCAL CART INTO THE BACKEND CART
      //
      // Both /payments/initialize and /orders/checkout read from
      // the authenticated user's backend cart, not this page's
      // local (zustand) cart, so this has to happen first.
      // ========================================================

      await syncCartToBackend();

      // ========================================================
      // PAYSTACK PAYMENT
      // ========================================================

      if (paymentMethod === "CARD") {
        const response = await fetch(
          `${API_URL}/payments/initialize`,
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },

            body: JSON.stringify({
              shippingName: shippingName.trim(),
              shippingPhone: shippingPhone.trim(),
              shippingAddress: shippingAddress.trim(),
              shippingCity: shippingCity.trim(),
              shippingState: shippingState.trim(),
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Unable to initialize Paystack payment."
          );
        }

        // ------------------------------------------------------
        // The backend responds with `authorizationUrl` (see
        // payment.controller.ts) — not `authorization_url`.
        // ------------------------------------------------------

        const authorizationUrl = data?.authorizationUrl;

        if (!authorizationUrl) {
          console.error(
            "Paystack authorization URL missing:",
            data
          );

          throw new Error(
            "Paystack did not return a checkout URL."
          );
        }

        // ------------------------------------------------------
        // Redirect customer to Paystack. The local cart is left
        // alone until we come back through /checkout/callback and
        // the backend confirms the payment actually succeeded.
        // ------------------------------------------------------

        window.location.assign(authorizationUrl);

        return;
      }

      // ========================================================
      // CASH ON DELIVERY
      // ========================================================

      const response = await fetch(
        `${API_URL}/orders/checkout`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            paymentMethod: "CASH_ON_DELIVERY",

            shippingName: shippingName.trim(),
            shippingPhone: shippingPhone.trim(),
            shippingAddress: shippingAddress.trim(),
            shippingCity: shippingCity.trim(),
            shippingState: shippingState.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Unable to place your order."
        );
      }

      // --------------------------------------------------------
      // Redirect to order
      // --------------------------------------------------------

      if (!data?.order?.id) {
        throw new Error(
          "Order was created but no order ID was returned."
        );
      }

      clearCart();

      window.location.assign(
        `/orders/${data.order.id}`
      );
    } catch (checkoutError) {
      console.error("Checkout error:", checkoutError);

      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "Something went wrong during checkout."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // WAITING FOR CLIENT HYDRATION
  //
  // The cart/auth stores are persisted to localStorage, which the
  // server can't see. Render a neutral loading state until the
  // client has hydrated so this doesn't mismatch the server's HTML
  // (see lib/use-has-hydrated.ts).
  // ============================================================

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

  // ============================================================
  // EMPTY CART
  // ============================================================

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-(--background)">
        <section className="mx-auto max-w-2xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-(--border) bg-(--surface) px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-(--primary-light) text-(--primary)">
              <ShoppingBag size={34} />
            </div>

            <h1 className="mt-6 text-3xl font-black">
              Your cart is empty
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-(--muted)">
              Add some products to your cart before
              proceeding to checkout.
            </p>

            <Link
              href="/products"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-(--primary) px-6 py-3.5 text-sm font-black text-white transition hover:bg-(--primary-dark)"
            >
              Browse products
            </Link>
          </div>
        </section>
      </main>
    );
  }

  // ============================================================
  // CHECKOUT PAGE
  // ============================================================

  return (
    <main className="min-h-screen bg-(--background)">
      {/* ========================================================
          HEADER
      ======================================================== */}

      <section className="border-b border-(--border) bg-(--surface)">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-sm font-bold text-(--muted) transition hover:text-(--primary)"
          >
            <ArrowLeft size={17} />
            Back to cart
          </Link>

          <div className="mt-6">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-(--accent-dark)">
              Shopora Checkout
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
              Complete your order
            </h1>

            <p className="mt-2 text-sm text-(--muted)">
              Enter your delivery details and choose your
              preferred payment method.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================
          CONTENT
      ======================================================== */}

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">

          {/* ====================================================
              LEFT
          ==================================================== */}

          <div className="space-y-6">

            {/* ==================================================
                SHIPPING
            ================================================== */}

            <div className="rounded-[2rem] border border-(--border) bg-(--surface) p-5 shadow-sm sm:p-7">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-(--primary-light) text-(--primary)">
                  <MapPin size={20} />
                </div>

                <div>
                  <h2 className="text-xl font-black">
                    Delivery information
                  </h2>

                  <p className="mt-0.5 text-xs text-(--muted)">
                    Where should we deliver your order?
                  </p>
                </div>
              </div>

              <div className="mt-7 grid gap-5 sm:grid-cols-2">

                {/* Full name */}

                <div className="sm:col-span-2">
                  <label
                    htmlFor="shippingName"
                    className="text-sm font-bold"
                  >
                    Full name
                  </label>

                  <input
                    id="shippingName"
                    value={shippingName}
                    onChange={(event) =>
                      setShippingName(event.target.value)
                    }
                    placeholder="Enter your full name"
                    className="mt-2 h-12 w-full rounded-xl border border-(--border) bg-(--surface-soft) px-4 text-sm outline-none transition focus:border-(--primary) focus:ring-4 focus:ring-(--primary-light)"
                  />
                </div>

                {/* Phone */}

                <div>
                  <label
                    htmlFor="shippingPhone"
                    className="text-sm font-bold"
                  >
                    Phone number
                  </label>

                  <input
                    id="shippingPhone"
                    type="tel"
                    value={shippingPhone}
                    onChange={(event) =>
                      setShippingPhone(event.target.value)
                    }
                    placeholder="08012345678"
                    className="mt-2 h-12 w-full rounded-xl border border-(--border) bg-(--surface-soft) px-4 text-sm outline-none transition focus:border-(--primary) focus:ring-4 focus:ring-(--primary-light)"
                  />
                </div>

                {/* State */}

                <div>
                  <label
                    htmlFor="shippingState"
                    className="text-sm font-bold"
                  >
                    State
                  </label>

                  <input
                    id="shippingState"
                    value={shippingState}
                    onChange={(event) =>
                      setShippingState(event.target.value)
                    }
                    placeholder="e.g. FCT"
                    className="mt-2 h-12 w-full rounded-xl border border-(--border) bg-(--surface-soft) px-4 text-sm outline-none transition focus:border-(--primary) focus:ring-4 focus:ring-(--primary-light)"
                  />
                </div>

                {/* City */}

                <div>
                  <label
                    htmlFor="shippingCity"
                    className="text-sm font-bold"
                  >
                    City
                  </label>

                  <input
                    id="shippingCity"
                    value={shippingCity}
                    onChange={(event) =>
                      setShippingCity(event.target.value)
                    }
                    placeholder="e.g. Abuja"
                    className="mt-2 h-12 w-full rounded-xl border border-(--border) bg-(--surface-soft) px-4 text-sm outline-none transition focus:border-(--primary) focus:ring-4 focus:ring-(--primary-light)"
                  />
                </div>

                {/* Address */}

                <div>
                  <label
                    htmlFor="shippingAddress"
                    className="text-sm font-bold"
                  >
                    Delivery address
                  </label>

                  <input
                    id="shippingAddress"
                    value={shippingAddress}
                    onChange={(event) =>
                      setShippingAddress(event.target.value)
                    }
                    placeholder="House number, street, area"
                    className="mt-2 h-12 w-full rounded-xl border border-(--border) bg-(--surface-soft) px-4 text-sm outline-none transition focus:border-(--primary) focus:ring-4 focus:ring-(--primary-light)"
                  />
                </div>
              </div>
            </div>

            {/* ==================================================
                PAYMENT
            ================================================== */}

            <div className="rounded-[2rem] border border-(--border) bg-(--surface) p-5 shadow-sm sm:p-7">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-(--accent-light) text-(--accent-dark)">
                  <LockKeyhole size={20} />
                </div>

                <div>
                  <h2 className="text-xl font-black">
                    Payment method
                  </h2>

                  <p className="mt-0.5 text-xs text-(--muted)">
                    Choose how you&apos;d like to pay.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">

                {/* Paystack */}

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setPaymentMethod("CARD")}
                  className={`rounded-2xl border p-5 text-left transition ${
                    paymentMethod === "CARD"
                      ? "border-(--primary) bg-(--primary-soft) ring-2 ring-(--primary-light)"
                      : "border-(--border) bg-(--surface-soft) hover:border-(--primary)"
                  }`}
                >
                  <p className="font-black">
                    Pay with Paystack
                  </p>

                  <p className="mt-1 text-xs leading-5 text-(--muted)">
                    Pay securely with card, bank transfer or
                    other supported Paystack methods.
                  </p>

                  {paymentMethod === "CARD" && (
                    <span className="mt-3 inline-block text-xs font-black text-(--primary)">
                      Selected
                    </span>
                  )}
                </button>

                {/* COD */}

                <button
                  type="button"
                  disabled={loading}
                  onClick={() =>
                    setPaymentMethod("CASH_ON_DELIVERY")
                  }
                  className={`rounded-2xl border p-5 text-left transition ${
                    paymentMethod === "CASH_ON_DELIVERY"
                      ? "border-(--accent) bg-(--accent-soft) ring-2 ring-(--accent-light)"
                      : "border-(--border) bg-(--surface-soft) hover:border-(--accent)"
                  }`}
                >
                  <p className="font-black">
                    Cash on Delivery
                  </p>

                  <p className="mt-1 text-xs leading-5 text-(--muted)">
                    Pay when your order is delivered to you.
                  </p>

                  {paymentMethod === "CASH_ON_DELIVERY" && (
                    <span className="mt-3 inline-block text-xs font-black text-(--accent-dark)">
                      Selected
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (
              <div
                role="alert"
                className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
              >
                {error}
              </div>
            )}

            {/* ==================================================
                TRUST
            ================================================== */}

            <div className="grid gap-3 sm:grid-cols-2">

              <div className="flex items-center gap-3 rounded-2xl border border-(--border) bg-(--surface) p-4">
                <ShieldCheck
                  size={21}
                  className="text-(--primary)"
                />

                <div>
                  <p className="text-sm font-black">
                    Secure checkout
                  </p>

                  <p className="text-xs text-(--muted)">
                    Your payment is processed securely by
                    Paystack.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-(--border) bg-(--surface) p-4">
                <Truck
                  size={21}
                  className="text-(--accent-dark)"
                />

                <div>
                  <p className="text-sm font-black">
                    Reliable delivery
                  </p>

                  <p className="text-xs text-(--muted)">
                    We&apos;ll deliver your order to your address.
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* ====================================================
              ORDER SUMMARY
          ==================================================== */}

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="overflow-hidden rounded-[2rem] border border-(--border) bg-(--surface) shadow-sm">

              <div className="bg-linear-to-br from-(--primary-soft) to-(--accent-soft) p-6">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-(--primary)">
                  Your order
                </p>

                <h2 className="mt-2 text-2xl font-black">
                  {itemCount}{" "}
                  {itemCount === 1 ? "item" : "items"}
                </h2>
              </div>

              <div className="p-6">

                <div className="max-h-72 space-y-4 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-3"
                    >
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-(--surface-soft)">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-bold">
                          {item.name}
                        </p>

                        <p className="mt-1 text-xs text-(--muted)">
                          Qty: {item.quantity}
                        </p>
                      </div>

                      <p className="text-sm font-black">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="my-6 h-px bg-(--border)" />

                <div className="space-y-3">

                  <div className="flex justify-between text-sm">
                    <span className="text-(--muted)">
                      Subtotal
                    </span>

                    <span className="font-bold">
                      {formatPrice(cartSubtotal)}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-(--muted)">
                      Delivery
                    </span>

                    <span className="font-bold">
                      {formatPrice(deliveryFee)}
                    </span>
                  </div>

                </div>

                <div className="my-5 h-px bg-(--border)" />

                <div className="flex items-center justify-between">
                  <span className="font-black">
                    Total
                  </span>

                  <span className="text-2xl font-black text-(--primary)">
                    {formatPrice(total)}
                  </span>
                </div>

                {/* ==================================================
                    CHECKOUT BUTTON
                ================================================== */}

                <button
                  type="button"
                  disabled={loading}
                  onClick={handleCheckout}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-(--primary) px-5 py-4 text-sm font-black text-white shadow-lg shadow-purple-200 transition hover:-translate-y-0.5 hover:bg-(--primary-dark) disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />

                      {paymentMethod === "CARD"
                        ? "Connecting to Paystack..."
                        : "Placing order..."}
                    </>
                  ) : (
                    <>
                      {paymentMethod === "CARD"
                        ? "Continue to Paystack"
                        : "Place Order"}
                    </>
                  )}
                </button>

                <p className="mt-4 text-center text-[11px] leading-5 text-(--muted)">
                  By continuing, you agree to Shopora&apos;s
                  terms and checkout conditions.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}