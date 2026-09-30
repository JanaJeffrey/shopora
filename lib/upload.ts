import { useAuthStore } from "../store/auth-store";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

/**
 * Uploads an image file to the backend, which stores it in Supabase
 * Storage and returns a public URL. Deliberately doesn't reuse
 * apiFetch — that helper always sends Content-Type: application/json,
 * which would break a file upload. The browser needs to set its own
 * multipart/form-data boundary automatically, so we build this
 * request by hand instead.
 */
export async function uploadImage(file: File): Promise<string> {
  const token = useAuthStore.getState().token;

  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`${API_URL}/admin/upload`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Failed to upload image.");
  }

  return data.url;
}
