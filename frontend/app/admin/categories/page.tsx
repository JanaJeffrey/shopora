"use client";

import { useEffect, useState } from "react";
import { Loader2, LayoutGrid, Plus, Trash2 } from "lucide-react";
import {
  getCategories,
  createCategory,
  deleteCategory,
  type Category,
} from "../../../lib/categories";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load categories."
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Category name is required.");
      return;
    }

    try {
      setCreating(true);

      const category = await createCategory({
        name: name.trim(),
        description: description.trim(),
      });

      setCategories((current) => [category, ...current]);
      setName("");
      setDescription("");
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "Unable to create category."
      );
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (category: Category) => {
    setError("");
    setDeletingId(category.id);

    try {
      await deleteCategory(category.id);

      setCategories((current) =>
        current.filter((item) => item.id !== category.id)
      );
    } catch (deleteError) {
      // The backend refuses to delete a category that still has
      // products in it — that message is shown as-is here.
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete category."
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-black text-(--text)">
        Categories
      </h1>
      <p className="mt-1 text-sm text-(--muted)">
        {categories.length} total
      </p>

      {error && (
        <div
          role="alert"
          className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
        >
          {error}
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        {/* ============================================================
            CREATE FORM
        ============================================================ */}
        <form
          onSubmit={handleCreate}
          className="h-fit space-y-4 rounded-2xl border border-(--border) bg-(--surface) p-6 shadow-sm"
        >
          <h2 className="font-black text-(--text)">
            Add category
          </h2>

          <div>
            <label htmlFor="cat-name" className="text-sm font-bold">
              Name
            </label>

            <input
              id="cat-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Electronics"
              className="mt-2 h-11 w-full rounded-xl border border-(--border) bg-(--surface-soft) px-4 text-sm outline-none transition focus:border-(--primary) focus:ring-4 focus:ring-(--primary-light)"
            />
          </div>

          <div>
            <label
              htmlFor="cat-description"
              className="text-sm font-bold"
            >
              Description
            </label>

            <textarea
              id="cat-description"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              rows={3}
              placeholder="Optional"
              className="mt-2 w-full resize-none rounded-xl border border-(--border) bg-(--surface-soft) px-4 py-3 text-sm outline-none transition focus:border-(--primary) focus:ring-4 focus:ring-(--primary-light)"
            />
          </div>

          <button
            type="submit"
            disabled={creating}
            className="flex items-center gap-2 rounded-xl bg-(--primary) px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-purple-200 transition hover:-translate-y-0.5 hover:bg-(--primary-dark) disabled:cursor-not-allowed disabled:opacity-60"
          >
            {creating ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Plus size={16} />
            )}
            Add category
          </button>
        </form>

        {/* ============================================================
            LIST
        ============================================================ */}
        <div>
          {loading ? (
            <div className="flex min-h-[30vh] items-center justify-center">
              <Loader2
                size={32}
                className="animate-spin text-(--primary)"
              />
            </div>
          ) : categories.length === 0 ? (
            <div className="rounded-2xl border border-(--border) bg-(--surface) p-12 text-center">
              <LayoutGrid
                size={28}
                className="mx-auto text-(--muted)"
              />
              <p className="mt-3 text-sm text-(--muted)">
                No categories yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-(--border) bg-(--surface) p-4 shadow-sm"
                >
                  <div>
                    <p className="font-bold text-(--text)">
                      {category.name}
                    </p>

                    {category.description && (
                      <p className="mt-0.5 text-sm text-(--muted)">
                        {category.description}
                      </p>
                    )}

                    <p className="mt-1 text-xs font-semibold text-(--muted)">
                      {category._count.products}{" "}
                      {category._count.products === 1
                        ? "product"
                        : "products"}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={deletingId === category.id}
                    onClick={() => handleDelete(category)}
                    aria-label={`Delete ${category.name}`}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-(--muted) transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                  >
                    {deletingId === category.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
