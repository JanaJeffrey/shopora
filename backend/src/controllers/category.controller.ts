import type { Request, Response } from "express";
import prisma from "../config/prisma.js";

// ============================================================
// GET ALL CATEGORIES
// Public
// ============================================================

export const getCategories = async (
  req: Request,
  res: Response
) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    return res.status(200).json({
      categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);

    return res.status(500).json({
      message: "Failed to retrieve categories",
    });
  }
};

// ============================================================
// GET SINGLE CATEGORY
// Public
// ============================================================

export const getCategoryBySlug = async (
  req: Request,
  res: Response
) => {
  try {
    const slug = String(req.params.slug);

    const category = await prisma.category.findUnique({
      where: {
        slug,
      },
      include: {
        products: {
          where: {
            status: "ACTIVE",
          },
          include: {
            category: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    return res.status(200).json({
      category,
    });
  } catch (error) {
    console.error("Get category error:", error);

    return res.status(500).json({
      message: "Failed to retrieve category",
    });
  }
};

// ============================================================
// CREATE CATEGORY
// Admin only
// ============================================================

export const createCategory = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      name,
      description,
    } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Category name is required",
      });
    }

    const trimmedName = String(name).trim();

    if (!trimmedName) {
      return res.status(400).json({
        message: "Category name cannot be empty",
      });
    }

    const slug = trimmedName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const existingCategory =
      await prisma.category.findUnique({
        where: {
          slug,
        },
      });

    if (existingCategory) {
      return res.status(409).json({
        message: "A category with this name already exists",
      });
    }

    const category = await prisma.category.create({
      data: {
        name: trimmedName,
        slug,
        description:
          description === undefined
            ? null
            : String(description).trim(),
      },
    });

    return res.status(201).json({
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.error("Create category error:", error);

    return res.status(500).json({
      message: "Failed to create category",
    });
  }
};

// ============================================================
// UPDATE CATEGORY
// Admin only
// ============================================================

export const updateCategory = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        message: "Invalid category ID",
      });
    }

    const existingCategory =
      await prisma.category.findUnique({
        where: {
          id,
        },
      });

    if (!existingCategory) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    const {
      name,
      description,
    } = req.body;

    const updateData: Record<string, unknown> = {};

    if (name !== undefined) {
      const trimmedName = String(name).trim();

      if (!trimmedName) {
        return res.status(400).json({
          message: "Category name cannot be empty",
        });
      }

      updateData.name = trimmedName;

      const newSlug = trimmedName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      if (newSlug !== existingCategory.slug) {
        const slugExists =
          await prisma.category.findUnique({
            where: {
              slug: newSlug,
            },
          });

        if (slugExists) {
          return res.status(409).json({
            message:
              "A category with this name already exists",
          });
        }

        updateData.slug = newSlug;
      }
    }

    if (description !== undefined) {
      updateData.description =
        description === null
          ? null
          : String(description).trim();
    }

    const category = await prisma.category.update({
      where: {
        id,
      },
      data: updateData as any,
    });

    return res.status(200).json({
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    console.error("Update category error:", error);

    return res.status(500).json({
      message: "Failed to update category",
    });
  }
};

// ============================================================
// DELETE CATEGORY
// Admin only
// ============================================================

export const deleteCategory = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        message: "Invalid category ID",
      });
    }

    const category =
      await prisma.category.findUnique({
        where: {
          id,
        },
        include: {
          _count: {
            select: {
              products: true,
            },
          },
        },
      });

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    // Don't delete a category that still has products.
    if (category._count.products > 0) {
      return res.status(400).json({
        message:
          "Cannot delete a category that contains products",
      });
    }

    await prisma.category.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete category error:", error);

    return res.status(500).json({
      message: "Failed to delete category",
    });
  }
};