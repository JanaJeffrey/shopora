"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  LayoutGrid,
  LayoutDashboard,
  Package,
  ShoppingBag,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { useAuthStore } from "../../store/auth-store";
import { useHasHydrated } from "../../lib/use-has-hydrated";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Categories", href: "/admin/categories", icon: LayoutGrid },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const hasHydrated = useHasHydrated();
  const user = useAuthStore((state) => state.user);

  // Wait until the persisted auth store has actually hydrated on the
  // client before deciding whether to redirect — otherwise a real
  // admin would get bounced on every refresh (see
  // lib/use-has-hydrated.ts for why this pattern is needed).
  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    if (!user || user.role !== "ADMIN") {
      router.replace("/login");
    }
  }, [hasHydrated, user, router]);

  if (!hasHydrated || !user || user.role !== "ADMIN") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-(--background)">
        <Loader2 size={32} className="animate-spin text-(--primary)" />
      </main>
    );
  }

  return (
    <div className="flex min-h-screen bg-(--background)">
      {/* ============================================================
          SIDEBAR
      ============================================================ */}
      <aside className="hidden w-64 shrink-0 border-r border-(--border) bg-(--surface) lg:block">
        <div className="flex h-full flex-col p-5">
          <Link
            href="/"
            className="px-2 text-xl font-black tracking-[-0.06em]"
          >
            <span className="text-(--primary)">Shop</span>
            <span className="text-(--text)">ora</span>
            <span className="ml-1.5 rounded-md bg-(--accent-light) px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-(--accent-dark)">
              Admin
            </span>
          </Link>

          <nav className="mt-8 flex flex-1 flex-col gap-1">
            {navItems.map((item) => {
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition ${
                    isActive
                      ? "bg-(--primary-light) text-(--primary)"
                      : "text-(--text-soft) hover:bg-(--surface-soft)"
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-(--muted) transition hover:bg-(--surface-soft)"
          >
            <ArrowLeft size={18} />
            Back to store
          </Link>
        </div>
      </aside>

      {/* ============================================================
          MOBILE TOP NAV — sidebar collapses to a horizontal scroll
          strip on small screens instead of a hidden drawer, so admin
          actions stay reachable without extra menu-toggle state.
      ============================================================ */}
      <div className="fixed inset-x-0 top-0 z-20 border-b border-(--border) bg-(--surface) lg:hidden">
        <div className="flex items-center gap-1 overflow-x-auto px-3 py-2.5">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-xs font-bold transition ${
                  isActive
                    ? "bg-(--primary-light) text-(--primary)"
                    : "text-(--text-soft)"
                }`}
              >
                <item.icon size={15} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* ============================================================
          MAIN CONTENT
      ============================================================ */}
      <main className="min-w-0 flex-1 pt-14 lg:pt-0">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
