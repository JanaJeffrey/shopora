"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Loader2,
  Package,
  ShoppingBag,
} from "lucide-react";
import { getMyOrders, type Order, type OrderStatus } from "../../lib/orders";
import { formatPrice } from "../../lib/currency";
import { useAuthStore } from "../../store/auth-store";
import { useHasHydrated } from "../../lib/use-has-hydrated";

const statusStyles: Record<OrderStatus, string> = {
  PENDING: "bg-(--accent-light) text-(--accent-dark)",
  PROCESSING: "bg-(--primary-light) text-(--primary)",
  SHIPPED: "bg-blue-50 text-blue-700",
  DELIVERED: "bg-green-50 text-green-700",
  CANCELLED: "bg-red-50 text-red-700",
};

export default function OrdersPage() {
  const hasHydrated = useHasHydrated();
  const token = useAuthStore((state) => state.token);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!hasHydrated || !token) {
      return;
    }

    const load = async () => {
      try {
        const data = await getMyOrders();
        setOrders(data);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load your orders."
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
            <ShoppingBag size={28} />
          </div>

          <h1 className="mt-5 text-xl font-black text-(--text)">
            Log in to see your orders
          </h1>

          <p className="mt-2 text-sm text-(--muted)">
            Your order history is saved to your account.
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
      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-black tracking-tight text-(--text) sm:text-4xl">
          Your orders
        </h1>

        <p className="mt-2 text-sm text-(--muted)">
          {orders.length} {orders.length === 1 ? "order" : "orders"}
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
        ) : orders.length === 0 ? (
          <div className="mt-8 rounded-[2rem] border border-(--border) bg-(--surface) px-6 py-20 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-(--primary-light) text-(--primary)">
              <Package size={28} />
            </div>

            <h2 className="mt-5 text-2xl font-black text-(--text)">
              No orders yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-(--muted)">
              When you place an order, it&apos;ll show up here.
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
          <div className="mt-8 space-y-3">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-(--border) bg-(--surface) p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-(--primary) hover:shadow-md"
              >
                <div>
                  <p className="font-black text-(--text)">
                    Order #{order.id}
                  </p>

                  <p className="mt-0.5 text-xs text-(--muted)">
                    {new Date(order.createdAt).toLocaleDateString(
                      "en-NG",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}{" "}
                    · {order.items.length}{" "}
                    {order.items.length === 1 ? "item" : "items"}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-black text-(--text)">
                    {formatPrice(order.totalAmount)}
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyles[order.status]}`}
                  >
                    {order.status}
                  </span>

                  <ArrowRight size={16} className="text-(--muted)" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
