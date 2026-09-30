import { Router } from "express";
import {
  initializePayment,
  verifyPayment,
} from "../controllers/payment.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

/**
 * Initialize a Paystack transaction
 * POST /api/payments/initialize
 * Authenticated users only
 */
router.post(
  "/initialize",
  authenticate,
  initializePayment
);

/**
 * Verify a Paystack transaction
 * GET /api/payments/verify/:reference
 */
router.get(
  "/verify/:reference",
  authenticate,
  verifyPayment
);

export default router;