import { Router } from "express";

import {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/admin.middleware.js";

const router = Router();

// ============================================================
// PUBLIC
// ============================================================

router.get("/", getCategories);

router.get("/:slug", getCategoryBySlug);

// ============================================================
// ADMIN
// ============================================================

router.post(
  "/",
  authenticate,
  requireAdmin,
  createCategory
);

router.patch(
  "/:id",
  authenticate,
  requireAdmin,
  updateCategory
);

router.delete(
  "/:id",
  authenticate,
  requireAdmin,
  deleteCategory
);

export default router;