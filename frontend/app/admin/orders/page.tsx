"use client";

import { useEffect, useState } from "react";
import { Loader2, ShoppingBag } from "lucide-react";
import {
  getAdminOrders,
  updateAdminOrderStatus,
  type AdminOrder,
  type OrderStatus,
} from "../../../lib/admin";
import { formatPrice } from "../../../lib/currency";

const statusOptions: OrderStatus[] = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

const statusStyles: Record<OrderStatus, string> = {
  PENDING: "bg-(--accent-light) text-(--accent-dark)",
  PROCESSING: "bg-(--primary-light) text-(--primary)",
  SHIPPED: "bg-blue-50 text-blue-700",
  DELIVERED: "bg-green-50 text-green-700",
  CANCELLED: "bg-red-50 text-red-700",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAdminOrders();
        setOrders(data);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load orders."
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleStatusChange = async (
    order: AdminOrder,
    status: OrderStatus
  ) => {
    setError("");
    setUpdatingId(order.id);

    try {
      await updateAdminOrderStatus(order.id, status);

      // The update response only includes { id, status } (no
      // user/items), so we patch just that field locally rather
      // than replacing the whole order object.
      setOrders((current) =>
        current.map((item) =>
          item.id === order.id ? { ...item, status } : item
        )
      );
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Unable to update order status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-black text-(--text)">Orders</h1>
      <p className="mt-1 text-sm text-(--muted)">
        {orders.length} total
      </p>

      {error && (
        <div
          role="alert"
          className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
        >
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 size={32} className="animate-spin text-(--primary)" />
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-(--border) bg-(--surface) p-12 text-center">
          <ShoppingBag
            size={28}
            className="mx-auto text-(--muted)"
          />
          <p className="mt-3 text-sm text-(--muted)">
            No orders yet.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-(--border) bg-(--surface) p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-black text-(--text)">
                    Order #{order.id}
                  </p>

                  <p className="mt-0.5 text-sm text-(--text-soft)">
                    {order.user.name} · {order.user.email}
                  </p>

                  <p className="mt-0.5 text-xs text-(--muted)">
                    {new Date(order.createdAt).toLocaleString(
                      "en-NG",
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-lg font-black text-(--text)">
                    {formatPrice(order.totalAmount)}
                  </p>

                  <p className="text-xs font-semibold text-(--muted)">
                    {order.paymentMethod === "CASH_ON_DELIVERY"
                      ? "Cash on delivery"
                      : `Paystack · ${order.paymentStatus}`}
                  </p>
                </div>
              </div>

              {/* Items */}
              <div className="mt-4 space-y-1.5 border-t border-(--border) pt-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-(--text-soft)">
                      {item.product.name} × {item.quantity}
                    </span>
                    <span className="font-semibold text-(--text)">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Shipping + status */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-(--border) pt-4">
                <p className="text-xs text-(--muted)">
                  Delivering to {order.shippingAddress},{" "}
                  {order.shippingCity}, {order.shippingState}
                </p>

                <div className="flex items-center gap-2">
                  {updatingId === order.id && (
                    <Loader2
                      size={15}
                      className="animate-spin text-(--muted)"
                    />
                  )}

                  <select
                    value={order.status}
                    disabled={updatingId === order.id}
                    onChange={(event) =>
                      handleStatusChange(
                        order,
                        event.target.value as OrderStatus
                      )
                    }
                    className={`rounded-full border-0 px-3.5 py-1.5 text-xs font-bold outline-none disabled:opacity-60 ${
                      statusStyles[order.status]
                    }`}
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
