// import Hero from "@/component/Hero";
// import ProductGrid from "@/component/ProductGrid";
// const Home = () => {
//   return (
//     <main className="mx-auto min-h-screen max-w-7xl px-4 py-8">
//       <Hero />

//       {/* সব পণ্য */}
//       <ProductGrid products={products} />
//     </main>
//   );
// };

// export default Home;



import Hero from "@/component/Hero";
import ProductGrid from "@/component/ProductGrid";
import type { Product } from "@/component/GroceryCard";

const API_URL =
  "https://api.api-store.workers.dev/api/bazardor/products";

function getProducts(data: unknown): Product[] {
  if (Array.isArray(data)) {
    return data.filter(
      (item): item is Product =>
        typeof item === "object" && item !== null
    );
  }

  if (typeof data !== "object" || data === null) {
    return [];
  }

  const obj = data as Record<string, unknown>;

  return getProducts(
    obj.products ?? obj.items ?? obj.results ?? obj.data
  );
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

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-8">
      <Hero />

      <section className="mt-8">
        <h1 className="mb-5 text-2xl font-extrabold">
          সব পণ্য
        </h1>

        <ProductGrid products={products} />
      </section>
    </main>
  );
}
