"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Loader2,
  ShieldCheck,
  Truck,
  Wallet,
} from "lucide-react";
import { useAuthStore } from "../../store/auth-store";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const benefits = [
  { icon: Truck, label: "Fast, tracked delivery" },
  { icon: ShieldCheck, label: "Secure, protected checkout" },
  { icon: Wallet, label: "Pay by card or cash on delivery" },
];

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Login failed.");
      }

      setAuth(data.token, data.user);

      router.push("/products");
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-(--background)">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* ============================================================
            BRAND PANEL — hidden on small screens
        ============================================================ */}
        <div className="relative hidden overflow-hidden lg:block">
          <img
            src="https://images.unsplash.com/photo-1611068562065-994ba66501ba?fm=jpg&q=80&w=1400&auto=format&fit=crop"
            alt="Delivery courier in an orange jacket walking a city sidewalk in daylight"
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-(--primary-dark)/95 via-(--primary-dark)/70 to-(--primary-dark)/40" />

          <div className="relative z-10 flex h-full flex-col justify-between p-12">
            <Link href="/" className="text-2xl font-black tracking-[-0.06em]">
              <span className="text-white">Shop</span>
              <span className="text-(--accent)">ora</span>
            </Link>

            <div>
              <h2 className="max-w-sm text-3xl font-black leading-[1.15] text-white">
                A better way
                <br />
                to shop.
              </h2>

              <ul className="mt-7 space-y-3.5">
                {benefits.map((benefit) => (
                  <li
                    key={benefit.label}
                    className="flex items-center gap-3 text-sm font-semibold text-white/90"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15">
                      <benefit.icon size={16} />
                    </span>
                    {benefit.label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ============================================================
            FORM
        ============================================================ */}
        <div className="flex items-center justify-center px-4 py-14 sm:px-6 lg:py-16">
          <div className="w-full max-w-md">
            <Link
              href="/"
              className="mb-9 flex justify-center text-2xl font-black tracking-[-0.06em] lg:hidden"
            >
              <span className="text-(--primary)">Shop</span>
              <span className="text-(--text)">ora</span>
            </Link>

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-(--primary-light) text-(--primary)">
              <LockKeyhole size={24} />
            </div>

            <h1 className="mt-5 text-center text-2xl font-black">
              Welcome back
            </h1>

            <p className="mt-1 text-center text-sm text-(--muted)">
              Log in to continue shopping on Shopora.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label htmlFor="email" className="text-sm font-bold">
                  Email address
                </label>

                <div className="relative mt-2">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-(--muted)"
                  />

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="h-12 w-full rounded-xl border border-(--border) bg-(--surface-soft) pl-11 pr-4 text-sm outline-none transition focus:border-(--primary) focus:ring-4 focus:ring-(--primary-light)"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="text-sm font-bold">
                  Password
                </label>

                <div className="relative mt-2">
                  <LockKeyhole
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-(--muted)"
                  />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    className="h-12 w-full rounded-xl border border-(--border) bg-(--surface-soft) pl-11 pr-11 text-sm outline-none transition focus:border-(--primary) focus:ring-4 focus:ring-(--primary-light)"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-(--muted) transition hover:text-(--primary)"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-(--primary) px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-purple-200 transition hover:-translate-y-0.5 hover:bg-(--primary-dark) disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Log in"
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-(--muted)">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-bold text-(--primary) hover:underline"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
