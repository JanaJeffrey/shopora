import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().trim().min(2).max(150),

  description: z.string().trim().min(10),

  price: z.number().positive(),

  stock: z.number().int().min(0),

  image: z.string().url(),

  categoryId: z.number().int().positive(),
});

export const updateProductSchema = createProductSchema.partial();