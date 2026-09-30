"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Package,
  LayoutGrid,
  ShoppingBag,
  Wallet,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { getAdminProducts } from "../../lib/admin";
import { getAdminOrders, type AdminOrder } from "../../lib/admin";
import { getCategories } from "../../lib/categories";
import { formatPrice } from "../../lib/currency";

const statusStyles: Record<string, string> = {
  PENDING: "bg-(--accent-light) text-(--accent-dark)",
  PROCESSING: "bg-(--primary-light) text-(--primary)",
  SHIPPED: "bg-blue-50 text-blue-700",
  DELIVERED: "bg-green-50 text-green-700",
  CANCELLED: "bg-red-50 text-red-700",
};

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [productCount, setProductCount] = useState(0);
  const [categoryCount, setCategoryCount] = useState(0);
  const [orders, setOrders] = useState<AdminOrder[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [products, categories, adminOrders] =
          await Promise.all([
            getAdminProducts(),
            getCategories(),
            getAdminOrders(),
          ]);

        setProductCount(products.length);
        setCategoryCount(categories.length);
        setOrders(adminOrders);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load dashboard data."
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 size={32} className="animate-spin text-(--primary)" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm font-semibold text-red-700">
        {error}
      </div>
    );
  }

  const totalRevenue = orders.reduce(
    (sum, order) => sum + order.totalAmount,
    0
  );

  const recentOrders = orders.slice(0, 5);

  const stats = [
    {
      label: "Orders",
      value: orders.length,
      icon: ShoppingBag,
      href: "/admin/orders",
    },
    {
      label: "Products",
      value: productCount,
      icon: Package,
      href: "/admin/products",
    },
    {
      label: "Categories",
      value: categoryCount,
      icon: LayoutGrid,
      href: "/admin/categories",
    },
    {
      label: "Total order value",
      value: formatPrice(totalRevenue),
      icon: Wallet,
      href: "/admin/orders",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-black text-(--text)">
        Dashboard
      </h1>
      <p className="mt-1 text-sm text-(--muted)">
        A quick overview of your store.
      </p>

      {/* ============================================================
          STAT CARDS
      ============================================================ */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-2xl border border-(--border) bg-(--surface) p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--primary-light) text-(--primary)">
              <stat.icon size={18} />
            </div>

            <p className="mt-4 text-2xl font-black text-(--text)">
              {stat.value}
            </p>

            <p className="text-xs font-semibold text-(--muted)">
              {stat.label}
            </p>
          </Link>
        ))}
      </div>

      {/* ============================================================
          RECENT ORDERS
      ============================================================ */}
      <div className="mt-8 rounded-2xl border border-(--border) bg-(--surface) shadow-sm">
        <div className="flex items-center justify-between border-b border-(--border) p-5">
          <h2 className="font-black text-(--text)">Recent orders</h2>

          <Link
            href="/admin/orders"
            className="flex items-center gap-1 text-sm font-bold text-(--primary) hover:gap-2"
          >
            View all
            <ArrowRight size={15} />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="p-6 text-sm text-(--muted)">
            No orders yet.
          </p>
        ) : (
          <div className="divide-y divide-(--border)">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex flex-wrap items-center justify-between gap-3 p-5"
              >
                <div>
                  <p className="text-sm font-bold text-(--text)">
                    Order #{order.id} — {order.user.name}
                  </p>
                  <p className="text-xs text-(--muted)">
                    {new Date(order.createdAt).toLocaleDateString(
                      "en-NG",
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-black text-(--text)">
                    {formatPrice(order.totalAmount)}
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      statusStyles[order.status] ||
                      "bg-(--surface-soft) text-(--muted)"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
