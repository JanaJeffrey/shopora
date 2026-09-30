import type { Response } from "express";
import prisma from "../config/prisma.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";

// ============================================================
// GET FAVORITES
// GET /api/favorites
// ============================================================

export const getFavorites = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user!.id;

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      favorites: favorites.map((favorite) => favorite.product),
    });
  } catch (error) {
    console.error("Get favorites error:", error);

    return res.status(500).json({
      message: "Failed to retrieve favorites",
    });
  }
};

// ============================================================
// ADD FAVORITE
// POST /api/favorites
// Body: { productId }
// ============================================================

export const addFavorite = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user!.id;
    const { productId } = req.body;

    if (!productId || typeof productId !== "number") {
      return res.status(400).json({
        message: "productId is required.",
      });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    // Idempotent: if it's already favorited, just return success
    // rather than erroring — avoids the frontend having to worry
    // about double-clicks or state getting out of sync.
    await prisma.favorite.upsert({
      where: {
        userId_productId: { userId, productId },
      },
      create: { userId, productId },
      update: {},
    });

    return res.status(200).json({
      message: "Added to favorites",
    });
  } catch (error) {
    console.error("Add favorite error:", error);

    return res.status(500).json({
      message: "Failed to add favorite",
    });
  }
};

// ============================================================
// REMOVE FAVORITE
// DELETE /api/favorites/:productId
// ============================================================

export const removeFavorite = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user!.id;
    const productId = Number(req.params.productId);

    if (!Number.isInteger(productId)) {
      return res.status(400).json({
        message: "Invalid product id.",
      });
    }

    await prisma.favorite.deleteMany({
      where: { userId, productId },
    });

    return res.status(200).json({
      message: "Removed from favorites",
    });
  } catch (error) {
    console.error("Remove favorite error:", error);

    return res.status(500).json({
      message: "Failed to remove favorite",
    });
  }
};
