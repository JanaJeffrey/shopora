"use client";

import { useEffect, useState } from "react";

/**
 * The cart and auth stores are persisted to localStorage, which doesn't
 * exist during server-side rendering. zustand's `persist` middleware
 * rehydrates from localStorage synchronously on the client, so by the
 * time React reconciles the first client render against the server-sent
 * HTML, the client may already have real data the server never had —
 * causing a hydration mismatch.
 *
 * Any component that renders persisted store data directly should gate
 * that render behind this hook: render a neutral/loading state until
 * `hasHydrated` flips to true (which only happens after the initial
 * hydration pass has already completed), then render the real data.
 */
export function useHasHydrated() {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    // This is the standard mount-detection pattern for exactly this
    // scenario (see the file-level comment above) — there's no way to
    // know "the client has mounted" without an effect that sets state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasHydrated(true);
  }, []);

  return hasHydrated;
}
