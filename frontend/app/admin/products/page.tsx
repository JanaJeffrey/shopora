"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Loader2,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  PackageX,
} from "lucide-react";
import {
  getAdminProducts,
  deactivateProduct,
  reactivateProduct,
} from "../../../lib/admin";
import type { Product } from "../../../lib/products";
import { formatPrice } from "../../../lib/currency";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busySlug, setBusySlug] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAdminProducts();
        setProducts(data);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load products."
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleToggleStatus = async (product: Product) => {
    setBusySlug(product.slug);

    try {
      const updated =
        product.status === "ACTIVE"
          ? await deactivateProduct(product.slug)
          : await reactivateProduct(product.slug);

      setProducts((current) =>
        current.map((item) =>
          item.slug === updated.slug ? updated : item
        )
      );
    } catch (toggleError) {
      setError(
        toggleError instanceof Error
          ? toggleError.message
          : "Unable to update product status."
      );
    } finally {
      setBusySlug(null);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-(--text)">
            Products
          </h1>
          <p className="mt-1 text-sm text-(--muted)">
            {products.length} total
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 rounded-xl bg-(--primary) px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-purple-200 transition hover:-translate-y-0.5 hover:bg-(--primary-dark)"
        >
          <Plus size={17} />
          Add product
        </Link>
      </div>

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
      ) : products.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-(--border) bg-(--surface) p-12 text-center">
          <PackageX
            size={32}
            className="mx-auto text-(--muted)"
          />
          <p className="mt-3 text-sm text-(--muted)">
            No products yet.
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-(--border) bg-(--surface) shadow-sm">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-(--border) text-xs font-black uppercase tracking-wide text-(--muted)">
              <tr>
                <th className="p-4">Product</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-(--border)">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="flex items-center gap-3 p-4">
                    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-(--surface-soft)">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>
                    <span className="font-bold text-(--text)">
                      {product.name}
                    </span>
                  </td>

                  <td className="p-4 font-bold text-(--text)">
                    {formatPrice(product.price)}
                  </td>

                  <td className="p-4 text-(--text-soft)">
                    {product.stock}
                  </td>

                  <td className="p-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        product.status === "ACTIVE"
                          ? "bg-green-50 text-green-700"
                          : "bg-(--surface-soft) text-(--muted)"
                      }`}
                    >
                      {product.status}
                    </span>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/products/${product.slug}/edit`}
                        aria-label={`Edit ${product.name}`}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-(--muted) transition hover:bg-(--primary-light) hover:text-(--primary)"
                      >
                        <Pencil size={16} />
                      </Link>

                      <button
                        type="button"
                        disabled={busySlug === product.slug}
                        onClick={() => handleToggleStatus(product)}
                        aria-label={
                          product.status === "ACTIVE"
                            ? `Deactivate ${product.name}`
                            : `Reactivate ${product.name}`
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-(--muted) transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                      >
                        {busySlug === product.slug ? (
                          <Loader2
                            size={16}
                            className="animate-spin"
                          />
                        ) : product.status === "ACTIVE" ? (
                          <Trash2 size={16} />
                        ) : (
                          <RotateCcw size={16} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
