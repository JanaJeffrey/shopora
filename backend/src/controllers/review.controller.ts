import type { Request, Response } from "express";
import prisma from "../config/prisma.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";

// ============================================================
// GET REVIEWS FOR A PRODUCT
// GET /api/reviews/:productId
// Public
// ============================================================

export const getProductReviews = async (
  req: Request,
  res: Response
) => {
  try {
    const productId = Number(req.params.productId);

    if (!Number.isInteger(productId)) {
      return res.status(400).json({
        message: "Invalid product id.",
      });
    }

    const [reviews, aggregate] = await Promise.all([
      prisma.review.findMany({
        where: { productId },
        include: {
          user: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),

      prisma.review.aggregate({
        where: { productId },
        _avg: { rating: true },
        _count: true,
      }),
    ]);

    return res.status(200).json({
      reviews,
      averageRating: aggregate._avg.rating,
      reviewCount: aggregate._count,
    });
  } catch (error) {
    console.error("Get product reviews error:", error);

    return res.status(500).json({
      message: "Failed to retrieve reviews",
    });
  }
};

// ============================================================
// SUBMIT / UPDATE OWN REVIEW
// POST /api/reviews/:productId
// Body: { rating, comment }
// ============================================================

export const submitReview = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user!.id;
    const productId = Number(req.params.productId);
    const { rating, comment } = req.body;

    if (!Number.isInteger(productId)) {
      return res.status(400).json({
        message: "Invalid product id.",
      });
    }

    const numericRating = Number(rating);

    if (
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        message: "Rating must be a whole number from 1 to 5.",
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

    // One review per person per product — submitting again edits
    // the existing one instead of creating a duplicate.
    const review = await prisma.review.upsert({
      where: {
        userId_productId: { userId, productId },
      },
      create: {
        userId,
        productId,
        rating: numericRating,
        comment: comment ? String(comment).trim() : null,
      },
      update: {
        rating: numericRating,
        comment: comment ? String(comment).trim() : null,
      },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
    });

    return res.status(200).json({
      message: "Review saved",
      review,
    });
  } catch (error) {
    console.error("Submit review error:", error);

    return res.status(500).json({
      message: "Failed to save review",
    });
  }
};

// ============================================================
// DELETE OWN REVIEW
// DELETE /api/reviews/:productId
// ============================================================

export const deleteReview = async (
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

    await prisma.review.deleteMany({
      where: { userId, productId },
    });

    return res.status(200).json({
      message: "Review deleted",
    });
  } catch (error) {
    console.error("Delete review error:", error);

    return res.status(500).json({
      message: "Failed to delete review",
    });
  }
};