import Link from "next/link";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  ShoppingCart,
  SlidersHorizontal,
  X,
} from "lucide-react";

import { getProductsPage } from "../../lib/products";
import { getCategories } from "../../lib/categories";
import ProductCard from "../../components/ProductCard";

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    page?: string;
    search?: string;
  }>;
}

function getPageNumbers(
  currentPage: number,
  totalPages: number
): Array<number | "ellipsis"> {
  if (totalPages <= 7) {
    return Array.from(
      { length: totalPages },
      (_, index) => index + 1
    );
  }

  const pages: Array<number | "ellipsis"> = [1];

  if (currentPage > 3) {
    pages.push("ellipsis");
  }

  const startPage = Math.max(2, currentPage - 1);
  const endPage = Math.min(
    totalPages - 1,
    currentPage + 1
  );

  for (let page = startPage; page <= endPage; page++) {
    pages.push(page);
  }

  if (currentPage < totalPages - 2) {
    pages.push("ellipsis");
  }

  pages.push(totalPages);

  return pages;
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const {
    category: categorySlug,
    page: pageParam,
    search: searchParam,
  } = await searchParams;

  const searchQuery = searchParam?.trim() || undefined;

  const requestedPage = Math.max(
    Number(pageParam) || 1,
    1
  );

  const pageSize = 24;

  const [productsData, categories] = await Promise.all([
    getProductsPage(
      categorySlug,
      requestedPage,
      pageSize,
      searchQuery
    ),
    getCategories(),
  ]);

  const activeProducts = productsData.products.filter(
    (product) => product.status === "ACTIVE"
  );

  const pagination = productsData.pagination;

  const activeCategory = categorySlug
    ? categories.find(
        (category) => category.slug === categorySlug
      )
    : undefined;

  const currentPage = pagination.page;
  const totalPages = pagination.totalPages;

  const pageNumbers = getPageNumbers(
    currentPage,
    totalPages
  );

  function createPageHref(page: number) {
    const params = new URLSearchParams();

    if (categorySlug) {
      params.set("category", categorySlug);
    }

    if (searchQuery) {
      params.set("search", searchQuery);
    }

    params.set("page", String(page));

    return `/products?${params.toString()}`;
  }

  const firstItem =
    pagination.total === 0
      ? 0
      : (currentPage - 1) * pagination.limit + 1;

  const lastItem = Math.min(
    currentPage * pagination.limit,
    pagination.total
  );

  return (
    <main className="min-h-screen bg-(--background)">
      {/* ============================================================
          PAGE HERO
      ============================================================ */}
      <section className="border-b border-(--border) bg-(--surface-warm)">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-(--border-purple) bg-(--primary-light) px-3.5 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-(--primary)">
                <LayoutGrid size={14} />

                {activeCategory
                  ? activeCategory.name
                  : searchQuery
                    ? "Search Results"
                    : "Shopora Catalogue"}
              </div>

              <h1 className="mt-4 text-3xl font-black tracking-tight text-(--text) sm:text-4xl lg:text-5xl">
                {searchQuery ? (
                  <>
                    Results for{" "}
                    <span className="text-(--primary)">
                      &quot;{searchQuery}&quot;.
                    </span>
                  </>
                ) : activeCategory ? (
                  <>
                    Shop{" "}
                    <span className="text-(--primary)">
                      {activeCategory.name}.
                    </span>
                  </>
                ) : (
                  <>
                    Find something
                    <br />
                    <span className="text-(--primary)">
                      you&apos;ll love.
                    </span>
                  </>
                )}
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-(--muted) sm:text-base">
                {searchQuery
                  ? pagination.total > 0
                    ? `Showing products matching your search for "${searchQuery}".`
                    : `We couldn't find any products matching "${searchQuery}".`
                  : activeCategory
                    ? activeCategory.description ||
                      `Explore our ${activeCategory.name.toLowerCase()} collection, curated for quality, value, and everyday usefulness.`
                    : "Explore our complete catalogue of products, curated for quality, value, and everyday usefulness."}
              </p>
            </div>

            <Link
              href="/cart"
              className="inline-flex w-fit shrink-0 items-center gap-2 rounded-xl border border-(--border) bg-(--surface) px-5 py-3 text-sm font-black text-(--text) shadow-sm transition hover:-translate-y-0.5 hover:border-(--primary) hover:text-(--primary) hover:shadow-md"
            >
              <ShoppingCart size={17} />
              View cart
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================
          CATALOGUE
      ============================================================ */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Toolbar */}
        <div className="mb-6 flex flex-col gap-4 border-b border-(--border) pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-(--muted)">
              <SlidersHorizontal className="h-5 w-5" />

              <p className="text-sm">
                {pagination.total === 0
                  ? "No products found"
                  : `Showing ${firstItem}–${lastItem} of ${pagination.total} products`}
              </p>
            </div>

            {searchQuery && (
              <Link
                href={
                  categorySlug
                    ? `/products?category=${encodeURIComponent(categorySlug)}`
                    : "/products"
                }
                className="inline-flex items-center gap-1 rounded-full bg-(--primary-light) px-3 py-1.5 text-xs font-black text-(--primary) transition hover:bg-(--border-purple)"
              >
                Search: {searchQuery}

                <X className="h-3.5 w-3.5" />
              </Link>
            )}

            {activeCategory && (
              <Link
                href={
                  searchQuery
                    ? `/products?search=${encodeURIComponent(searchQuery)}`
                    : "/products"
                }
                className="inline-flex items-center gap-1 rounded-full bg-(--primary-light) px-3 py-1.5 text-xs font-black text-(--primary) transition hover:bg-(--border-purple)"
              >
                {activeCategory.name}

                <X className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </div>

        {/* Products */}
        {activeProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {activeProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        ) : (
          <div className="flex min-h-87.5 flex-col items-center justify-center rounded-4xl border border-dashed border-(--border) bg-(--surface) px-6 text-center shadow-sm">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-(--primary-light) text-(--primary)">
              <ShoppingCart className="h-6 w-6" />
            </div>

            <h2 className="text-xl font-black text-(--text)">
              No products found
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-(--muted)">
              {searchQuery
                ? `We couldn't find any products matching "${searchQuery}". Try a different search term.`
                : activeCategory
                  ? "There are currently no products available for this category."
                  : "There are currently no products available."}
            </p>

            {(activeCategory || searchQuery) && (
              <Link
                href="/products"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-(--primary) px-5 py-2.5 text-sm font-black text-white transition hover:bg-(--primary-dark)"
              >
                View all products
                <ArrowRight size={16} />
              </Link>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-(--border) pt-6 sm:flex-row">
            <p className="text-sm text-(--muted)">
              Page {currentPage} of {totalPages}
            </p>

            <div className="flex items-center gap-1">
              {currentPage > 1 ? (
                <Link
                  href={createPageHref(
                    currentPage - 1
                  )}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-(--border) bg-(--surface) text-(--text) transition hover:border-(--primary) hover:text-(--primary)"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Link>
              ) : (
                <span
                  className="flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-lg border border-(--border) bg-(--surface-warm) text-gray-300"
                  aria-hidden="true"
                >
                  <ChevronLeft className="h-4 w-4" />
                </span>
              )}

              {pageNumbers.map((page, index) =>
                page === "ellipsis" ? (
                  <span
                    key={`ellipsis-${index}`}
                    className="flex h-10 w-10 items-center justify-center text-sm text-(--muted)"
                  >
                    ...
                  </span>
                ) : (
                  <Link
                    key={page}
                    href={createPageHref(page)}
                    aria-current={
                      page === currentPage
                        ? "page"
                        : undefined
                    }
                    className={`flex h-10 min-w-10 items-center justify-center rounded-lg px-3 text-sm font-bold transition ${
                      page === currentPage
                        ? "bg-(--primary) text-white"
                        : "border border-(--border) bg-(--surface) text-(--text) hover:border-(--primary) hover:text-(--primary)"
                    }`}
                  >
                    {page}
                  </Link>
                )
              )}

              {currentPage < totalPages ? (
                <Link
                  href={createPageHref(
                    currentPage + 1
                  )}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-(--border) bg-(--surface) text-(--text) transition hover:border-(--primary) hover:text-(--primary)"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Link>
              ) : (
                <span
                  className="flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-lg border border-(--border) bg-(--surface-warm) text-gray-300"
                  aria-hidden="true"
                >
                  <ChevronRight className="h-4 w-4" />
                </span>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}