import { Router } from "express";
import {
  getProductReviews,
  submitReview,
  deleteReview,
} from "../controllers/review.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/:productId", getProductReviews);
router.post("/:productId", authenticate, submitReview);
router.delete("/:productId", authenticate, deleteReview);

export default router;