"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import ProductForm from "../../../../../components/admin/ProductForm";
import { getAdminProducts } from "../../../../../lib/admin";
import type { Product } from "../../../../../lib/products";

export default function EditProductPage() {
  const params = useParams<{ slug: string }>();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        // The public /products/:slug endpoint 404s on deactivated
        // products, so we pull from the admin list (which includes
        // every status) and find the match client-side instead.
        const products = await getAdminProducts();
        const match = products.find(
          (item) => item.slug === params.slug
        );

        if (!match) {
          setError("Product not found.");
        } else {
          setProduct(match);
        }
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load this product."
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [params.slug]);

  return (
    <div>
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-2 text-sm font-bold text-(--muted) transition hover:text-(--primary)"
      >
        <ArrowLeft size={16} />
        Back to products
      </Link>

      <h1 className="mt-4 text-2xl font-black text-(--text)">
        Edit product
      </h1>

      <div className="mt-6 max-w-2xl">
        {loading ? (
          <div className="flex min-h-[30vh] items-center justify-center">
            <Loader2
              size={32}
              className="animate-spin text-(--primary)"
            />
          </div>
        ) : error || !product ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error || "Product not found."}
          </div>
        ) : (
          <ProductForm mode="edit" product={product} />
        )}
      </div>
    </div>
  );
}
