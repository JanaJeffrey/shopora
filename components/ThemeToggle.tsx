"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { applyTheme, getStoredTheme, type Theme } from "../lib/theme";
import { useHasHydrated } from "../lib/use-has-hydrated";

interface ThemeToggleProps {
  variant?: "icon" | "full";
}

export default function ThemeToggle({
  variant = "icon",
}: ThemeToggleProps) {
  const hasHydrated = useHasHydrated();

  // Default to "light" for the very first render so it matches what
  // the server sent down; the real value (read from localStorage /
  // the class the blocking script already applied) is picked up right
  // after mount, same pattern as the cart/auth stores.
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    // Reading localStorage-derived state needs to happen after mount
    // to avoid a hydration mismatch (see lib/use-has-hydrated.ts for
    // the full explanation) — there's no way to do that without an
    // effect that sets state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(getStoredTheme());
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";

    setTheme(next);
    applyTheme(next);
  };

  const isDark = hasHydrated && theme === "dark";

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={toggle}
        className="flex items-center gap-3 rounded-2xl px-4 py-3 font-bold text-(--text-soft) transition hover:bg-(--accent-light)"
      >
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
        {isDark ? "Light mode" : "Dark mode"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={
        isDark ? "Switch to light mode" : "Switch to dark mode"
      }
      className="flex h-11 w-11 items-center justify-center rounded-full text-(--text) transition-all hover:bg-(--accent-light)"
    >
      {isDark ? <Sun size={19} /> : <Moon size={19} />}
    </button>
  );
}
