import Link from "next/link";
import { ArrowRight, LayoutGrid, PackageSearch } from "lucide-react";
import { getCategories } from "../../lib/categories";

const CARD_ACCENTS = [
  { bg: "bg-(--primary-light)", text: "text-(--primary)" },
  { bg: "bg-(--accent-light)", text: "text-(--accent-dark)" },
];

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <main className="min-h-screen bg-(--background)">
      {/* ============================================================
          PAGE HEADER
      ============================================================ */}
      <section className="border-b border-(--border) bg-(--surface-warm)">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-(--border-purple) bg-(--primary-light) px-3.5 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-(--primary)">
            <LayoutGrid size={14} />
            Browse by category
          </div>

          <h1 className="mt-4 text-3xl font-black tracking-tight text-(--text) sm:text-4xl lg:text-5xl">
            Find exactly what
            <br />
            <span className="text-(--primary)">you&apos;re after.</span>
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-(--muted) sm:text-base">
            Every category, curated. Pick one below to jump straight
            to the products in it.
          </p>
        </div>
      </section>

      {/* ============================================================
          CATEGORY GRID
      ============================================================ */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {categories.length === 0 ? (
          <div className="rounded-4xl border border-(--border) bg-(--surface) px-6 py-20 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-(--primary-light) text-(--primary)">
              <PackageSearch size={28} />
            </div>

            <h2 className="mt-5 text-2xl font-black text-(--text)">
              No categories yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-(--muted)">
              Categories will show up here as soon as they&apos;re
              added.
            </p>

            <Link
              href="/products"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-(--primary) px-6 py-3 text-sm font-black text-white transition hover:bg-(--primary-dark)"
            >
              Browse all products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category, index) => {
              const accent = CARD_ACCENTS[index % CARD_ACCENTS.length];

              return (
                <Link
                  key={category.id}
                  href={`/products?category=${category.slug}`}
                  className="group flex flex-col rounded-[1.75rem] border border-(--border) bg-(--surface) p-6 shadow-sm transition hover:-translate-y-1 hover:border-(--primary) hover:shadow-lg"
                >
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl ${accent.bg} ${accent.text}`}
                  >
                    <LayoutGrid size={24} />
                  </div>

                  <h3 className="mt-5 text-xl font-black text-(--text)">
                    {category.name}
                  </h3>

                  {category.description && (
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-(--muted)">
                      {category.description}
                    </p>
                  )}

                  <div className="mt-6 flex items-center justify-between">
                    <span className="text-xs font-bold text-(--muted)">
                      {category._count.products}{" "}
                      {category._count.products === 1
                        ? "product"
                        : "products"}
                    </span>

                    <span className="flex items-center gap-1 text-sm font-bold text-(--primary) transition group-hover:gap-2">
                      Shop now
                      <ArrowRight size={16} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
