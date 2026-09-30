"use client";

import { useEffect } from "react";
import { useAuthStore } from "../store/auth-store";
import { useFavoritesStore } from "../store/favorites-store";
import { useHasHydrated } from "../lib/use-has-hydrated";

/**
 * Renders nothing — its only job is keeping the favorites store in
 * sync with who's logged in. Mounted once in layout.tsx so it's
 * always active, regardless of which page is showing.
 */
export default function FavoritesSync() {
  const hasHydrated = useHasHydrated();
  const user = useAuthStore((state) => state.user);
  const loaded = useFavoritesStore((state) => state.loaded);
  const loadFavorites = useFavoritesStore(
    (state) => state.loadFavorites
  );
  const reset = useFavoritesStore((state) => state.reset);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    if (user && !loaded) {
      loadFavorites();
    }

    if (!user && loaded) {
      reset();
    }
  }, [hasHydrated, user, loaded, loadFavorites, reset]);

  return null;
}
