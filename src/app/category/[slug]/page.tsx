
import Hero from "@/component/Hero";
import ProductGrid from "@/component/ProductGrid";
import type { Product } from "@/component/GroceryCard";

const API_URL =
  "https://api.api-store.workers.dev/api/bazardor/products";

function isObject(
  value: unknown
): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getProducts(data: unknown): Product[] {
  for (let i = 0; i < 6; i++) {
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

function getChange(product: Product): number {
  const value = product.pct ?? product.changePercent;

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const normalized = value
      .replace(/[০-৯]/g, (digit) =>
        String("০১২৩৪৫৬৭৮৯".indexOf(digit))
      )
      .replace(/%/g, "")
      .replace(/,/g, "")
      .trim();

    const number = Number(normalized);
    return Number.isFinite(number) ? number : 0;
  }

  return 0;
}

function getDirection(product: Product): "up" | "down" | "flat" {
  const dir = String(product.dir ?? "").toLowerCase();

  if (["up", "increase", "increased", "rise"].includes(dir)) {
    return "up";
  }

  if (["down", "decrease", "decreased", "fall"].includes(dir)) {
    return "down";
  }

  const change = getChange(product);

  if (change > 0) return "up";
  if (change < 0) return "down";

  return "flat";
}

export default async function Home() {
  let products: Product[] = [];

  try {
    const response = await fetch(API_URL, {
      cache: "no-store",
    });

    if (response.ok) {
      products = getProducts(await response.json());
    }
  } catch (error) {
    console.error("Products fetch error:", error);
  }

  // Section A: Top 6 price risers
  const risers = products
    .filter((product) => getDirection(product) === "up")
    .sort((a, b) => getChange(b) - getChange(a))
    .slice(0, 6);

  // Section B: Top 6 price fallers
  const fallers = products
    .filter((product) => getDirection(product) === "down")
    .sort((a, b) => getChange(a) - getChange(b))
    .slice(0, 6);

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Hero />

      {/* Section A: আজ দাম বেড়েছে */}
      <section className="mt-10">
        <div className="mb-5">
          <h2 className="text-2xl font-extrabold text-success">
            আজ দাম বেড়েছে ▲
          </h2>
          <p className="mt-1 text-sm text-base-content/60">
            যেসব পণ্যের দাম সবচেয়ে বেশি বেড়েছে
          </p>
        </div>

        {risers.length > 0 ? (
          <ProductGrid products={risers} />
        ) : (
          <p className="rounded-xl border border-base-300 p-6 text-center text-base-content/60">
            আজ দাম বেড়েছে এমন পণ্যের তথ্য নেই।
          </p>
        )}
      </section>

      {/* Section B: আজ দাম কমেছে */}
      <section className="mt-10">
        <div className="mb-5">
          <h2 className="text-2xl font-extrabold text-error">
            আজ দাম কমেছে ▼
          </h2>
          <p className="mt-1 text-sm text-base-content/60">
            যেসব পণ্যের দাম সবচেয়ে বেশি কমেছে
          </p>
        </div>

        {fallers.length > 0 ? (
          <ProductGrid products={fallers} />
        ) : (
          <p className="rounded-xl border border-base-300 p-6 text-center text-base-content/60">
            আজ দাম কমেছে এমন পণ্যের তথ্য নেই।
          </p>
        )}
      </section>

      {/* Section C: সব পণ্য */}
      <section className="mt-10">
        <div className="mb-5">
          <h2 className="text-2xl font-extrabold">
            সব পণ্য
          </h2>
          <p className="mt-1 text-sm text-base-content/60">
            বাজারের নিত্যপ্রয়োজনীয় সব পণ্যের আজকের দাম এক জায়গায় দেখুন।
          </p>
        </div>

        <ProductGrid products={products} />
      </section>
    </main>
  );
}
