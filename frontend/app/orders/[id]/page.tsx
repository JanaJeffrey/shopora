"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  MapPin,
  Package,
  Loader2,
} from "lucide-react";
import { getOrderById, type Order } from "../../../lib/orders";
import { formatPrice } from "../../../lib/currency";
import OrderTrackingTimeline from "../../../components/OrderTrackingTimeline";

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getOrderById(Number(params.id));
        setOrder(data);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load this order."
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [params.id]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-(--background)">
        <Loader2
          size={32}
          className="animate-spin text-(--primary)"
        />
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="min-h-screen bg-(--background)">
        <section className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
          <p className="text-lg font-bold text-(--danger)">
            {error || "Order not found."}
          </p>

          <Link
            href="/orders"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-(--primary) px-6 py-3.5 text-sm font-black text-white transition hover:bg-(--primary-dark)"
          >
            Back to your orders
          </Link>
        </section>
      </main>
    );
  }

  const isPaid = order.paymentStatus === "PAID";

  return (
    <main className="min-h-screen bg-(--background)">
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 text-sm font-bold text-(--muted) transition hover:text-(--primary)"
        >
          <ArrowLeft size={17} />
          Back to your orders
        </Link>

        <div className="mt-6 rounded-4xl border border-(--border) bg-(--surface) p-7 shadow-sm sm:p-9">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full ${
                isPaid || order.paymentMethod === "CASH_ON_DELIVERY"
                  ? "bg-(--primary-light) text-(--primary)"
                  : "bg-(--accent-light) text-(--accent-dark)"
              }`}
            >
              {isPaid || order.paymentMethod === "CASH_ON_DELIVERY" ? (
                <CheckCircle2 size={24} />
              ) : (
                <Clock size={24} />
              )}
            </div>

            <div>
              <h1 className="text-xl font-black">
                Order #{order.id}
              </h1>

              <p className="text-sm text-(--muted)">
                Placed on{" "}
                {new Date(order.createdAt).toLocaleDateString(
                  "en-NG",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}
              </p>
            </div>
          </div>

          {/* ============================================================
              TRACKING
          ============================================================ */}

          <div className="mt-7 rounded-2xl border border-(--border) bg-(--surface-soft) p-5">
            <h2 className="mb-5 text-sm font-black">
              Track your order
            </h2>

            <OrderTrackingTimeline order={order} />
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-(--border) bg-(--surface-soft) p-4">
              <p className="text-xs font-black uppercase tracking-wide text-(--muted)">
                Order status
              </p>
              <p className="mt-1 text-sm font-bold">
                {order.status}
              </p>
            </div>

            <div className="rounded-2xl border border-(--border) bg-(--surface-soft) p-4">
              <p className="text-xs font-black uppercase tracking-wide text-(--muted)">
                Payment
              </p>
              <p className="mt-1 text-sm font-bold">
                {order.paymentMethod === "CASH_ON_DELIVERY"
                  ? "Cash on delivery"
                  : `Paystack · ${order.paymentStatus}`}
              </p>
            </div>

            <div className="rounded-2xl border border-(--border) bg-(--surface-soft) p-4">
              <p className="text-xs font-black uppercase tracking-wide text-(--muted)">
                Total
              </p>
              <p className="mt-1 text-sm font-bold">
                {formatPrice(order.totalAmount)}
              </p>
            </div>
          </div>

          <div className="mt-7 flex items-start gap-3 rounded-2xl border border-(--border) p-4">
            <MapPin size={18} className="mt-0.5 text-(--primary)" />

            <div className="text-sm">
              <p className="font-bold">{order.shippingName}</p>
              <p className="text-(--muted)">
                {order.shippingAddress}, {order.shippingCity},{" "}
                {order.shippingState}
              </p>
              <p className="text-(--muted)">{order.shippingPhone}</p>
            </div>
          </div>

          <div className="mt-7">
            <h2 className="flex items-center gap-2 text-sm font-black">
              <Package size={17} />
              Items
            </h2>

            <div className="mt-3 divide-y divide-(--border)">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-3"
                >
                  <div>
                    <p className="text-sm font-bold">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-(--muted)">
                      Qty: {item.quantity}
                    </p>
                  </div>

                  <p className="text-sm font-black">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
