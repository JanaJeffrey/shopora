"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: number;
  name: string;
  slug: string;
  price: number;
  image: string | null;
  stock: number;
  quantity: number;
}

interface CartStore {
  items: CartItem[];

  addToCart: (
    product: Omit<CartItem, "quantity">,
    quantity?: number
  ) => void;

  removeFromCart: (productId: number) => void;

  increaseQuantity: (productId: number) => void;

  decreaseQuantity: (productId: number) => void;

  clearCart: () => void;

  totalItems: () => number;

  subtotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addToCart: (product, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.id === product.id
          );

          if (existingItem) {
            const newQuantity = Math.min(
              existingItem.quantity + quantity,
              existingItem.stock
            );

            return {
              items: state.items.map((item) =>
                item.id === product.id
                  ? {
                      ...item,
                      quantity: newQuantity,
                      stock: product.stock,
                    }
                  : item
              ),
            };
          }

          const safeQuantity = Math.min(
            Math.max(quantity, 1),
            product.stock
          );

          return {
            items: [
              ...state.items,
              {
                ...product,
                quantity: safeQuantity,
              },
            ],
          };
        });
      },

      removeFromCart: (productId) => {
        set((state) => ({
          items: state.items.filter(
            (item) => item.id !== productId
          ),
        }));
      },

      increaseQuantity: (productId) => {
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id !== productId) {
              return item;
            }

            return {
              ...item,
              quantity: Math.min(
                item.quantity + 1,
                item.stock
              ),
            };
          }),
        }));
      },

      decreaseQuantity: (productId) => {
        set((state) => ({
          items: state.items
            .map((item) => {
              if (item.id !== productId) {
                return item;
              }

              return {
                ...item,
                quantity: item.quantity - 1,
              };
            })
            .filter((item) => item.quantity > 0),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      totalItems: () => {
        return get().items.reduce(
          (total, item) => total + item.quantity,
          0
        );
      },

      subtotal: () => {
        return get().items.reduce(
          (total, item) =>
            total + item.price * item.quantity,
          0
        );
      },
    }),
    {
      name: "shopora-cart",
    }
  )
);