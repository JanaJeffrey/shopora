import Link from "next/link";
import {
  ArrowLeft,
  Check,
  ShieldCheck,
  ShoppingCart,
  Truck,
  ChevronRight,
} from "lucide-react";
import ProductActions from "../../../components/ProductActions";
import FavoriteButton from "../../../components/FavoriteButton";
import ProductReviews from "../../../components/ProductReviews";
import { getProductBySlug } from "../../../lib/products";
import { formatPrice } from "../../../lib/currency";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}


function getDiscountPercentage(
  price: number,
  compareAtPrice: number | null
) {
  if (!compareAtPrice || compareAtPrice <= price) {
    return 0;
  }

  return Math.round(
    ((compareAtPrice - price) / compareAtPrice) * 100
  );
}

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { slug } = await params;

  let product;

  try {
    product = await getProductBySlug(slug);
  } catch {
    return (
      <main className="min-h-screen bg-(--background) px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-xl rounded-[2rem] border border-(--border) bg-(--surface) px-6 py-14 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-(--primary-light) text-(--primary)">
            <ShoppingCart size={27} />
          </div>

          <h1 className="mt-5 text-3xl font-black">
            Product not found
          </h1>

          <p className="mt-3 text-sm leading-6 text-(--muted)">
            The product you&apos;re looking for doesn&apos;t exist or is
            no longer available.
          </p>

          <Link
            href="/products"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-(--primary) px-6 py-3 text-sm font-bold text-white transition hover:bg-(--primary-dark)"
          >
            <ArrowLeft size={17} />
            Back to products
          </Link>
        </div>
      </main>
    );
  }

  const available =
    product.status === "ACTIVE" && product.stock > 0;

  const compareAtPrice = product.compareAtPrice;

  const discount = getDiscountPercentage(
    product.price,
    compareAtPrice
  );

  return (
    <main className="min-h-screen bg-(--background)">
      {/* ============================================================
          BREADCRUMB
      ============================================================ */}
      <div className="border-b border-(--border) bg-(--surface)">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-hidden text-sm">
            <Link
              href="/"
              className="shrink-0 font-semibold text-(--muted) transition hover:text-(--primary)"
            >
              Home
            </Link>

            <ChevronRight
              size={15}
              className="shrink-0 text-(--muted)"
            />

            <Link
              href="/products"
              className="shrink-0 font-semibold text-(--muted) transition hover:text-(--primary)"
            >
              Products
            </Link>

            <ChevronRight
              size={15}
              className="shrink-0 text-(--muted)"
            />

            <span className="truncate font-semibold text-(--text)">
              {product.name}
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================
          PRODUCT SECTION
      ============================================================ */}
      <section className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
        <div className="grid gap-7 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          {/* ========================================================
              IMAGE
          ======================================================== */}
          <div>
            <div className="relative overflow-hidden rounded-[2rem] border border-(--border) bg-(--surface) shadow-sm">
              <div className="aspect-square">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-(--surface-soft) text-sm font-semibold text-(--muted)">
                    No image available
                  </div>
                )}
              </div>

              {discount > 0 && (
                <span className="absolute left-5 top-5 rounded-xl bg-(--accent) px-3 py-2 text-xs font-black text-white shadow-sm">
                  -{discount}% OFF
                </span>
              )}

              {!available && (
                <span className="absolute bottom-5 left-5 rounded-xl bg-(--text)/80 px-3 py-2 text-xs font-black text-white">
                  OUT OF STOCK
                </span>
              )}

              <FavoriteButton
                productId={product.id}
                productName={product.name}
              />
            </div>

            {/* Trust strip */}
            <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
              <div className="rounded-2xl border border-(--border) bg-(--surface) px-3 py-3 text-center">
                <Truck
                  size={18}
                  className="mx-auto text-(--primary)"
                />

                <p className="mt-1.5 text-[10px] font-bold sm:text-xs">
                  Fast delivery
                </p>
              </div>

              <div className="rounded-2xl border border-(--border) bg-(--surface) px-3 py-3 text-center">
                <ShieldCheck
                  size={18}
                  className="mx-auto text-(--primary)"
                />

                <p className="mt-1.5 text-[10px] font-bold sm:text-xs">
                  Secure shopping
                </p>
              </div>

              <div className="rounded-2xl border border-(--border) bg-(--surface) px-3 py-3 text-center">
                <Check
                  size={18}
                  className="mx-auto text-(--primary)"
                />

                <p className="mt-1.5 text-[10px] font-bold sm:text-xs">
                  Quality products
                </p>
              </div>
            </div>
          </div>

          {/* ========================================================
              PRODUCT INFORMATION
          ======================================================== */}
          <div className="flex flex-col">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-(--primary)">
              Shopora Marketplace
            </p>

            <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight text-(--text) sm:text-4xl lg:text-[2.75rem]">
              {product.name}
            </h1>

            {/* Availability */}
            <div className="mt-4 flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  available
                    ? "bg-(--success)"
                    : "bg-(--danger)"
                }`}
              />

              <span
                className={`text-sm font-bold ${
                  available
                    ? "text-(--success)"
                    : "text-(--danger)"
                }`}
              >
                {available
                  ? `${product.stock} available`
                  : "Currently unavailable"}
              </span>
            </div>

            {/* Price card */}
            <div className="mt-6 rounded-3xl border border-(--border) bg-(--surface) p-5 sm:p-6">
              <div className="flex flex-wrap items-end gap-3">
                <span className="text-3xl font-black text-(--primary) sm:text-4xl">
                  {formatPrice(product.price)}
                </span>

                {compareAtPrice &&
                  compareAtPrice > product.price && (
                    <span className="pb-1 text-sm font-semibold text-(--muted) line-through sm:text-base">
                      {formatPrice(compareAtPrice)}
                    </span>
                  )}

                {discount > 0 && (
                  <span className="rounded-lg bg-(--accent-light) px-2.5 py-1 text-xs font-black text-(--accent-dark)">
                    {discount}% OFF
                  </span>
                )}
              </div>

              {discount > 0 && compareAtPrice && (
                <p className="mt-2 text-xs font-semibold text-(--accent-dark)">
                  You save {formatPrice(compareAtPrice - product.price)}
                </p>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="mt-7">
                <h2 className="text-lg font-black">
                  Product description
                </h2>

                <p className="mt-3 text-sm leading-7 text-(--muted) sm:text-base">
                  {product.description}
                </p>
              </div>
            )}

            {/* Quantity + Actions (interactive, client component) */}
            <ProductActions
              product={{
                id: product.id,
                name: product.name,
                slug: product.slug,
                price: product.price,
                image: product.image,
                stock: product.stock,
              }}
              available={available}
            />

            <div className="mt-10">
              <ProductReviews productId={product.id} />
            </div>

            {/* Delivery information */}
            <div className="mt-7 overflow-hidden rounded-3xl border border-(--border) bg-(--surface)">
              <div className="border-b border-(--border) px-5 py-4">
                <h2 className="text-sm font-black">
                  Delivery & protection
                </h2>
              </div>

              <div className="divide-y divide-(--border)">
                <div className="flex gap-4 px-5 py-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--primary-light) text-(--primary)">
                    <Truck size={19} />
                  </div>

                  <div>
                    <p className="text-sm font-bold">
                      Fast delivery
                    </p>

                    <p className="mt-1 text-xs leading-5 text-(--muted)">
                      Your order will be prepared and delivered
                      as quickly as possible.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 px-5 py-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--accent-light) text-(--accent-dark)">
                    <ShieldCheck size={19} />
                  </div>

                  <div>
                    <p className="text-sm font-bold">
                      Secure shopping
                    </p>

                    <p className="mt-1 text-xs leading-5 text-(--muted)">
                      Shop confidently with secure checkout and
                      protected payment processing.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          LOWER INFORMATION SECTION
      ============================================================ */}
      <section className="border-t border-(--border) bg-(--surface)">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-(--primary)">
              Shopora
            </p>

            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              Shop with confidence
            </h2>

            <p className="mt-3 text-sm leading-7 text-(--muted) sm:text-base">
              We are building Shopora around a simple idea:
              make online shopping clear, convenient and enjoyable.
              From discovering products to checkout and delivery,
              every part of the experience should feel simple.
            </p>
          </div>

          <Link
            href="/products"
            className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-(--primary) transition hover:gap-3"
          >
            <ArrowLeft size={16} />
            Continue shopping
          </Link>
        </div>
      </section>
    </main>
  );
}