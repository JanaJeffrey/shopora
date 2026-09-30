import { useAuthStore } from "../store/auth-store";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not configured");
}

export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  // The auth store persists to localStorage, so this only has a token
  // once we're running in the browser (client components / event handlers).
  const token =
    typeof window !== "undefined"
      ? useAuthStore.getState().token
      : null;

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers || {}),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message || "Something went wrong"
    );
  }

  return data;
}
