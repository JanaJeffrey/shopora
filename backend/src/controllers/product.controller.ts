import type { Request, Response } from "express";
import prisma from "../config/prisma.js";

// ============================================================
// GET ALL PRODUCTS
// Public
// ============================================================

export const getProducts = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      search,
      category,
      page = "1",
      limit = "50",
    } = req.query;

    const pageNumber = Math.max(
      Number(page) || 1,
      1
    );

    const limitNumber = Math.min(
      Math.max(Number(limit) || 50, 1),
      50
    );

    const skip = (pageNumber - 1) * limitNumber;

    const where = {
      status: "ACTIVE" as const,

      ...(search
        ? {
            OR: [
              {
                name: {
                  contains: String(search),
                  mode: "insensitive" as const,
                },
              },
              {
                description: {
                  contains: String(search),
                  mode: "insensitive" as const,
                },
              },
            ],
          }
        : {}),

      ...(category
        ? {
            category: {
              slug: String(category),
            },
          }
        : {}),
    };

    // ==========================================================
    // GET PRODUCTS
    // ==========================================================

    const products = await prisma.product.findMany({
      where,

      include: {
        category: true,
      },

      orderBy: {
        createdAt: "desc",
      },

      skip,
      take: limitNumber,
    });

    // ==========================================================
    // GET TOTAL
    // ==========================================================

    const total = await prisma.product.count({
      where,
    });

    // ==========================================================
    // RESPONSE
    // ==========================================================

    return res.status(200).json({
      products,

      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(
          total / limitNumber
        ),
      },
    });
  } catch (error) {
    console.error(
      "Get products error:",
      error
    );

    return res.status(500).json({
      message: "Failed to retrieve products",
    });
  }
};

// ============================================================
// GET SINGLE PRODUCT
// Public
// ============================================================

export const getProductBySlug = async (
  req: Request,
  res: Response
) => {
  try {
    const slug = String(
      req.params.slug
    );

    const product =
      await prisma.product.findUnique({
        where: {
          slug,
        },

        include: {
          category: true,
        },
      });

    if (
      !product ||
      product.status !== "ACTIVE"
    ) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.status(200).json({
      product,
    });
  } catch (error) {
    console.error(
      "Get product error:",
      error
    );

    return res.status(500).json({
      message: "Failed to retrieve product",
    });
  }
};

// ============================================================
// CREATE PRODUCT
// Admin only
// ============================================================

export const createProduct = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      name,
      description,
      price,
      compareAtPrice,
      stock,
      image,
      categoryId,
    } = req.body;

    if (
      !name ||
      price === undefined ||
      stock === undefined ||
      categoryId === undefined
    ) {
      return res.status(400).json({
        message:
          "Name, price, stock and categoryId are required",
      });
    }

    const numericPrice = Number(price);
    const numericStock = Number(stock);
    const numericCategoryId =
      Number(categoryId);

    const numericCompareAtPrice =
      compareAtPrice === undefined ||
      compareAtPrice === null ||
      compareAtPrice === ""
        ? null
        : Number(compareAtPrice);

    if (
      !Number.isFinite(numericPrice) ||
      numericPrice < 0
    ) {
      return res.status(400).json({
        message:
          "Price must be a valid positive number",
      });
    }

    if (
      numericCompareAtPrice !== null &&
      (!Number.isFinite(
        numericCompareAtPrice
      ) ||
        numericCompareAtPrice < 0)
    ) {
      return res.status(400).json({
        message:
          "Compare-at price must be a valid positive number",
      });
    }

    if (
      !Number.isInteger(numericStock) ||
      numericStock < 0
    ) {
      return res.status(400).json({
        message:
          "Stock must be a valid non-negative integer",
      });
    }

    if (
      !Number.isInteger(
        numericCategoryId
      )
    ) {
      return res.status(400).json({
        message: "Invalid categoryId",
      });
    }

    const category =
      await prisma.category.findUnique({
        where: {
          id: numericCategoryId,
        },
      });

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    // ==========================================================
    // GENERATE SLUG
    // ==========================================================

    const baseSlug = String(name)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    let slug = baseSlug;

    const existingSlug =
      await prisma.product.findUnique({
        where: {
          slug,
        },
      });

    if (existingSlug) {
      slug = `${baseSlug}-${Date.now()}`;
    }

    // ==========================================================
    // CREATE
    // ==========================================================

    const product =
      await prisma.product.create({
        data: {
          name: String(name).trim(),

          slug,

          description:
            description === undefined
              ? ""
              : String(description).trim(),

          price: numericPrice,

          compareAtPrice:
            numericCompareAtPrice,

          stock: numericStock,

          image:
            image === undefined ||
            image === null
              ? ""
              : String(image),

          categoryId:
            numericCategoryId,

          status: "ACTIVE",
        },

        include: {
          category: true,
        },
      });

    return res.status(201).json({
      message:
        "Product created successfully",

      product,
    });
  } catch (error) {
    console.error(
      "Create product error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to create product",
    });
  }
};

// ============================================================
// UPDATE PRODUCT
// Admin only
// ============================================================

