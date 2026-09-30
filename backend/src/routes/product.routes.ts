import { Router } from "express";

import {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/admin.middleware.js";

const router = Router();

// Public
router.get("/", getProducts);

router.get("/:slug", getProductBySlug);

// Admin
router.post(
  "/",
  authenticate,
  requireAdmin,
  createProduct
);

router.patch(
  "/:slug",
  authenticate,
  requireAdmin,
  updateProduct
);

router.delete(
  "/:slug",
  authenticate,
  requireAdmin,
  deleteProduct
);

export default router;