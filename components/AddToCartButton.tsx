"use client";

import { ShoppingCart, Check } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "../store/cart-store";

interface AddToCartButtonProps {
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

export default function AddToCartButton({
  product,
  available,
}: AddToCartButtonProps) {
  const addToCart = useCartStore((state) => state.addToCart);

  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    if (!available) return;

    addToCart(product);

    setAdded(true);

    setTimeout(() => {
      setAdded(false);
    }, 1800);
  };

  return (
    <button
      type="button"
      disabled={!available}
      onClick={handleAddToCart}
      className={`mt-8 flex w-full items-center justify-center gap-3 rounded-2xl px-7 py-4 font-black text-white shadow-lg transition duration-300 ${
        !available
          ? "cursor-not-allowed bg-gray-300"
          : added
            ? "bg-(--success)"
            : "bg-(--accent) hover:-translate-y-0.5 hover:bg-(--accent-dark)"
      }`}
    >
      {added ? (
        <>
          <Check size={21} />
          Added to Cart
        </>
      ) : (
        <>
          <ShoppingCart size={21} />
          {available ? "Add to Cart" : "Out of Stock"}
        </>
      )}
    </button>
  );
}