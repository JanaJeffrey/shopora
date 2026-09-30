import { apiFetch } from "./api";

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  _count: {
    products: number;
  };
}

interface CategoriesResponse {
  categories: Category[];
}

interface CategoryResponse {
  message: string;
  category: Category;
}

export async function getCategories(): Promise<Category[]> {
  const data = await apiFetch<CategoriesResponse>("/categories");

  return data.categories;
}

// ============================================================
// ADMIN
// ============================================================

export async function createCategory(input: {
  name: string;
  description: string;
}): Promise<Category> {
  const data = await apiFetch<CategoryResponse>("/categories", {
    method: "POST",
    body: JSON.stringify(input),
  });

  return data.category;
}

export async function updateCategory(
  id: number,
  input: Partial<{ name: string; description: string }>
): Promise<Category> {
  const data = await apiFetch<CategoryResponse>(
    `/categories/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    }
  );

  return data.category;
}

/** The backend refuses (400) to delete a category that still has
 * products in it — that error message is surfaced as-is to the admin. */
export async function deleteCategory(id: number): Promise<void> {
  await apiFetch(`/categories/${id}`, {
    method: "DELETE",
  });
}
