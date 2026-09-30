"use client";

import { Minus, Plus, ShoppingCart, Check } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "../store/cart-store";

interface ProductActionsProps {
  product: {
    id: number;
    name: string;
    slug: string;
    price: number;
    image: string | null;
    stock: number;
  };
  available: boolean;
}

export default function ProductActions({
  product,
  available,
}: ProductActionsProps) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const addToCart = useCartStore((state) => state.addToCart);

  const increaseQuantity = () => {
    setQuantity((current) =>
      Math.min(current + 1, product.stock)
    );
  };

  const decreaseQuantity = () => {
    setQuantity((current) =>
      Math.max(current - 1, 1)
    );
  };

  const handleAddToCart = () => {
    if (!available) return;

    addToCart(
      {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        image: product.image,
        stock: product.stock,
      },
      quantity
    );

    setAdded(true);

    setTimeout(() => {
      setAdded(false);
    }, 1800);
  };

  return (
    <>
      {/* Quantity */}
      <div className="mt-7">
        <p className="text-sm font-bold">
          Quantity
        </p>

        <div className="mt-2 flex h-12 w-fit items-center overflow-hidden rounded-xl border border-(--border) bg-(--surface)">
          <button
            type="button"
            onClick={decreaseQuantity}
            disabled={!available || quantity <= 1}
            aria-label="Decrease quantity"
            className="flex h-full w-12 items-center justify-center text-(--text) transition hover:bg-(--primary-light) hover:text-(--primary) disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Minus size={16} />
          </button>

          <span className="flex h-full min-w-12 items-center justify-center border-x border-(--border) px-3 text-sm font-black">
            {quantity}
          </span>

          <button
            type="button"
            onClick={increaseQuantity}
            disabled={
              !available ||
              quantity >= product.stock
            }
            aria-label="Increase quantity"
            className="flex h-full w-12 items-center justify-center text-(--text) transition hover:bg-(--primary-light) hover:text-(--primary) disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus size={16} />
          </button>
        </div>

        {available && (
          <p className="mt-2 text-xs text-(--muted)">
            Maximum available: {product.stock}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          disabled={!available}
          onClick={handleAddToCart}
          className={`flex items-center justify-center gap-2 rounded-2xl border-2 px-6 py-4 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 ${
            added
              ? "border-(--success) bg-(--success)"
              : "border-(--primary) bg-(--primary) hover:bg-(--primary-dark)"
          }`}
        >
          {added ? (
            <>
              <Check size={19} />
              Added to Cart
            </>
          ) : (
            <>
              <ShoppingCart size={19} />
              Add to Cart
            </>
          )}
        </button>

        <button
          type="button"
          disabled={!available}
          className="flex items-center justify-center gap-2 rounded-2xl border-2 border-(--accent) bg-(--accent) px-6 py-4 text-sm font-black text-(--text) shadow-lg transition hover:-translate-y-0.5 hover:bg-(--accent-dark) disabled:cursor-not-allowed disabled:opacity-50"
        >
          Buy Now
        </button>
      </div>
    </>
  );
}