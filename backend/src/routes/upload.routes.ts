import { Router } from "express";
import multer from "multer";

import { uploadProductImage } from "../controllers/upload.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/admin.middleware.js";

const router = Router();

// Files are held in memory just long enough to forward them to
// Supabase Storage — nothing is written to disk on this server.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

router.use(authenticate);
router.use(requireAdmin);

router.post("/", upload.single("image"), uploadProductImage);

export default router;
