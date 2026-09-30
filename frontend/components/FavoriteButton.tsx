"use client";

import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "../store/auth-store";
import { useFavoritesStore } from "../store/favorites-store";

interface FavoriteButtonProps {
  productId: number;
  productName: string;
}

export default function FavoriteButton({
  productId,
  productName,
}: FavoriteButtonProps) {
  const router = useRouter();

  const [busy, setBusy] = useState(false);
  const [justPopped, setJustPopped] = useState(false);

  const token = useAuthStore((state) => state.token);
  const favorite = useFavoritesStore((state) =>
    state.isFavorited(productId)
  );
  const toggleFavorite = useFavoritesStore(
    (state) => state.toggleFavorite
  );

  const handleClick = async () => {
    if (!token) {
      router.push("/login");
      return;
    }

    setBusy(true);

    // Quick pop animation on click, independent of network timing.
    setJustPopped(true);
    window.setTimeout(() => setJustPopped(false), 300);

    try {
      await toggleFavorite(productId);
    } catch {
      // Best-effort — the store reverts its own optimistic update.
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      aria-label={
        favorite
          ? `Remove ${productName} from favorites`
          : `Add ${productName} to favorites`
      }
      aria-pressed={favorite}
      disabled={busy}
      onClick={handleClick}
      className={`absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-white/95 shadow-md backdrop-blur transition-all duration-200 hover:scale-105 disabled:opacity-60 ${
        justPopped ? "scale-125" : "scale-100"
      } ${
        favorite ? "text-(--primary)" : "text-(--text) hover:text-(--primary)"
      }`}
    >
      <Heart size={20} fill={favorite ? "currentColor" : "none"} />
    </button>
  );
}