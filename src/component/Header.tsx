
import { connection } from "next/server";
import Image from "next/image";

import logo from "@/assets/logo-icon.png";
import NavLinks from "@/component/NavLinks";
import Marquee from "@/component/Marquee";

interface Category {
  id: string;
  slug: string;
  icon?: string;
  nameBn: string;
}

interface Product {
  id: string | number;
  nameBn?: string;
  name?: string;
  icon?: string;
  emoji?: string;
  price?: number;
  priceBn?: number;
  unit?: string;
  change?: number;
  changePercent?: number;
}

const Header = async () => {
  // নতুন Next.js prerender error এড়ানোর জন্য
  await connection();

  const date = new Date().toLocaleDateString("bn-BD", {
    dateStyle: "full",
  });

  const [categoriesRes, productsRes] = await Promise.all([
    fetch(
      "https://api.api-store.workers.dev/api/bazardor/categories",
      {
        cache: "no-store",
      }
    ),
    fetch(
      "https://api.api-store.workers.dev/api/bazardor/products",
      {
        cache: "no-store",
      }
    ),
  ]);

  if (!categoriesRes.ok) {
    throw new Error("Categories API থেকে data আনা যায়নি");
  }

  if (!productsRes.ok) {
    throw new Error("Products API থেকে data আনা যায়নি");
  }

  const categoriesData = await categoriesRes.json();
  const productsData = await productsRes.json();

  const categories: Category[] = Array.isArray(categoriesData)
    ? categoriesData
    : categoriesData.data ?? [];

  const products: Product[] = Array.isArray(productsData)
    ? productsData
    : productsData.data ?? [];

  return (
    <header className="border-b bg-white shadow-sm">
      {/* =========================
          TOP HEADER
      ========================== */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        {/* Logo + Title + Date */}
        <div className="flex items-center gap-3">
          <Image
            src={logo}
            alt="বাজার দর Logo"
            width={64}
            height={64}
            priority
            className="h-16 w-16 object-contain"
          />

          <div>
            <h1 className="text-xl font-bold text-gray-900">🛒 বাজার দর</h1>

            <p className="mt-1 text-sm text-gray-500">{date}</p>
          </div>
        </div>

        {/* Login / Signup */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-xl px-4 py-2 font-medium bg-lime-300 text-gray-700 transition hover:bg-amber-400  hover:text-white "
          >
            সাইন ইন
          </button>

          <button
            type="button"
            className="rounded-xl px-4 py-2 font-medium bg-lime-300 text-gray-700 transition hover:bg-amber-400  hover:text-white "
          >
            সাইন আপ
          </button>
        </div>
      </div>

      {/* =========================
          NAVIGATION
      ========================== */}
      <NavLinks categories={categories} />

      {/* =========================
          PRICE MARQUEE
      ========================== */}
      <Marquee products={products} />
    </header>
  );
};

export default Header;

