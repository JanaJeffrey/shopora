"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

import { useCartStore } from "../../../store/cart-store";
import { useAuthStore } from "../../../store/auth-store";
import { useHasHydrated } from "../../../lib/use-has-hydrated";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type Status = "verifying" | "success" | "error";

export default function CheckoutCallbackPage() {
  return (
    <Suspense fallback={<CallbackLoading />}>
      <CheckoutCallbackContent />
    </Suspense>
  );
}

function CheckoutCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const hasHydrated = useHasHydrated();
  const token = useAuthStore((state) => state.token);
  const clearCart = useCartStore((state) => state.clearCart);

  const reference =
    searchParams.get("reference") || searchParams.get("trxref");

  const [status, setStatus] = useState<Status>("verifying");

  const [message, setMessage] = useState(
    "Confirming your payment with Paystack..."
  );

  const hasVerified = useRef(false);

  useEffect(() => {
    if (!hasHydrated || !reference || !token || hasVerified.current) {
      return;
    }

    hasVerified.current = true;

    async function verifyPayment() {
      try {
        const response = await fetch(
          `${API_URL}/payments/verify/${reference}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message || "Payment verification failed."
          );
        }

        clearCart();

        setStatus("success");
        setMessage(
          "Payment confirmed! Redirecting to your order..."
        );

        const orderId = data?.order?.id;

        window.setTimeout(() => {
          router.push(
            orderId ? `/orders/${orderId}` : "/products"
          );
        }, 1500);
      } catch (error) {
        setStatus("error");

        setMessage(
          error instanceof Error
            ? error.message
            : "We couldn't confirm your payment."
        );
      }
    }

    verifyPayment();
  }, [
    hasHydrated,
    reference,
    token,
    clearCart,
    router,
  ]);

  if (!reference) {
    return (
      <CallbackShell
        icon={<XCircle size={40} />}
        title="We hit a snag"
        message="No payment reference was returned by Paystack."
        showBackLink
        variant="error"
      />
    );
  }

  if (!hasHydrated) {
    return <CallbackLoading />;
  }

  if (!token) {
    return (
      <CallbackShell
        icon={<XCircle size={40} />}
        title="Please log in"
        message="You need to be logged in to confirm this payment."
        showBackLink
        variant="error"
      />
    );
  }

  if (status === "success") {
    return (
      <CallbackShell
        icon={<CheckCircle2 size={40} />}
        title="Payment successful"
        message={message}
        showBackLink={false}
        variant="success"
      />
    );
  }

  if (status === "error") {
    return (
      <CallbackShell
        icon={<XCircle size={40} />}
        title="We hit a snag"
        message={message}
        showBackLink
        variant="error"
      />
    );
  }

  return (
    <CallbackShell
      icon={<Loader2 size={40} className="animate-spin" />}
      title="One moment"
      message={message}
      showBackLink={false}
      variant="loading"
    />
  );
}

function CallbackLoading() {
  return (
    <CallbackShell
      icon={<Loader2 size={40} className="animate-spin" />}
      title="One moment"
      message="Confirming your payment with Paystack..."
      showBackLink={false}
      variant="loading"
    />
  );
}

function CallbackShell({
  icon,
  title,
  message,
  showBackLink,
  variant,
}: {
  icon: ReactNode;
  title: string;
  message: string;
  showBackLink: boolean;
  variant: "loading" | "success" | "error";
}) {
  const iconWrapperClass =
    variant === "success"
      ? "bg-(--primary-light) text-(--primary)"
      : variant === "error"
        ? "bg-red-50 text-red-500"
        : "bg-(--primary-light) text-(--primary)";

  return (
    <main className="min-h-screen bg-(--background)">
      <section className="mx-auto flex max-w-md flex-col px-4 py-24 sm:px-6">
        <div className="rounded-4xl border border-(--border) bg-(--surface) p-9 text-center shadow-sm">
          <div
            className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${iconWrapperClass}`}
          >
            {icon}
          </div>

          <h1 className="mt-5 text-xl font-black text-(--text)">
            {title}
          </h1>

          <p className="mt-2 text-sm leading-6 text-(--muted)">
            {message}
          </p>

          {showBackLink && (
            <Link
              href="/cart"
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-(--primary) px-6 py-3 text-sm font-black text-white transition hover:bg-(--primary-dark)"
            >
              Back to cart
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}