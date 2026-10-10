
import Hero from "@/component/Hero";
import ProductGrid from "@/component/ProductGrid";
import {
  type Product,
  getChange,
  getDirection,
} from "@/component/GroceryCard";
import { connection } from "next/server";

const API_URL =
  "https://api.api-store.workers.dev/api/bazardor/products";

function isObject(
  value: unknown
): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getProducts(data: unknown): Product[] {
  for (let i = 0; i < 8; i++) {
    if (Array.isArray(data)) {
      return data.filter(isObject) as Product[];
    }

    if (!isObject(data)) return [];

    data =
      data.products ??
      data.items ??
      data.results ??
      data.data;
  }

  return [];
}

export default async function Home() {
  // Build time-এর বদলে request-এর সময় ডেটা আনবে
  await connection();

  let products: Product[] = [];
  let apiError = false;

  try {
    const response = await fetch(API_URL, {
      cache: "no-store",
    });

    if (!response.ok) {
      apiError = true;
      console.error(
        "Products API error:",
        response.status
      );
    } else {
      const data: unknown = await response.json();
      products = getProducts(data);
    }
  } catch (error) {
    apiError = true;
    console.error("Products fetch error:", error);
  }

  const risers = products
    .filter((product) => getDirection(product) === "up")
    .sort((a, b) => getChange(b) - getChange(a))
    .slice(0, 6);

  const fallers = products
    .filter((product) => getDirection(product) === "down")
    .sort((a, b) => getChange(a) - getChange(b))
    .slice(0, 6);

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Hero />

      {apiError && (
        <p className="mt-6 rounded-lg bg-error/10 p-4 text-error">
          পণ্যের API থেকে তথ্য আনা যায়নি। API URL ও সার্ভার লগ পরীক্ষা করুন।
        </p>
      )}

      <section className="mt-10">
        <div className="mb-5">
          <h2 className="text-2xl font-extrabold text-success">
            আজ দাম বেড়েছে ▲
          </h2>
          <p className="mt-1 text-sm text-base-content/60">
            যেসব পণ্যের দাম বেড়েছে
          </p>
        </div>

        <ProductGrid products={risers} />
      </section>

      <section className="mt-10">
        <div className="mb-5">
          <h2 className="text-2xl font-extrabold text-error">
            আজ দাম কমেছে ▼
          </h2>
          <p className="mt-1 text-sm text-base-content/60">
            যেসব পণ্যের দাম কমেছে
          </p>
        </div>

        <ProductGrid products={fallers} />
      </section>

      <section className="mt-10">
        <div className="mb-5">
          <h2 className="text-2xl font-extrabold">
            সব পণ্য
          </h2>
          <p className="mt-1 text-sm text-base-content/60">
            নিত্যপ্রয়োজনীয় পণ্যের আজকের দাম এক জায়গায় দেখুন।
          </p>
        </div>

        <ProductGrid products={products} />
      </section>
    </main>
  );
}

