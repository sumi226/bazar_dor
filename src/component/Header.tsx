

import { connection } from "next/server";
import Image from "next/image";

import logo from "@/assets/logo-icon.png";
import NavLinks from "@/component/NavLinks";
import Marquee, { type Product } from "@/component/Marquee";

interface Category {
  id: string | number;
  slug: string;
  icon?: string;
  nameBn: string;
}

const CATEGORIES_URL =
  "https://api.api-store.workers.dev/api/bazardor/categories";

const PRODUCTS_URL = "https://api.api-store.workers.dev/api/bazardor/products";

function unwrapArray(data: unknown): unknown[] {
  for (let i = 0; i < 6; i++) {
    if (Array.isArray(data)) return data;
    if (!data || typeof data !== "object") return [];

    const obj = data as Record<string, unknown>;
    const next =
      obj.categories ?? obj.products ?? obj.items ?? obj.results ?? obj.data;

    if (next === undefined || next === data) return [];
    data = next;
  }

  return [];
}

export default async function Header() {
  await connection();

  const date = new Date().toLocaleDateString("bn-BD", {
    dateStyle: "full",
    timeZone: "Asia/Dhaka",
  });

  const [categoryResult, productResult] = await Promise.allSettled([
    fetch(CATEGORIES_URL, { cache: "no-store" }),
    fetch(PRODUCTS_URL, { cache: "no-store" }),
  ]);

  let categories: Category[] = [];
  let products: Product[] = [];

  if (categoryResult.status === "fulfilled" && categoryResult.value.ok) {
    categories = unwrapArray(await categoryResult.value.json()) as Category[];
  }

  if (productResult.status === "fulfilled" && productResult.value.ok) {
    products = unwrapArray(await productResult.value.json()) as Product[];
  }

  return (
    <header className="border-b bg-gray-100 shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center pt-10 justify-between gap-3 px-4 py-4">
        <div className="flex min-w-0 items-center gap-3">
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
            <p className="mt-1 text-xs text-gray-700 sm:text-sm">{date}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button className="rounded-xl bg-lime-300 px-3 py-2 text-sm font-medium hover:bg-green-500 hover:text-white sm:px-4">
            সাইন ইন
          </button>
          <button className="rounded-xl bg-lime-300 px-3 py-2 text-sm font-medium hover:bg-green-500 hover:text-white sm:px-4">
            সাইন আপ
          </button>
        </div>
      </div>

      <NavLinks categories={categories} />
      <Marquee products={products} />
    </header>
  );
}
