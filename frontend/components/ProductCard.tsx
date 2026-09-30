"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, ShoppingCart, Check } from "lucide-react";
import { useState } from "react";
import type { Product } from "../lib/products";
import { formatPrice } from "../lib/currency";
import { useCartStore } from "../store/cart-store";
import { useAuthStore } from "../store/auth-store";
import { useFavoritesStore } from "../store/favorites-store";

interface ProductCardProps {
  product: Product;
}


function getDiscountPercentage(
  price: number,
  compareAtPrice: number | null
) {
  if (!compareAtPrice || compareAtPrice <= price) {
    return 0;
  }

  return Math.round(
    ((compareAtPrice - price) / compareAtPrice) * 100
  );
}

export default function ProductCard({
  product,
}: ProductCardProps) {
  const router = useRouter();

  const [added, setAdded] = useState(false);
  const [favoriteBusy, setFavoriteBusy] = useState(false);
  const [justPopped, setJustPopped] = useState(false);

  const addToCart = useCartStore(
    (state) => state.addToCart
  );

  const token = useAuthStore((state) => state.token);
  const favorite = useFavoritesStore((state) =>
    state.isFavorited(product.id)
  );
  const toggleFavorite = useFavoritesStore(
    (state) => state.toggleFavorite
  );

  const compareAtPrice = product.compareAtPrice;

  const discount = getDiscountPercentage(
    product.price,
    compareAtPrice
  );

  const available = product.stock > 0;

  const handleAddToCart = () => {
    if (!available) {
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.image,
      stock: product.stock,
    });

    setAdded(true);

    window.setTimeout(() => {
      setAdded(false);
    }, 1500);
  };

  const handleToggleFavorite = async (
    event: React.MouseEvent
  ) => {
    event.preventDefault();
    event.stopPropagation();

    if (!token) {
      router.push("/login");
      return;
    }

    setFavoriteBusy(true);

    // A quick pop animation on click, independent of how long the
    // network request takes — this is what makes the click feel
    // instant/responsive rather than just a flat color swap.
    setJustPopped(true);
    window.setTimeout(() => setJustPopped(false), 300);

    try {
      await toggleFavorite(product.id);
    } catch {
      // Best-effort — the store already reverts its own optimistic
      // update on failure, so there's nothing further to show here.
    } finally {
      setFavoriteBusy(false);
    }
  };

  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-(--border) bg-(--surface) shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-(--border-purple) hover:shadow-xl sm:rounded-3xl">
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-(--surface-soft)"
      >
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-semibold text-(--muted)">
            No image available
          </div>
        )}

        {discount > 0 && (
          <span className="absolute left-3 top-3 rounded-lg bg-(--accent) px-2.5 py-1.5 text-[10px] font-black text-white shadow-sm sm:text-xs">
            -{discount}% OFF
          </span>
        )}

        {!available && (
          <span className="absolute bottom-3 left-3 rounded-lg bg-(--text)/80 px-2.5 py-1.5 text-[10px] font-black text-white sm:text-xs">
            OUT OF STOCK
          </span>
        )}

        <button
          type="button"
          aria-label={
            favorite
              ? `Remove ${product.name} from favorites`
              : `Add ${product.name} to favorites`
          }
          aria-pressed={favorite}
          disabled={favoriteBusy}
          onClick={handleToggleFavorite}
          className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-sm backdrop-blur transition-all duration-200 hover:scale-105 disabled:opacity-60 ${
            justPopped ? "scale-125" : "scale-100"
          } ${
            favorite
              ? "text-(--primary)"
              : "text-(--text) hover:text-(--primary)"
          }`}
        >
          <Heart
            size={17}
            className="transition-transform duration-200"
            fill={favorite ? "currentColor" : "none"}
          />
        </button>
      </Link>

      <div className="flex flex-1 flex-col p-3.5 sm:p-4.5">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-(--muted) sm:text-xs">
          Shopora
        </p>

        <Link href={`/products/${product.slug}`}>
          <h3 className="mt-1.5 line-clamp-2 min-h-10 text-sm font-bold leading-5 text-(--text) transition group-hover:text-(--primary) sm:text-base">
            {product.name}
          </h3>
        </Link>

        <div className="mt-3">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-lg font-black text-(--primary) sm:text-xl">
              {formatPrice(product.price)}
            </span>

            {compareAtPrice &&
              compareAtPrice > product.price && (
                <span className="text-xs font-semibold text-(--muted) line-through sm:text-sm">
                  {formatPrice(compareAtPrice)}
                </span>
              )}
          </div>

          {discount > 0 && compareAtPrice && (
            <p className="mt-1 text-[11px] font-bold text-(--accent-dark) sm:text-xs">
              Save {formatPrice(compareAtPrice - product.price)}
            </p>
          )}
        </div>

        <div className="mt-3">
          {available ? (
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-(--success)" />

              <p className="text-[11px] font-semibold text-(--success) sm:text-xs">
                {product.stock} available
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-(--danger)" />

              <p className="text-[11px] font-semibold text-(--danger) sm:text-xs">
                Currently unavailable
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Link
            href={`/products/${product.slug}`}
            className="flex min-w-0 flex-1 items-center justify-center rounded-xl bg-(--primary) px-3 py-2.5 text-xs font-bold text-white transition hover:bg-(--primary-dark) sm:text-sm"
          >
            View product
          </Link>

          <button
            type="button"
            disabled={!available}
            aria-label={`Add ${product.name} to cart`}
            onClick={handleAddToCart}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
              added
                ? "bg-(--success) text-white"
                : "bg-(--accent-light) text-(--accent-dark) hover:bg-(--accent) hover:text-white"
            } disabled:cursor-not-allowed disabled:opacity-40`}
          >
            {added ? (
              <Check size={17} />
            ) : (
              <ShoppingCart size={17} />
            )}
          </button>
        </div>
      </div>
    </article>
  );
}