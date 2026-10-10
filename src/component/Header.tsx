
import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";

import logo from "@/assets/logo-icon.png";
import NavLinks from "@/component/NavLinks";
import Marquee, { type Product } from "@/component/Marquee";
import LogoutButton from "@/component/auth/LogOutButton";
import { auth } from "@/lib/auth";

interface Category {
  id: string | number;
  slug: string;
  icon?: string;
  nameBn: string;
}

const BASE_URLS = [

  "https://openapi.programming-hero.com/api/bazardor",
  "https://api.api-store.workers.dev/api/bazardor",
  "https://api.abcz.workers.dev/api/bazardor",
];

function unwrapArray(data: unknown): unknown[] {
  for (let i = 0; i < 8; i++) {
    if (Array.isArray(data)) return data;

    if (typeof data !== "object" || data === null) {
      return [];
    }

    const obj = data as Record<string, unknown>;

    const next =
      obj.categories ??
      obj.products ??
      obj.items ??
      obj.results ??
      obj.data;

    if (next === undefined || next === data) {
      return [];
    }

    data = next;
  }

  return [];
}

async function fetchWithFallback(
  endpoint: "categories" | "products",
): Promise<unknown[]> {
  for (const baseUrl of BASE_URLS) {
    const url = `${baseUrl}/${endpoint}`;

    try {
      const response = await fetch(url, {
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      });

      if (!response.ok) {
        console.warn(
          `API failed: ${url} - HTTP ${response.status}`,
        );
        continue;
      }

      const data: unknown = await response.json();
      const items = unwrapArray(data);

      if (items.length > 0) {
        return items;
      }
    } catch (error) {
      console.error(`API request failed: ${url}`, error);
    }
  }

  return [];
}

function isCategory(item: unknown): item is Category {
  if (typeof item !== "object" || item === null) {
    return false;
  }

  const category = item as Record<string, unknown>;

  return (
    (typeof category.id === "string" ||
      typeof category.id === "number") &&
    typeof category.slug === "string" &&
    typeof category.nameBn === "string"
  );
}

function isProduct(item: unknown): item is Product {
  return typeof item === "object" && item !== null;
}

export default async function Header() {
  const requestHeaders = await headers();

  const [session, categoryData, productData] =
    await Promise.all([
      auth.api.getSession({
        headers: requestHeaders,
      }),
      fetchWithFallback("categories"),
      fetchWithFallback("products"),
    ]);

  const date = new Date().toLocaleDateString("bn-BD", {
    dateStyle: "full",
    timeZone: "Asia/Dhaka",
  });

  const categories = categoryData.filter(isCategory);
  const products = productData.filter(isProduct);

  return (
    <header className="border-b bg-gray-100 shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:pt-8">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-3"
          aria-label="বাজার দর হোম"
        >
          <Image
            src={logo}
            alt="বাজার দর Logo"
            width={80}
            height={80}
            priority
            className="h-14 w-14 shrink-0 rounded-2xl bg-lime-300 p-2 object-contain sm:h-16 sm:w-16"
          />

          <div className="min-w-0">
            <h1 className="text-lg font-bold text-gray-900 sm:text-xl">
              🛒 বাজার দর
            </h1>

            <p className="mt-1 text-xs text-gray-700 sm:text-sm">
              {date}
            </p>
          </div>
        </Link>

        <div className="flex shrink-0 items-center gap-2">
          {session?.user ? (
            <LogoutButton />
          ) : (
            <>
              <Link
                href="/signin"
                className="rounded-xl bg-lime-300 px-3 py-2 text-sm font-medium transition hover:bg-green-500 hover:text-white sm:px-4"
              >
                সাইন ইন
              </Link>

              <Link
                href="/signup"
                className="rounded-xl bg-lime-300 px-3 py-2 text-sm font-medium transition hover:bg-green-500 hover:text-white sm:px-4"
              >
                সাইন আপ
              </Link>
            </>
          )}
        </div>
      </div>

      <NavLinks categories={categories} />

      <Marquee products={products} />
    </header>
  );
}
