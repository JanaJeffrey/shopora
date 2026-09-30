"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  ShoppingCart,
  Heart,
  UserRound,
  LogOut,
  LayoutDashboard,
  Package,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useCartStore } from "../store/cart-store";
import { useAuthStore } from "../store/auth-store";
import { useHasHydrated } from "../lib/use-has-hydrated";

import ThemeToggle from "./ThemeToggle";
import ProductSearch from "./ProductSearch";

const navItems = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Products",
    href: "/products",
  },
  {
    label: "Categories",
    href: "/categories",
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [accountOpen, setAccountOpen] =
    useState(false);

  const accountMenuRef =
    useRef<HTMLDivElement>(null);

  const headerRef =
    useRef<HTMLElement>(null);

  const hasHydrated =
    useHasHydrated();

  // ==========================================================
  // CART
  // ==========================================================

  const items = useCartStore(
    (state) => state.items
  );

  const cartCount = hasHydrated
    ? items.reduce(
        (total, item) =>
          total + item.quantity,
        0
      )
    : 0;

  // ==========================================================
  // AUTH
  // ==========================================================

  const persistedUser =
    useAuthStore(
      (state) => state.user
    );

  const user = hasHydrated
    ? persistedUser
    : null;

  const logout =
    useAuthStore(
      (state) => state.logout
    );

  // ==========================================================
  // LOGOUT
  // ==========================================================

  const handleLogout = () => {
    logout();

    setMobileOpen(false);
    setAccountOpen(false);

    router.push("/");
  };

  // ==========================================================
  // ACTIVE NAVIGATION
  // ==========================================================

  const isActive = (
    href: string
  ) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(
      href
    );
  };

  // ==========================================================
  // KEEP NAVBAR HEIGHT AVAILABLE GLOBALLY
  // ==========================================================

  useEffect(() => {
    const headerElement =
      headerRef.current;

    if (!headerElement) {
      return;
    }

    const updateHeight = () => {
      document.documentElement.style.setProperty(
        "--navbar-height",
        `${headerElement.offsetHeight}px`
      );
    };

    updateHeight();

    const resizeObserver =
      new ResizeObserver(
        updateHeight
      );

    resizeObserver.observe(
      headerElement
    );

    return () => {
      resizeObserver.disconnect();
    };
  }, [mobileOpen]);

  // ==========================================================
  // CLOSE ACCOUNT MENU OUTSIDE CLICK
  // ==========================================================

  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent
    ) => {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(
          event.target as Node
        )
      ) {
        setAccountOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // ==========================================================
  // CLOSE MOBILE MENU ON ROUTE CHANGE
  // ==========================================================

  useEffect(() => {
    setMobileOpen(false);
    setAccountOpen(false);
  }, [pathname]);

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 border-b border-(--border) bg-(--background)/95 backdrop-blur-xl"
    >
      {/* ======================================================
          TOP PROMO BAR
      ======================================================= */}

      <div className="hidden bg-(--primary) text-white sm:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2 text-xs font-semibold">
          <p>
            Shop smarter. Shop better.
            Shop Shopora.
          </p>

          <p className="text-white/80">
            Fast delivery • Secure shopping
            • Great deals
          </p>
        </div>
      </div>

      {/* ======================================================
          MAIN NAVBAR
      ======================================================= */}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-19 flex-nowrap items-center gap-3">
          {/* LOGO */}

          <Link
            href="/"
            onClick={() =>
              setMobileOpen(false)
            }
            className="shrink-0 text-[28px] font-black tracking-[-0.06em]"
          >
            <span className="text-(--primary)">
              Shop
            </span>

            <span className="text-(--text)">
              ora
            </span>
          </Link>

          {/* DESKTOP SEARCH */}

          <div className="hidden min-w-0 flex-1 md:block">
            <ProductSearch />
          </div>

          {/* DESKTOP NAVIGATION */}

          <nav className="hidden shrink-0 items-center gap-1 lg:flex">
            {navItems.map(
              (item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "rounded-full px-3 py-2 text-sm font-bold transition-colors",
                    isActive(item.href)
                      ? "bg-(--primary-light) text-(--primary)"
                      : "text-(--text-soft) hover:bg-(--surface-soft) hover:text-(--text)",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>

          {/* THEME */}

          <div className="shrink-0">
            <ThemeToggle />
          </div>

          {/* FAVORITES */}

          <Link
            href="/favorites"
            aria-label="Favorites"
            className={[
              "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
              "text-(--text-soft) transition-colors",
              "hover:bg-(--surface-soft) hover:text-(--primary)",
            ].join(" ")}
          >
            <Heart
              size={19}
              strokeWidth={2}
            />
          </Link>

          {/* CART */}

          <Link
            href="/cart"
            aria-label={`Shopping cart${
              cartCount > 0
                ? ` with ${cartCount} items`
                : ""
            }`}
            className={[
              "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
              "text-(--text-soft) transition-colors",
              "hover:bg-(--surface-soft) hover:text-(--primary)",
            ].join(" ")}
          >
            <ShoppingCart
              size={19}
              strokeWidth={2}
            />

            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-(--primary) px-1 text-[10px] font-black text-white ring-2 ring-(--background)">
                {cartCount >
                99
                  ? "99+"
                  : cartCount}
              </span>
            )}
          </Link>

          {/* ACCOUNT */}

          <div
            ref={accountMenuRef}
            className="relative hidden shrink-0 sm:block"
          >
            {user ? (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setAccountOpen(
                      (current) =>
                        !current
                    )
                  }
                  aria-expanded={
                    accountOpen
                  }
                  aria-haspopup="menu"
                  className={[
                    "flex h-10 items-center gap-2 rounded-full px-3",
                    "text-(--text-soft) transition-colors",
                    "hover:bg-(--surface-soft) hover:text-(--text)",
                  ].join(" ")}
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-(--primary-light) text-(--primary)">
                    <UserRound
                      size={15}
                    />
                  </span>

                  <span className="hidden max-w-25 truncate text-sm font-bold lg:block">
                    {user.name ||
                      user.email}
                  </span>

                  <ChevronDown
                    size={15}
                    className={
                      accountOpen
                        ? "rotate-180 transition-transform"
                        : "transition-transform"
                    }
                  />
                </button>

                {accountOpen && (
                  <div className="absolute right-0 top-[calc(100%+10px)] z-100 w-64 overflow-hidden rounded-2xl border border-(--border) bg-(--surface) p-2 shadow-2xl">
                    <div className="border-b border-(--border) px-3 py-3">
                      <p className="truncate text-sm font-bold text-(--text)">
                        {user.name ||
                          "Shopora Customer"}
                      </p>

                      <p className="mt-0.5 truncate text-xs text-(--muted)">
                        {user.email}
                      </p>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/orders"
                        onClick={() =>
                          setAccountOpen(
                            false
                          )
                        }
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-(--text-soft) transition hover:bg-(--surface-soft) hover:text-(--text)"
                      >
                        <Package
                          size={17}
                        />

                        My Orders
                      </Link>

                      {user.role ===
                        "ADMIN" && (
                        <Link
                          href="/admin"
                          onClick={() =>
                            setAccountOpen(
                              false
                            )
                          }
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-(--text-soft) transition hover:bg-(--primary-light) hover:text-(--primary)"
                        >
                          <LayoutDashboard
                            size={17}
                          />

                          Admin Dashboard
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-(--border) pt-1">
                      <button
                        type="button"
                        onClick={
                          handleLogout
                        }
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-(--text-soft) transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                      >
                        <LogOut
                          size={17}
                        />

                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <Link
                href="/login"
                className="flex h-10 items-center gap-2 rounded-full bg-(--primary) px-4 text-sm font-bold text-white transition hover:bg-(--primary-dark)"
              >
                <UserRound
                  size={17}
                />

                <span>
                  Login
                </span>
              </Link>
            )}
          </div>

          {/* MOBILE MENU BUTTON */}

          <button
            type="button"
            onClick={() =>
              setMobileOpen(
                (current) =>
                  !current
              )
            }
            aria-label={
              mobileOpen
                ? "Close menu"
                : "Open menu"
            }
            aria-expanded={
              mobileOpen
            }
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-(--text-soft) transition hover:bg-(--surface-soft) hover:text-(--text) lg:hidden"
          >
            {mobileOpen ? (
              <X size={21} />
            ) : (
              <Menu size={21} />
            )}
          </button>
        </div>

        {/* ====================================================
            MOBILE SEARCH
        ===================================================== */}

        <div className="pb-4 md:hidden">
          <ProductSearch mobile />
        </div>

        {/* ====================================================
            MOBILE MENU
        ===================================================== */}

        {mobileOpen && (
          <div className="border-t border-(--border) py-4 lg:hidden">
            {/* NAV LINKS */}

            <nav className="grid gap-1">
              {navItems.map(
                (item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() =>
                      setMobileOpen(
                        false
                      )
                    }
                    className={[
                      "flex items-center rounded-xl px-4 py-3 text-sm font-bold transition-colors",
                      isActive(item.href)
                        ? "bg-(--primary-light) text-(--primary)"
                        : "text-(--text-soft) hover:bg-(--surface-soft) hover:text-(--text)",
                    ].join(" ")}
                  >
                    {item.label}
                  </Link>
                )
              )}
            </nav>

            {/* MOBILE ACCOUNT */}

            <div className="mt-3 border-t border-(--border) pt-3">
              {user ? (
                <>
                  <div className="mb-2 flex items-center gap-3 rounded-xl bg-(--surface-soft) px-4 py-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-(--primary-light) text-(--primary)">
                      <UserRound
                        size={17}
                      />
                    </span>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-(--text)">
                        {user.name ||
                          "Shopora Customer"}
                      </p>

                      <p className="truncate text-xs text-(--muted)">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/orders"
                    onClick={() =>
                      setMobileOpen(
                        false
                      )
                    }
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-(--text-soft) transition hover:bg-(--surface-soft) hover:text-(--text)"
                  >
                    <Package
                      size={18}
                    />

                    My Orders
                  </Link>

                  {user.role ===
                    "ADMIN" && (
                    <Link
                      href="/admin"
                      onClick={() =>
                        setMobileOpen(
                          false
                        )
                      }
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-(--text-soft) transition hover:bg-(--primary-light) hover:text-(--primary)"
                    >
                      <LayoutDashboard
                        size={18}
                      />

                      Admin Dashboard
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={
                      handleLogout
                    }
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-(--text-soft) transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                  >
                    <LogOut
                      size={18}
                    />

                    Sign out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() =>
                    setMobileOpen(
                      false
                    )
                  }
                  className="flex items-center justify-center gap-2 rounded-xl bg-(--primary) px-4 py-3 text-sm font-bold text-white transition hover:bg-(--primary-dark)"
                >
                  <UserRound
                    size={18}
                  />

                  Login
                </Link>
              )}
            </div>

            {/* MOBILE QUICK LINKS */}

            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-(--border) pt-3">
              <Link
                href="/favorites"
                onClick={() =>
                  setMobileOpen(
                    false
                  )
                }
                className="flex items-center justify-center gap-2 rounded-xl border border-(--border) px-3 py-3 text-sm font-bold text-(--text-soft) transition hover:border-(--primary) hover:text-(--primary)"
              >
                <Heart
                  size={17}
                />

                Favorites
              </Link>

              <Link
                href="/cart"
                onClick={() =>
                  setMobileOpen(
                    false
                  )
                }
                className="flex items-center justify-center gap-2 rounded-xl border border-(--border) px-3 py-3 text-sm font-bold text-(--text-soft) transition hover:border-(--primary) hover:text-(--primary)"
              >
                <ShoppingCart
                  size={17}
                />

                Cart
                {cartCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-(--primary) px-1 text-[10px] font-black text-white">
                    {cartCount >
                    99
                      ? "99+"
                      : cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}