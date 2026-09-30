"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2, Save, X } from "lucide-react";
import {
  createProduct,
  updateProduct,
  type ProductInput,
} from "../../lib/admin";
import { getCategories, type Category } from "../../lib/categories";
import { uploadImage } from "../../lib/upload";
import type { Product } from "../../lib/products";

interface ProductFormProps {
  mode: "create" | "edit";
  product?: Product;
}

export default function ProductForm({
  mode,
  product,
}: ProductFormProps) {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(
    product?.description ?? ""
  );
  const [price, setPrice] = useState(
    product ? String(product.price) : ""
  );
  const [compareAtPrice, setCompareAtPrice] = useState(
    product?.compareAtPrice ? String(product.compareAtPrice) : ""
  );
  const [stock, setStock] = useState(
    product ? String(product.stock) : ""
  );
  const [image, setImage] = useState(product?.image ?? "");
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [categoryId, setCategoryId] = useState(
    product ? String(product.categoryId) : ""
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);

        // Default to the first category on create, if none picked yet.
        if (mode === "create" && !categoryId && data.length > 0) {
          setCategoryId(String(data[0].id));
        }
      } catch {
        setError(
          "Unable to load categories. Create a category first."
        );
      } finally {
        setCategoriesLoading(false);
      }
    };

    loadCategories();
    // categoryId intentionally excluded — this only runs once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const handleImageSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    event.target.value = ""; // allow re-selecting the same file later

    if (!file) {
      return;
    }

    setImageError("");
    setImageUploading(true);

    try {
      const url = await uploadImage(file);
      setImage(url);
    } catch (uploadError) {
      setImageError(
        uploadError instanceof Error
          ? uploadError.message
          : "Failed to upload image."
      );
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Product name is required.");
      return;
    }

    const numericPrice = Number(price);
    const numericStock = Number(stock);
    const numericCategoryId = Number(categoryId);

    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      setError("Enter a valid price.");
      return;
    }

    if (!Number.isInteger(numericStock) || numericStock < 0) {
      setError("Enter a valid stock quantity.");
      return;
    }

    if (!Number.isInteger(numericCategoryId)) {
      setError("Choose a category.");
      return;
    }

    const input: ProductInput = {
      name: name.trim(),
      description: description.trim(),
      price: numericPrice,
      compareAtPrice: compareAtPrice.trim()
        ? Number(compareAtPrice)
        : null,
      stock: numericStock,
      image: image.trim(),
      categoryId: numericCategoryId,
    };

    try {
      setSaving(true);

      if (mode === "create") {
        await createProduct(input);
      } else if (product) {
        await updateProduct(product.slug, input);
      }

      router.push("/admin/products");
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl border border-(--border) bg-(--surface) p-6 shadow-sm"
    >
      <div>
        <label htmlFor="name" className="text-sm font-bold">
          Product name
        </label>

        <input
          id="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Wireless Headphones"
          className="mt-2 h-11 w-full rounded-xl border border-(--border) bg-(--surface-soft) px-4 text-sm outline-none transition focus:border-(--primary) focus:ring-4 focus:ring-(--primary-light)"
        />
      </div>

      <div>
        <label htmlFor="description" className="text-sm font-bold">
          Description
        </label>

        <textarea
          id="description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={4}
          placeholder="Describe the product..."
          className="mt-2 w-full resize-none rounded-xl border border-(--border) bg-(--surface-soft) px-4 py-3 text-sm outline-none transition focus:border-(--primary) focus:ring-4 focus:ring-(--primary-light)"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label htmlFor="price" className="text-sm font-bold">
            Price (NGN)
          </label>

          <input
            id="price"
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            placeholder="0.00"
            className="mt-2 h-11 w-full rounded-xl border border-(--border) bg-(--surface-soft) px-4 text-sm outline-none transition focus:border-(--primary) focus:ring-4 focus:ring-(--primary-light)"
          />
        </div>

        <div>
          <label
            htmlFor="compareAtPrice"
            className="text-sm font-bold"
          >
            Compare-at price (optional)
          </label>

          <input
            id="compareAtPrice"
            type="number"
            min="0"
            step="0.01"
            value={compareAtPrice}
            onChange={(event) =>
              setCompareAtPrice(event.target.value)
            }
            placeholder="Original price, if discounted"
            className="mt-2 h-11 w-full rounded-xl border border-(--border) bg-(--surface-soft) px-4 text-sm outline-none transition focus:border-(--primary) focus:ring-4 focus:ring-(--primary-light)"
          />
        </div>

        <div>
          <label htmlFor="stock" className="text-sm font-bold">
            Stock quantity
          </label>

          <input
            id="stock"
            type="number"
            min="0"
            step="1"
            value={stock}
            onChange={(event) => setStock(event.target.value)}
            placeholder="0"
            className="mt-2 h-11 w-full rounded-xl border border-(--border) bg-(--surface-soft) px-4 text-sm outline-none transition focus:border-(--primary) focus:ring-4 focus:ring-(--primary-light)"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-bold">Product image</label>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleImageSelect}
          className="hidden"
        />

        {image ? (
          <div className="relative mt-2 h-40 w-40 overflow-hidden rounded-xl border border-(--border)">
            <img
              src={image}
              alt="Product preview"
              className="h-full w-full object-cover"
            />

            <button
              type="button"
              onClick={() => setImage("")}
              aria-label="Remove image"
              className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={imageUploading}
            className="mt-2 flex h-40 w-40 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-(--border) text-(--muted) transition hover:border-(--primary) hover:text-(--primary) disabled:cursor-not-allowed disabled:opacity-60"
          >
            {imageUploading ? (
              <>
                <Loader2 size={22} className="animate-spin" />
                <span className="text-xs font-semibold">
                  Uploading...
                </span>
              </>
            ) : (
              <>
                <ImagePlus size={22} />
                <span className="text-xs font-semibold">
                  Click to upload
                </span>
              </>
            )}
          </button>
        )}

        {imageError && (
          <p className="mt-2 text-xs font-semibold text-red-600">
            {imageError}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="category" className="text-sm font-bold">
          Category
        </label>

        {categoriesLoading ? (
          <div className="mt-2 flex h-11 items-center px-1 text-sm text-(--muted)">
            <Loader2 size={16} className="mr-2 animate-spin" />
            Loading categories...
          </div>
        ) : categories.length === 0 ? (
          <p className="mt-2 text-sm text-(--muted)">
            No categories yet — create one first on the Categories
            page.
          </p>
        ) : (
          <select
            id="category"
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            className="mt-2 h-11 w-full rounded-xl border border-(--border) bg-(--surface-soft) px-4 text-sm outline-none transition focus:border-(--primary) focus:ring-4 focus:ring-(--primary-light)"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={saving || imageUploading || categories.length === 0}
        className="flex items-center gap-2 rounded-xl bg-(--primary) px-5 py-3 text-sm font-black text-white shadow-lg shadow-purple-200 transition hover:-translate-y-0.5 hover:bg-(--primary-dark) disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? (
          <>
            <Loader2 size={17} className="animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save size={17} />
            {mode === "create" ? "Create product" : "Save changes"}
          </>
        )}
      </button>
    </form>
  );
}
