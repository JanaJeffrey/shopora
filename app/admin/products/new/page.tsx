import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ProductForm from "../../../../components/admin/ProductForm";

export default function NewProductPage() {
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
        Add product
      </h1>

      <div className="mt-6 max-w-2xl">
        <ProductForm mode="create" />
      </div>
    </div>
  );
}
