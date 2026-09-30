export type Theme = "light" | "dark";

const STORAGE_KEY = "shopora-theme";

/**
 * Reads the persisted theme preference, falling back to the user's
 * OS-level preference, then to "light". Safe to call only on the
 * client (it touches window/localStorage).
 */
export function getStoredTheme(): Theme {
  const stored = window.localStorage.getItem(STORAGE_KEY);

  if (stored === "light" || stored === "dark") {
    return stored;
  }

  const prefersDark = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;

  return prefersDark ? "dark" : "light";
}

/**
 * Applies the given theme to <html> and persists the choice.
 */
export function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle(
    "dark",
    theme === "dark"
  );

  window.localStorage.setItem(STORAGE_KEY, theme);
}

/**
 * Inline script string, meant to run in a blocking <script> tag in
 * <head> before React hydrates. This is what prevents a flash of the
 * wrong theme on page load: by the time the browser paints anything,
 * the "dark" class (if applicable) is already on <html>.
 */
export const themeInitScript = `
(function () {
  try {
    var stored = window.localStorage.getItem("${STORAGE_KEY}");
    var theme = stored === "light" || stored === "dark"
      ? stored
      : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    }
  } catch (e) {}
})();
`;
