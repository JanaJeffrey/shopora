"use client";

import { useEffect, useState } from "react";
import { Loader2, Star, Trash2 } from "lucide-react";
import {
  getProductReviews,
  submitReview,
  deleteReview,
  type Review,
} from "../lib/reviews";
import { useAuthStore } from "../store/auth-store";
import { useHasHydrated } from "../lib/use-has-hydrated";

interface ProductReviewsProps {
  productId: number;
}

function StarRow({
  rating,
  size = 16,
}: {
  rating: number;
  size?: number;
}) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          size={size}
          className={
            value <= Math.round(rating)
              ? "fill-(--accent) text-(--accent)"
              : "text-(--border)"
          }
        />
      ))}
    </div>
  );
}

export default function ProductReviews({
  productId,
}: ProductReviewsProps) {
  const hasHydrated = useHasHydrated();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState<number | null>(
    null
  );
  const [reviewCount, setReviewCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const data = await getProductReviews(productId);
      setReviews(data.reviews);
      setAverageRating(data.averageRating);
      setReviewCount(data.reviewCount);

      const ownReview = data.reviews.find(
        (review) => review.user.id === user?.id
      );

      if (ownReview) {
        setRating(ownReview.rating);
        setComment(ownReview.comment || "");
      }
    } catch {
      // A quiet failure here just means reviews don't load — not
      // worth a scary error banner on an otherwise-working page.
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const ownReview = reviews.find(
    (review) => review.user.id === user?.id
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (rating < 1) {
      setError("Pick a star rating first.");
      return;
    }

    try {
      setSaving(true);

      await submitReview(productId, {
        rating,
        comment: comment.trim(),
      });

      await load();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to save your review."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    setError("");

    try {
      await deleteReview(productId);
      setRating(0);
      setComment("");
      await load();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete your review."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-(--border) bg-(--surface) p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-black text-(--text)">
          Reviews
        </h2>

        {reviewCount > 0 && averageRating !== null && (
          <div className="flex items-center gap-2">
            <StarRow rating={averageRating} />
            <span className="text-sm font-bold text-(--text)">
              {averageRating.toFixed(1)}
            </span>
            <span className="text-sm text-(--muted)">
              ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
            </span>
          </div>
        )}
      </div>

      {/* FORM */}
      {!hasHydrated ? null : token ? (
        <form
          onSubmit={handleSubmit}
          className="mt-5 rounded-xl border border-(--border) bg-(--surface-soft) p-4"
        >
          <p className="text-sm font-bold text-(--text)">
            {ownReview ? "Edit your review" : "Leave a review"}
          </p>

          <div className="mt-2 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                onMouseEnter={() => setHoverRating(value)}
                onMouseLeave={() => setHoverRating(0)}
                aria-label={`Rate ${value} star${value === 1 ? "" : "s"}`}
              >
                <Star
                  size={24}
                  className={
                    value <= (hoverRating || rating)
                      ? "fill-(--accent) text-(--accent)"
                      : "text-(--border)"
                  }
                />
              </button>
            ))}
          </div>

          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            rows={3}
            placeholder="Optional — share your thoughts..."
            className="mt-3 w-full resize-none rounded-xl border border-(--border) bg-(--surface) px-4 py-3 text-sm outline-none transition focus:border-(--primary) focus:ring-4 focus:ring-(--primary-light)"
          />

          {error && (
            <p className="mt-2 text-xs font-semibold text-red-600">
              {error}
            </p>
          )}

          <div className="mt-3 flex items-center gap-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-(--primary) px-5 py-2.5 text-sm font-black text-white transition hover:bg-(--primary-dark) disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving && (
                <Loader2 size={15} className="animate-spin" />
              )}
              {ownReview ? "Update review" : "Submit review"}
            </button>

            {ownReview && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
              >
                <Trash2 size={15} />
                Delete
              </button>
            )}
          </div>
        </form>
      ) : (
        <p className="mt-5 text-sm text-(--muted)">
          <a
            href="/login"
            className="font-bold text-(--primary) hover:underline"
          >
            Log in
          </a>{" "}
          to leave a review.
        </p>
      )}

      {/* LIST */}
      <div className="mt-6 space-y-4">
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2
              size={24}
              className="animate-spin text-(--primary)"
            />
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-(--muted)">
            No reviews yet — be the first to share your thoughts.
          </p>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              className="border-t border-(--border) pt-4 first:border-t-0 first:pt-0"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-bold text-(--text)">
                  {review.user.name}
                </p>
                <StarRow rating={review.rating} size={14} />
              </div>

              {review.comment && (
                <p className="mt-1.5 text-sm leading-6 text-(--text-soft)">
                  {review.comment}
                </p>
              )}

              <p className="mt-1 text-xs text-(--muted)">
                {new Date(review.createdAt).toLocaleDateString(
                  "en-NG",
                  { year: "numeric", month: "short", day: "numeric" }
                )}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}