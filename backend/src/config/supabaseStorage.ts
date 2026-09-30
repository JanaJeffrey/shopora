import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env to enable image uploads."
  );
}

// The service role key bypasses Row Level Security — this client
// must ONLY ever be used on the backend (never sent to the browser).
export const supabaseStorage = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
);

export const PRODUCT_IMAGES_BUCKET =
  process.env.SUPABASE_STORAGE_BUCKET || "product-images";
