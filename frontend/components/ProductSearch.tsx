"use client";

import Link from "next/link";
import {
  ArrowRight,
  Loader2,
  Search,
  X,
} from "lucide-react";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";

import {
  getProductsPage,
  type Product,
} from "../lib/products";

interface ProductSearchProps {
  mobile?: boolean;
  inlineDropdown?: boolean;
}

const MAX_DROPDOWN_HEIGHT = 448;
const MAX_RESULTS_HEIGHT = 220;
const VIEWPORT_PADDING = 12;
const DROPDOWN_GAP = 10;

export default function ProductSearch({
  mobile = false,
  inlineDropdown = false,
}: ProductSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [dropUp, setDropUp] = useState(false);
  const [availableHeight, setAvailableHeight] = useState(
    MAX_DROPDOWN_HEIGHT
  );
  const [retryKey, setRetryKey] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const listboxId = useId();

  // Keep the floating navbar dropdown within the viewport.
  // Hero search uses inlineDropdown, so this positioning logic
  // is intentionally skipped there.
  useEffect(() => {
    if (!open || inlineDropdown) return;

    const updateDropdownPosition = () => {
      const input = inputRef.current;
      if (!input) return;

      const rect = input.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      const spaceBelow = Math.max(
        0,
        viewportHeight -
          rect.bottom -
          DROPDOWN_GAP -
          VIEWPORT_PADDING
      );

      const spaceAbove = Math.max(
        0,
        rect.top -
          DROPDOWN_GAP -
          VIEWPORT_PADDING
      );

      const shouldOpenUp =
        spaceBelow < 260 && spaceAbove > spaceBelow;

      const availableSpace = shouldOpenUp
        ? spaceAbove
        : spaceBelow;

      setDropUp(shouldOpenUp);

      setAvailableHeight(
        Math.min(MAX_DROPDOWN_HEIGHT, availableSpace)
      );
    };

    updateDropdownPosition();

    window.addEventListener("resize", updateDropdownPosition);
    window.addEventListener("scroll", updateDropdownPosition, true);

    return () => {
      window.removeEventListener(
        "resize",
        updateDropdownPosition
      );

      window.removeEventListener(
        "scroll",
        updateDropdownPosition,
        true
      );
    };
  }, [open, inlineDropdown]);

  // Debounced product search.
  useEffect(() => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      abortControllerRef.current?.abort();

      setResults([]);
      setLoading(false);
      setError(false);
      setOpen(false);
      setActiveIndex(-1);

      return;
    }

    if (trimmedQuery.length < 2) {
      abortControllerRef.current?.abort();

      setResults([]);
      setLoading(false);
      setError(false);
      setOpen(true);
      setActiveIndex(-1);

      return;
    }

    setOpen(true);
    setLoading(true);
    setError(false);
    setActiveIndex(-1);

    let isCurrentRequest = true;

    const timer = window.setTimeout(async () => {
      abortControllerRef.current?.abort();

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const data = await getProductsPage(
          undefined,
          1,
          8,
          trimmedQuery
        );

        if (
          !isCurrentRequest ||
          controller.signal.aborted
        ) {
          return;
        }

        setResults(
          data.products.filter(
            (product) => product.status === "ACTIVE"
          )
        );
      } catch {
        if (
          !isCurrentRequest ||
          controller.signal.aborted
        ) {
          return;
        }

        setResults([]);
        setError(true);
      } finally {
        if (
          isCurrentRequest &&
          !controller.signal.aborted
        ) {
          setLoading(false);
        }
      }
    }, 250);

    return () => {
      isCurrentRequest = false;

      window.clearTimeout(timer);
      abortControllerRef.current?.abort();
    };
  }, [query, retryKey]);

  // Scroll the active keyboard result into view.
  useEffect(() => {
    if (!open || activeIndex < 0) return;

    const activeOption = document.getElementById(
      `${listboxId}-option-${activeIndex}`
    );

    activeOption?.scrollIntoView({
      block: "nearest",
    });
  }, [activeIndex, listboxId, open]);

  // Close the dropdown when clicking outside the search.
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  // Close the dropdown on Escape.
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      setOpen(false);
      setActiveIndex(-1);
      inputRef.current?.blur();
    };

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  const handleViewAll = () => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) return;

    window.location.href = `/products?search=${encodeURIComponent(
      trimmedQuery
    )}`;
  };

  const handleKeyDown = (
    event: ReactKeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (event.key === "ArrowDown") {
      if (!open || results.length === 0) return;

      event.preventDefault();

      setActiveIndex((current) =>
        current < results.length - 1
          ? current + 1
          : 0
      );

      return;
    }

    if (event.key === "ArrowUp") {
      if (!open || results.length === 0) return;

      event.preventDefault();

      setActiveIndex((current) =>
        current > 0
          ? current - 1
          : results.length - 1
      );

      return;
    }

    if (event.key === "Enter") {
      if (
        open &&
        activeIndex >= 0 &&
        results[activeIndex]
      ) {
        event.preventDefault();

        window.location.href = `/products/${results[activeIndex].slug}`;

        return;
      }

      if (query.trim()) {
        event.preventDefault();
        handleViewAll();
      }
    }
  };

  const handleClear = () => {
    abortControllerRef.current?.abort();

    setQuery("");
    setResults([]);
    setLoading(false);
    setError(false);
    setOpen(false);
    setActiveIndex(-1);

    inputRef.current?.focus();
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(price);

  const hasResults =
    !loading &&
    !error &&
    results.length > 0;

  return (
    <div
      ref={containerRef}
      className="relative w-full"
    >
      <label
        htmlFor={
          mobile
            ? "shopora-mobile-search"
            : "shopora-search"
        }
        className="sr-only"
      >
        Search Shopora products
      </label>

      <Search
        size={mobile ? 18 : 19}
        aria-hidden="true"
        className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-(--muted)"
      />

      <input
        ref={inputRef}
        id={
          mobile
            ? "shopora-mobile-search"
            : "shopora-search"
        }
        type="search"
        value={query}
        onChange={(event) =>
          setQuery(event.target.value)
        }
        onFocus={() => {
          if (query.trim()) {
            setOpen(true);
          }
        }}
        onKeyDown={handleKeyDown}
        placeholder={
          mobile
            ? "Search products..."
            : "Search for products, brands and more..."
        }
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={
          activeIndex >= 0
            ? `${listboxId}-option-${activeIndex}`
            : undefined
        }
        className="h-12 w-full rounded-full border border-(--border) bg-(--surface) pl-12 pr-12 text-sm text-(--text) outline-none transition-all placeholder:text-(--muted) focus:border-(--primary) focus:ring-4 focus:ring-(--primary-light)"
      />

      {query && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-(--muted) transition hover:bg-(--surface-soft) hover:text-(--text)"
        >
          <X size={16} />
        </button>
      )}

      {open && (
        <div
          className={
            inlineDropdown
              ? "relative z-40 mt-3 w-full max-w-full overflow-hidden rounded-2xl border border-(--border) bg-(--surface) shadow-xl"
              : `absolute left-0 right-0 z-100 overflow-hidden rounded-2xl border border-(--border) bg-(--surface) shadow-2xl ${
                  dropUp
                    ? "bottom-[calc(100%+10px)]"
                    : "top-[calc(100%+10px)]"
                }`
          }
          style={
            inlineDropdown
              ? {
                  maxHeight: "360px",
                }
              : {
                  maxHeight: `${Math.min(
                    MAX_DROPDOWN_HEIGHT,
                    availableHeight
                  )}px`,
                }
          }
        >
          <div
            className={
              inlineDropdown
                ? "flex max-h-90 flex-col overflow-hidden"
                : "flex flex-col overflow-hidden"
            }
          >
            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center gap-3 px-5 py-5 text-sm text-(--muted)">
                <Loader2
                  size={18}
                  className="animate-spin text-(--primary)"
                />

                <span>
                  Searching Shopora...
                </span>
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="flex flex-col items-center justify-center px-5 py-6 text-center">
                <p className="text-sm font-semibold text-(--text)">
                  Something went wrong.
                </p>

                <p className="mt-1 text-xs text-(--muted)">
                  Please try your search again.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setError(false);
                    setRetryKey(
                      (current) => current + 1
                    );
                  }}
                  className="mt-3 text-sm font-bold text-(--primary) hover:underline"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Minimum search length */}
            {!loading &&
              !error &&
              query.trim().length < 2 && (
                <div className="flex flex-col items-center justify-center px-5 py-6 text-center">
                  <p className="text-sm font-semibold text-(--text)">
                    Keep typing...
                  </p>

                  <p className="mt-1 text-xs text-(--muted)">
                    Enter at least 2 characters to
                    search the catalogue.
                  </p>
                </div>
              )}

            {/* No results */}
            {!loading &&
              !error &&
              query.trim().length >= 2 &&
              results.length === 0 && (
                <div className="flex flex-col items-center justify-center px-5 py-7 text-center">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-(--primary-light) text-(--primary)">
                    <Search size={19} />
                  </div>

                  <p className="mt-3 text-sm font-bold text-(--text)">
                    No products found
                  </p>

                  <p className="mt-1 text-xs text-(--muted)">
                    Try another product, category or
                    keyword.
                  </p>

                  <button
                    type="button"
                    onClick={handleViewAll}
                    className="mt-3 text-sm font-bold text-(--primary) hover:underline"
                  >
                    Search the full catalogue
                  </button>
                </div>
              )}

            {/* Results */}
            {hasResults && (
              <>
                <div className="shrink-0 border-b border-(--border) px-5 py-3">
                  <p className="text-[11px] font-black uppercase tracking-[0.14em] text-(--muted)">
                    Products
                  </p>
                </div>

                <div
                  ref={resultsRef}
                  id={listboxId}
                  role="listbox"
                  aria-label="Product search results"
                  className="min-h-0 max-h-55 overflow-x-hidden overflow-y-auto overscroll-contain p-2"
                  style={{
                    scrollbarGutter: "stable",
                  }}
                >
                  {results.map(
                    (product, index) => (
                      <Link
                        key={product.id}
                        id={`${listboxId}-option-${index}`}
                        href={`/products/${product.slug}`}
                        onClick={() =>
                          setOpen(false)
                        }
                        role="option"
                        aria-selected={
                          activeIndex === index
                        }
                        className={`flex min-w-0 items-center gap-3 rounded-xl p-3 transition-colors ${
                          activeIndex === index
                            ? "bg-(--primary-light)"
                            : "hover:bg-(--surface-soft)"
                        }`}
                      >
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-(--border) bg-(--surface-soft)">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt=""
                              loading="lazy"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-(--muted)">
                              <Search size={17} />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-(--text)">
                            {product.name}
                          </p>

                          <p className="mt-0.5 truncate text-xs text-(--muted)">
                            {product.category?.name ??
                              "Shopora product"}
                          </p>

                          <p className="mt-1 text-sm font-black text-(--primary)">
                            {formatPrice(
                              product.price
                            )}
                          </p>
                        </div>

                        <ArrowRight
                          size={16}
                          aria-hidden="true"
                          className="shrink-0 text-(--muted)"
                        />
                      </Link>
                    )
                  )}
                </div>

                {/* View all */}
                <div className="shrink-0 border-t border-(--border) p-2">
                  <button
                    type="button"
                    onClick={handleViewAll}
                    className="flex w-full min-w-0 items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-bold text-(--primary) transition hover:bg-(--primary-light)"
                  >
                    <span className="min-w-0 truncate">
                      View all results for &quot;
                      {query.trim()}&quot;
                    </span>

                    <ArrowRight
                      size={17}
                      aria-hidden="true"
                      className="shrink-0"
                    />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}