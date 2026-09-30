import { apiFetch } from "./api";
import type { Product } from "./products";

interface FavoritesResponse {
  favorites: Product[];
}

export async function getFavorites(): Promise<Product[]> {
  const data = await apiFetch<FavoritesResponse>("/favorites");

  return data.favorites;
}

export async function addFavorite(productId: number): Promise<void> {
  await apiFetch("/favorites", {
    method: "POST",
    body: JSON.stringify({ productId }),
  });
}

export async function removeFavorite(
  productId: number
): Promise<void> {
  await apiFetch(`/favorites/${productId}`, {
    method: "DELETE",
  });
}
