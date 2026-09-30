import Link from "next/link";
import {
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Truck,
  Wallet,
} from "lucide-react";
import { SITE_CONFIG } from "../lib/site-config";
import {
  XIcon,
  TikTokIcon,
  LinkedInIcon,
  GitHubIcon,
} from "./icons/SocialIcons";

const shopLinks = [
  { label: "All products", href: "/products" },
  { label: "Categories", href: "/categories" },
  { label: "Your cart", href: "/cart" },
  { label: "Your orders", href: "/orders" },
];

const companyLinks = [
  { label: "About Shopora", href: "/about" },
  { label: "Contact us", href: "/contact" },
];

const accountLinks = [
  { label: "Log in", href: "/login" },
  { label: "Create account", href: "/register" },
];

export default function Footer() {
  return (
    <footer className="border-t border-(--border) bg-(--surface)">
      {/* ============================================================
          TRUST STRIP
          ============================================================ */}

      <div className="border-b border-(--border) bg-(--surface-soft)">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:grid-cols-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-(--primary-light) text-(--primary)">
              <Truck size={20} />
            </div>
            <div>
              <p className="text-sm font-bold">Fast delivery</p>
              <p className="text-xs text-(--muted)">
                Nationwide shipping, tracked door to door
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-(--accent-light) text-(--accent-dark)">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-sm font-bold">Secure shopping</p>
              <p className="text-xs text-(--muted)">
                Your payments are protected end to end
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-(--primary-light) text-(--primary)">
              <Wallet size={20} />
            </div>
            <div>
              <p className="text-sm font-bold">Flexible payment</p>
              <p className="text-xs text-(--muted)">
                Pay by card or cash on delivery
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          LINK COLUMNS
          ============================================================ */}

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand + contact */}
          <div className="lg:col-span-2">
            <Link
              href="/"
              className="text-[26px] font-black tracking-[-0.06em]"
            >
              <span className="text-(--primary)">Shop</span>
              <span className="text-(--text)">ora</span>
            </Link>

            <p className="mt-3 max-w-xs text-sm leading-6 text-(--muted)">
              A better way to shop — quality products, honest
              prices, and a checkout you can trust.
            </p>

            <div className="mt-5 space-y-2.5 text-sm text-(--muted)">
              <p className="flex items-center gap-2">
                <MapPin size={16} className="shrink-0 text-(--primary)" />
                {SITE_CONFIG.address}
              </p>

              <a
                href={`tel:${SITE_CONFIG.contactPhoneHref}`}
                className="flex items-center gap-2 transition hover:text-(--primary)"
              >
                <Phone size={16} className="shrink-0 text-(--primary)" />
                {SITE_CONFIG.contactPhoneDisplay}
              </a>

              <a
                href={`mailto:${SITE_CONFIG.contactEmail}`}
                className="flex items-center gap-2 transition hover:text-(--primary)"
              >
                <Mail size={16} className="shrink-0 text-(--primary)" />
                {SITE_CONFIG.contactEmail}
              </a>
            </div>

            {/* Socials */}
            <div className="mt-6 flex items-center gap-3">
              <a
                href={SITE_CONFIG.socials.x}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Shopora on X"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-(--surface-soft) text-(--text-soft) transition hover:bg-(--primary-light) hover:text-(--primary)"
              >
                <XIcon />
              </a>

              <a
                href={SITE_CONFIG.socials.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Shopora on TikTok"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-(--surface-soft) text-(--text-soft) transition hover:bg-(--primary-light) hover:text-(--primary)"
              >
                <TikTokIcon />
              </a>

              <a
                href={SITE_CONFIG.socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Shopora on LinkedIn"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-(--surface-soft) text-(--text-soft) transition hover:bg-(--primary-light) hover:text-(--primary)"
              >
                <LinkedInIcon />
              </a>

              <a
                href={SITE_CONFIG.socials.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Shopora on GitHub"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-(--surface-soft) text-(--text-soft) transition hover:bg-(--primary-light) hover:text-(--primary)"
              >
                <GitHubIcon />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-sm font-black uppercase tracking-wide text-(--text)">
              Shop
            </h3>

            <ul className="mt-4 space-y-3">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-(--muted) transition hover:text-(--primary)"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-black uppercase tracking-wide text-(--text)">
              Company
            </h3>

            <ul className="mt-4 space-y-3">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-(--muted) transition hover:text-(--primary)"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-sm font-black uppercase tracking-wide text-(--text)">
              Account
            </h3>

            <ul className="mt-4 space-y-3">
              {accountLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-(--muted) transition hover:text-(--primary)"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ============================================================
          BOTTOM BAR
          ============================================================ */}

      <div className="border-t border-(--border)">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-(--muted) sm:flex-row sm:px-6 lg:px-8">
          <p>
            © {new Date().getFullYear()} Shopora. All rights
            reserved.
          </p>

          <p>Built with care, for a better way to shop.</p>
        </div>
      </div>
    </footer>
  );
}