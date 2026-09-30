import { apiFetch } from "./api";
import type { Product } from "./products";

// ============================================================
// PRODUCTS (ADMIN)
// ============================================================

interface AdminProductsResponse {
  products: Product[];
}

interface ProductResponse {
  message: string;
  product: Product;
}

export interface ProductInput {
  name: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  image: string;
  categoryId: number;
}

/** Every product regardless of status — the public /products
 * endpoint only ever returns ACTIVE ones, so admin management
 * needs this separate endpoint to see deactivated products too. */
export async function getAdminProducts(): Promise<Product[]> {
  const data = await apiFetch<AdminProductsResponse>(
    "/admin/products"
  );

  return data.products;
}

export async function createProduct(
  input: ProductInput
): Promise<Product> {
  const data = await apiFetch<ProductResponse>("/products", {
    method: "POST",
    body: JSON.stringify(input),
  });

  return data.product;
}

export async function updateProduct(
  slug: string,
  input: Partial<ProductInput>
): Promise<Product> {
  const data = await apiFetch<ProductResponse>(
    `/products/${slug}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    }
  );

  return data.product;
}

/** Soft-deletes: the backend marks the product INACTIVE rather
 * than deleting it, so past orders referencing it stay intact. */
export async function deactivateProduct(
  slug: string
): Promise<Product> {
  const data = await apiFetch<ProductResponse>(
    `/products/${slug}`,
    {
      method: "DELETE",
    }
  );

  return data.product;
}

export async function reactivateProduct(
  slug: string
): Promise<Product> {
  const data = await apiFetch<ProductResponse>(
    `/products/${slug}`,
    {
      method: "PATCH",
      body: JSON.stringify({ status: "ACTIVE" }),
    }
  );

  return data.product;
}

// ============================================================
// ORDERS (ADMIN)
// ============================================================

export type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export interface AdminOrderItem {
  id: number;
  quantity: number;
  price: number;
  product: {
    id: number;
    name: string;
    image: string | null;
  };
}

export interface AdminOrder {
  id: number;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: "CARD" | "CASH_ON_DELIVERY";
  paymentStatus: "PENDING" | "PAID" | "FAILED";
  createdAt: string;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  items: AdminOrderItem[];
}

interface AdminOrdersResponse {
  orders: AdminOrder[];
}

interface AdminOrderStatusUpdateResponse {
  message: string;
  order: {
    id: number;
    status: OrderStatus;
  };
}

export async function getAdminOrders(): Promise<AdminOrder[]> {
  const data = await apiFetch<AdminOrdersResponse>(
    "/admin/orders"
  );

  return data.orders;
}

export async function updateAdminOrderStatus(
  orderId: number,
  status: OrderStatus
): Promise<{ id: number; status: OrderStatus }> {
  // Note: the backend's update response doesn't include the
  // `user`/`items` relations (only the raw updated order row), so
  // we only type/return the fields it actually sends back. The
  // calling page updates just the `status` field of the order it
  // already has in state, rather than replacing the whole object.
  const data = await apiFetch<AdminOrderStatusUpdateResponse>(
    `/admin/orders/${orderId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }
  );

  return data.order;
}
