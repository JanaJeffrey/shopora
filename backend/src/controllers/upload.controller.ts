import type { Request, Response } from "express";
import { randomUUID } from "crypto";
import {
  supabaseStorage,
  PRODUCT_IMAGES_BUCKET,
} from "../config/supabaseStorage.js";

// ============================================================
// UPLOAD PRODUCT IMAGE (ADMIN)
// POST /api/admin/upload
// Expects a single file under the "image" field
// (multipart/form-data), handled by multer in the route.
// ============================================================

export const uploadProductImage = async (
  req: Request,
  res: Response
) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        message: "No image file was provided.",
      });
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({
        message:
          "Unsupported image type. Use JPG, PNG, WEBP, or GIF.",
      });
    }

    const extension = file.originalname.split(".").pop() || "jpg";
    const fileName = `${randomUUID()}.${extension}`;

    const { error: uploadError } = await supabaseStorage.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);

      return res.status(500).json({
        message: "Failed to upload image.",
      });
    }

    const { data } = supabaseStorage.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .getPublicUrl(fileName);

    return res.status(200).json({
      message: "Image uploaded successfully",
      url: data.publicUrl,
    });
  } catch (error) {
    console.error("Upload product image error:", error);

    return res.status(500).json({
      message: "Failed to upload image.",
    });
  }
};
