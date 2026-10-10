
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import ProductGrid from "@/component/ProductGrid";
import type { Product } from "@/component/GroceryCard";

const API_URL =
  "https://api.api-store.workers.dev/api/bazardor";

type SortOption = "default" | "low" | "high";

interface Category {
  slug: string;
  nameBn?: string;
  name?: string;
  icon?: string;
  emoji?: string;
}

function isObject(
  value: unknown
): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function unwrapArray(value: unknown): unknown[] {
  for (let i = 0; i < 6; i++) {
    if (Array.isArray(value)) return value;
    if (!isObject(value)) return [];

    const next =
      value.products ??
      value.categories ??
      value.items ??
      value.results ??
      value.data;

    if (next === undefined || next === value) return [];
    value = next;
  }

  return [];
}

function getPrice(product: Product): number {
  const value = product.today ?? product.priceBn;

  if (typeof value === "number") return value;
  if (typeof value !== "string") return 0;

  const normalized = value
    .replace(/[০-৯]/g, (digit) =>
      String("০১২৩৪৫৬৭৮৯".indexOf(digit))
    )
    .replace(/,/g, "")
    .replace(/ টাকা/g, "")
    .trim();

  const result = Number(normalized);
  return Number.isFinite(result) ? result : 0;
}

export default function CategoryPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [category, setCategory] =
    useState<Category | null>(null);
  const [products, setProducts] =
    useState<Product[]>([]);
  const [sort, setSort] =
    useState<SortOption>("default");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError(false);
      setCategory(null);
      setProducts([]);

      try {
        const [categoriesResponse, productsResponse] =
          await Promise.all([
            fetch(`${API_URL}/categories`, {
              signal: controller.signal,
              cache: "no-store",
            }),
            fetch(`${API_URL}/products`, {
              signal: controller.signal,
              cache: "no-store",
            }),
          ]);

        if (
          !categoriesResponse.ok ||
          !productsResponse.ok
        ) {
          throw new Error("API request failed");
        }

        const [categoriesJson, productsJson]: unknown[] =
          await Promise.all([
            categoriesResponse.json(),
            productsResponse.json(),
          ]);

        const categories = unwrapArray(categoriesJson)
          .filter(isObject);

        const found = categories.find(
          (item) => item.slug === slug
        );

        if (!found) {
          setError(true);
          return;
        }

        setCategory({
          slug,
          nameBn:
            typeof found.nameBn === "string"
              ? found.nameBn
              : undefined,
          name:
            typeof found.name === "string"
              ? found.name
              : undefined,
          icon:
            typeof found.icon === "string"
              ? found.icon
              : undefined,
          emoji:
            typeof found.emoji === "string"
              ? found.emoji
              : undefined,
        });

        const allProducts = unwrapArray(productsJson)
          .filter(isObject) as Product[];

        const filtered = allProducts.filter((product) => {
          const categoryValue =
            product.categorySlug ?? product.category;

          if (typeof categoryValue === "string") {
            return categoryValue === slug;
          }

          if (isObject(categoryValue)) {
            return categoryValue.slug === slug;
          }

          return false;
        });

        setProducts(filtered);
      } catch (err) {
        if (
          err instanceof Error &&
          err.name === "AbortError"
        ) {
          return;
        }

        console.error("Category fetch error:", err);
        setError(true);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => controller.abort();
  }, [slug]);

  const sortedProducts = useMemo(() => {
    const result = [...products];

    if (sort === "low") {
      result.sort((a, b) => getPrice(a) - getPrice(b));
    }

    if (sort === "high") {
      result.sort((a, b) => getPrice(b) - getPrice(a));
    }

    return result;
  }, [products, sort]);

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 h-8 w-52 animate-pulse rounded bg-base-300" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => (
            <div
              key={index}
              className="card animate-pulse border border-base-300 bg-base-100"
            >
              <div className="card-body gap-4">
                <div className="size-14 rounded-xl bg-base-300" />
                <div className="h-5 w-3/4 rounded bg-base-300" />
                <div className="h-4 w-1/2 rounded bg-base-200" />
                <div className="h-7 w-2/3 rounded bg-base-300" />
              </div>
            </div>
          ))}
        </div>
      </main>
    );
  }

  if (error || !category || products.length === 0) {
    return (
      <main className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
        <span className="text-5xl">🛒</span>

        <h1 className="mt-4 text-2xl font-bold">
          {error
            ? "ক্যাটাগরির তথ্য পাওয়া যায়নি"
            : "এই ক্যাটাগরিতে পণ্য নেই"}
        </h1>

        <p className="mt-2 text-base-content/60">
          ক্যাটাগরির slug ও API response যাচাই করুন।
        </p>

        <Link href="/" className="btn btn-primary mt-5">
          হোম পেজে ফিরে যান
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-4xl">
              {category.icon ?? category.emoji ?? "🛒"}
            </span>

            <h1 className="text-2xl font-extrabold sm:text-3xl">
              {category.nameBn ??
                category.name ??
                category.slug}
            </h1>
          </div>

          <p className="mt-2 text-sm text-base-content/60">
            এই ক্যাটাগরির পণ্যের আজকের দাম।
          </p>
        </div>

        <label className="flex items-center gap-3">
          <span className="shrink-0">দাম সাজান:</span>

          <select
            value={sort}
            onChange={(event) =>
              setSort(event.target.value as SortOption)
            }
            className="select select-bordered w-full max-w-xs"
          >
            <option value="default">ডিফল্ট</option>
            <option value="low">কম থেকে বেশি</option>
            <option value="high">বেশি থেকে কম</option>
          </select>
        </label>
      </div>

      <p className="mb-5 text-sm text-base-content/60">
        মোট {new Intl.NumberFormat("bn-BD").format(products.length)}টি পণ্য
      </p>

      <ProductGrid products={sortedProducts} />
    </main>
  );
}
