import { Router } from "express";

import { getAllProductsAdmin } from "../controllers/product.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/admin.middleware.js";

const router = Router();

router.use(authenticate);
router.use(requireAdmin);

router.get("/", getAllProductsAdmin);

export default router;
