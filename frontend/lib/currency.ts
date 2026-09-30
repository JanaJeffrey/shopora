/**
 * Formats a number as Nigerian Naira, e.g. formatPrice(2500) -> "₦2,500".
 *
 * This exists so the ₦ symbol is never typed directly into a source
 * file anywhere in the app. Typing it directly is what caused it to
 * render as a garbled/wrong character in the browser — some Windows
 * editors and terminals don't save that character as proper UTF-8
 * when it's pasted in, silently corrupting the file. Intl.NumberFormat
 * generates the symbol correctly at runtime instead, so there's no
 * raw ₦ byte sequence in any file left to get mangled.
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
