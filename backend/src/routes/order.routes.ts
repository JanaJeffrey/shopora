import { Router } from "express";
import {
  checkout,
  getMyOrders,
  getOrderById,
} from "../controllers/order.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.post("/checkout", checkout);
router.get("/", getMyOrders);
router.get("/:id", getOrderById);

export default router;