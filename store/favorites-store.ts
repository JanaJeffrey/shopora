"use client";

import { create } from "zustand";
import {
  addFavorite,
  removeFavorite,
  getFavorites,
} from "../lib/favorites";

interface FavoritesStore {
  favoriteIds: Set<number>;
  loaded: boolean;

  isFavorited: (productId: number) => boolean;

  /** Fetches the account's favorites from the backend and populates
   * the store. Called once after login (see FavoritesSync.tsx). */
  loadFavorites: () => Promise<void>;

  /** Adds/removes optimistically (updates instantly, then confirms
   * with the backend), reverting if the request fails. */
  toggleFavorite: (productId: number) => Promise<void>;

  /** Clears everything — called on logout so the next person to use
   * this browser never sees someone else's favorites. */
  reset: () => void;
}

// Deliberately NOT persisted to localStorage: favorites belong to an
// account, not a device, so on login we always fetch the real list
// from the backend rather than trusting whatever was last cached
// (which could belong to a previous user on a shared browser).
export const useFavoritesStore = create<FavoritesStore>()(
  (set, get) => ({
    favoriteIds: new Set(),
    loaded: false,

    isFavorited: (productId) => get().favoriteIds.has(productId),

    loadFavorites: async () => {
      try {
        const products = await getFavorites();

        set({
          favoriteIds: new Set(products.map((product) => product.id)),
          loaded: true,
        });
      } catch {
        // Leave favorites empty rather than surfacing an error toast
        // for a background sync — the heart icons will just show as
        // unfavorited, which is a safe fallback.
        set({ loaded: true });
      }
    },

    toggleFavorite: async (productId) => {
      const wasFavorited = get().favoriteIds.has(productId);

      // Optimistic update — a new Set instance so subscribers re-render.
      set((state) => {
        const next = new Set(state.favoriteIds);

        if (wasFavorited) {
          next.delete(productId);
        } else {
          next.add(productId);
        }

        return { favoriteIds: next };
      });

      try {
        if (wasFavorited) {
          await removeFavorite(productId);
        } else {
          await addFavorite(productId);
        }
      } catch (error) {
        // Revert on failure.
        set((state) => {
          const next = new Set(state.favoriteIds);

          if (wasFavorited) {
            next.add(productId);
          } else {
            next.delete(productId);
          }

          return { favoriteIds: next };
        });

        throw error;
      }
    },

    reset: () => {
      set({ favoriteIds: new Set(), loaded: false });
    },
  })
);
