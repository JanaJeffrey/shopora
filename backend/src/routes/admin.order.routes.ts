import { Router } from "express";

import {
  getAllOrders,
  updateOrderStatus,
} from "../controllers/admin.order.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/admin.middleware.js";

const router = Router();

router.use(authenticate);
router.use(requireAdmin);

router.get("/", getAllOrders);
router.patch("/:id", updateOrderStatus);

export default router;