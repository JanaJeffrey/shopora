import type { Response } from "express";
import prisma from "../config/prisma.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";

export const getCart = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const cart = await prisma.cart.findUnique({
      where: {
        userId: req.user!.id,
      },
      include: {
        items: {
          include: {
            product: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!cart) {
      return res.status(200).json({
        cart: {
          id: null,
          items: [],
        },
      });
    }

    return res.status(200).json({ cart });
  } catch (error) {
    console.error("Get cart error:", error);

    return res.status(500).json({
      message: "Failed to retrieve cart",
    });
  }
};

export const addToCart = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const productId = Number(req.body.productId);
    const quantity = Number(req.body.quantity);

    if (
      !Number.isInteger(productId) ||
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      return res.status(400).json({
        message: "Valid productId and quantity are required",
      });
    }

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!product || product.status !== "ACTIVE") {
      return res.status(404).json({
        message: "Product is unavailable",
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        message: `Only ${product.stock} item(s) are available`,
      });
    }

    const cart = await prisma.cart.upsert({
      where: {
        userId: req.user!.id,
      },
      create: {
        userId: req.user!.id,
      },
      update: {},
    });

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    const newQuantity =
      (existingItem?.quantity ?? 0) + quantity;

    if (newQuantity > product.stock) {
      return res.status(400).json({
        message: `Only ${product.stock} item(s) are available`,
      });
    }

    const item = await prisma.cartItem.upsert({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
      create: {
        cartId: cart.id,
        productId,
        quantity,
      },
      update: {
        quantity: newQuantity,
      },
      include: {
        product: true,
      },
    });

    return res.status(200).json({
      message: "Product added to cart",
      item,
    });
  } catch (error) {
    console.error("Add to cart error:", error);

    return res.status(500).json({
      message: "Failed to add product to cart",
    });
  }
};

export const updateCartItem = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const itemId = Number(req.params.itemId);
    const quantity = Number(req.body.quantity);

    if (
      !Number.isInteger(itemId) ||
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      return res.status(400).json({
        message: "Valid itemId and quantity are required",
      });
    }

    const item = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cart: {
          userId: req.user!.id,
        },
      },
      include: {
        product: true,
      },
    });

    if (!item) {
      return res.status(404).json({
        message: "Cart item not found",
      });
    }

    if (
      item.product.status !== "ACTIVE" ||
      item.product.stock < quantity
    ) {
      return res.status(400).json({
        message: "Requested quantity is unavailable",
      });
    }

    const updatedItem = await prisma.cartItem.update({
      where: {
        id: itemId,
      },
      data: {
        quantity,
      },
      include: {
        product: true,
      },
    });

    return res.status(200).json({
      message: "Cart updated",
      item: updatedItem,
    });
  } catch (error) {
    console.error("Update cart error:", error);

    return res.status(500).json({
      message: "Failed to update cart",
    });
  }
};

export const removeFromCart = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const itemId = Number(req.params.itemId);

    if (!Number.isInteger(itemId)) {
      return res.status(400).json({
        message: "Invalid cart item ID",
      });
    }

    const item = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cart: {
          userId: req.user!.id,
        },
      },
    });

    if (!item) {
      return res.status(404).json({
        message: "Cart item not found",
      });
    }

    await prisma.cartItem.delete({
      where: {
        id: item.id,
      },
    });

    return res.status(200).json({
      message: "Item removed from cart",
    });
  } catch (error) {
    console.error("Remove cart item error:", error);

    return res.status(500).json({
      message: "Failed to remove item",
    });
  }
};

export const clearCart = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    await prisma.cartItem.deleteMany({
      where: {
        cart: {
          userId: req.user!.id,
        },
      },
    });

    return res.status(200).json({
      message: "Cart cleared",
    });
  } catch (error) {
    console.error("Clear cart error:", error);

    return res.status(500).json({
      message: "Failed to clear cart",
    });
  }
};