export const updateProduct = async (
  req: Request,
  res: Response
) => {
  try {
    const slug = String(
      req.params.slug
    );

    const {
      name,
      description,
      price,
      stock,
      image,
      compareAtPrice,
      categoryId,
      status,
    } = req.body;

    const existingProduct =
      await prisma.product.findUnique({
        where: {
          slug,
        },
      });

    if (!existingProduct) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // ==========================================================
    // BUILD UPDATE OBJECT
    // ==========================================================

    const updateData: Record<
      string,
      unknown
    > = {};

    // ==========================================================
    // NAME
    // ==========================================================

    if (name !== undefined) {
      const trimmedName =
        String(name).trim();

      if (!trimmedName) {
        return res.status(400).json({
          message:
            "Product name cannot be empty",
        });
      }

      updateData.name =
        trimmedName;

      const newSlug =
        trimmedName
          .toLowerCase()
          .replace(
            /[^a-z0-9]+/g,
            "-"
          )
          .replace(
            /^-|-$/g,
            ""
          );

      if (
        newSlug &&
        newSlug !== slug
      ) {
        const slugExists =
          await prisma.product.findUnique(
            {
              where: {
                slug: newSlug,
              },
            }
          );

        if (!slugExists) {
          updateData.slug =
            newSlug;
        }
      }
    }

    // ==========================================================
    // DESCRIPTION
    // ==========================================================

    if (description !== undefined) {
      updateData.description =
        String(description).trim();
    }

    // ==========================================================
    // PRICE
    // ==========================================================

    if (price !== undefined) {
      const numericPrice =
        Number(price);

      if (
        !Number.isFinite(
          numericPrice
        ) ||
        numericPrice < 0
      ) {
        return res.status(400).json({
          message:
            "Price must be a valid positive number",
        });
      }

      updateData.price =
        numericPrice;
    }

    // ==========================================================
    // COMPARE AT PRICE
    // ==========================================================

    if (
      compareAtPrice !== undefined
    ) {
      updateData.compareAtPrice =
        compareAtPrice === null ||
        compareAtPrice === ""
          ? null
          : Number(compareAtPrice);
    }

    // ==========================================================
    // STOCK
    // ==========================================================

    if (stock !== undefined) {
      const numericStock =
        Number(stock);

      if (
        !Number.isInteger(
          numericStock
        ) ||
        numericStock < 0
      ) {
        return res.status(400).json({
          message:
            "Stock must be a valid non-negative integer",
        });
      }

      updateData.stock =
        numericStock;
    }

    // ==========================================================
    // IMAGE
    // ==========================================================

    if (image !== undefined) {
      updateData.image =
        image === null
          ? ""
          : String(image);
    }

    // ==========================================================
    // CATEGORY
    // ==========================================================

    if (
      categoryId !== undefined
    ) {
      const numericCategoryId =
        Number(categoryId);

      if (
        !Number.isInteger(
          numericCategoryId
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid categoryId",
        });
      }

      const category =
        await prisma.category.findUnique(
          {
            where: {
              id: numericCategoryId,
            },
          }
        );

      if (!category) {
        return res.status(404).json({
          message:
            "Category not found",
        });
      }

      updateData.category = {
        connect: {
          id: numericCategoryId,
        },
      };
    }

    // ==========================================================
    // STATUS
    // ==========================================================

    if (status !== undefined) {
      if (
        status !== "ACTIVE" &&
        status !== "INACTIVE"
      ) {
        return res.status(400).json({
          message:
            "Invalid product status",
        });
      }

      updateData.status =
        status;
    }

    // ==========================================================
    // UPDATE DATABASE
    // ==========================================================

    const product =
      await prisma.product.update({
        where: {
          slug,
        },

        data: updateData as any,

        include: {
          category: true,
        },
      });

    return res.status(200).json({
      message:
        "Product updated successfully",

      product,
    });
  } catch (error) {
    console.error(
      "Update product error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to update product",
    });
  }
};

// ============================================================
// DELETE / DEACTIVATE PRODUCT
// Admin only
// ============================================================

export const deleteProduct = async (
  req: Request,
  res: Response
) => {
  try {
    const slug = String(
      req.params.slug
    );

    const product =
      await prisma.product.findUnique({
        where: {
          slug,
        },
      });

    if (!product) {
      return res.status(404).json({
        message:
          "Product not found",
      });
    }

    /*
     * We don't permanently delete products.
     *
     * Instead, products are marked INACTIVE.
     *
     * This preserves historical order
     * references and customer records.
     */

    const updatedProduct =
      await prisma.product.update({
        where: {
          slug,
        },

        data: {
          status: "INACTIVE",
        },
      });

    return res.status(200).json({
      message:
        "Product deactivated successfully",

      product:
        updatedProduct,
    });
  } catch (error) {
    console.error(
      "Delete product error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to deactivate product",
    });
  }
};

// ============================================================
// GET ALL PRODUCTS — ADMIN
// GET /api/admin/products
// ============================================================

export const getAllProductsAdmin =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const products =
        await prisma.product.findMany({
          include: {
            category: true,
          },

          orderBy: {
            createdAt: "desc",
          },
        });

      return res.status(200).json({
        products,
      });
    } catch (error) {
      console.error(
        "Get all products (admin) error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to retrieve products",
      });
    }
  };