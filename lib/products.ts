import { apiFetch } from "./api";

export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  image: string | null;
  categoryId: number;
  status: "ACTIVE" | "INACTIVE";
  category?: ProductCategory;
}

export interface ProductsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ProductsResponse {
  products: Product[];
  pagination: ProductsPagination;
}

interface ProductResponse {
  product: Product;
}

/**
 * Fetch a paginated product catalogue.
 *
 * Supports:
 * - category filtering
 * - text search
 * - pagination
 *
 * Search is handled by the backend.
 */
export async function getProductsPage(
  categorySlug?: string,
  page = 1,
  limit = 24,
  search?: string
): Promise<ProductsResponse> {
  const params = new URLSearchParams();

  params.set("page", String(page));
  params.set("limit", String(limit));

  if (categorySlug) {
    params.set("category", categorySlug);
  }

  if (search?.trim()) {
    params.set("search", search.trim());
  }

  return apiFetch<ProductsResponse>(
    `/products?${params.toString()}`
  );
}

/**
 * Backward-compatible helper for existing
 * parts of Shopora that only need a product array.
 */
export async function getProducts(
  categorySlug?: string,
  page = 1,
  limit = 24,
  search?: string
): Promise<Product[]> {
  const data = await getProductsPage(
    categorySlug,
    page,
    limit,
    search
  );

  return data.products;
}

export async function getProductBySlug(
  slug: string
): Promise<Product> {
  const data = await apiFetch<ProductResponse>(
    `/products/${slug}`
  );

  return data.product;
}