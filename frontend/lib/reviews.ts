import { apiFetch } from "./api";

export interface Review {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: {
    id: number;
    name: string;
  };
}

interface ReviewsResponse {
  reviews: Review[];
  averageRating: number | null;
  reviewCount: number;
}

interface ReviewResponse {
  message: string;
  review: Review;
}

export async function getProductReviews(
  productId: number
): Promise<ReviewsResponse> {
  return apiFetch<ReviewsResponse>(`/reviews/${productId}`);
}

export async function submitReview(
  productId: number,
  input: { rating: number; comment: string }
): Promise<Review> {
  const data = await apiFetch<ReviewResponse>(
    `/reviews/${productId}`,
    {
      method: "POST",
      body: JSON.stringify(input),
    }
  );

  return data.review;
}

export async function deleteReview(
  productId: number
): Promise<void> {
  await apiFetch(`/reviews/${productId}`, {
    method: "DELETE",
  });
}