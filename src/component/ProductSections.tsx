"use client";

import { useEffect, useMemo, useState } from "react";

import GroceryCard, { Product } from "@/component/GroceryCard";

const API_URL = "https://api.api-store.workers.dev/api/bazardor/products";

const ProductSections = () => {
  const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  /* =========================
     Fetch Products
  ========================== */

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error("Products API থেকে data আনা যায়নি");
        }

        const data = await response.json();

        const productList: Product[] = Array.isArray(data)
          ? data
          : (data.data ?? []);

        setProducts(productList);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "কিছু একটা সমস্যা হয়েছে",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  /* =========================
     Top 6 Price Risers
  ========================== */

  const risingProducts = useMemo(() => {
    return [...products]
      .filter((product) => product.changePercent > 0)
      .sort((a, b) => b.changePercent - a.changePercent)
      .slice(0, 6);
  }, [products]);

  /* =========================
     Top 6 Price Fallers
  ========================== */

  const fallingProducts = useMemo(() => {
    return [...products]
      .filter((product) => product.changePercent < 0)
      .sort((a, b) => a.changePercent - b.changePercent)
      .slice(0, 6);
  }, [products]);

  /* =========================
     Loading
  ========================== */

  if (loading) {
    return (
      <section className="bg-base-200 py-12">
        <div className="container mx-auto flex min-h-[300px] items-center justify-center px-4">
          <span className="loading loading-spinner loading-lg text-success" />
        </div>
      </section>
    );
  }

  /* =========================
     Error
  ========================== */

  if (error) {
    return (
      <section className="bg-base-200 py-12">
        <div className="container mx-auto px-4">
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        </div>
      </section>
    );
  }

  /* =========================
     Main UI
  ========================== */

  return (
    <main id="সব-পণ্য" className="bg-base-200">
      <div className="container mx-auto px-4 py-10 sm:px-6 lg:py-14">
        {/* =================================
            SECTION A — PRICE UP
        ================================== */}

        {risingProducts.length > 0 && (
          <section className="mb-14">
            <div className="mb-6">
              <h2 className="text-2xl font-extrabold text-success sm:text-3xl">
                ▲ আজ দাম বেড়েছে
              </h2>

              <p className="mt-2 text-sm text-base-content/60 sm:text-base">
                আজকের বাজারে যেসব পণ্যের দাম সবচেয়ে বেশি বেড়েছে।
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {risingProducts.map((product) => (
                <GroceryCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* =================================
            SECTION B — PRICE DOWN
        ================================== */}

        {fallingProducts.length > 0 && (
          <section className="mb-14">
            <div className="mb-6">
              <h2 className="text-2xl font-extrabold text-error sm:text-3xl">
                ▼ আজ দাম কমেছে
              </h2>

              <p className="mt-2 text-sm text-base-content/60 sm:text-base">
                আজকের বাজারে যেসব পণ্যের দাম সবচেয়ে বেশি কমেছে।
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {fallingProducts.map((product) => (
                <GroceryCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* =================================
            SECTION C — ALL PRODUCTS
        ================================== */}

        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-extrabold text-base-content sm:text-3xl">
              🛒 সব পণ্য
            </h2>

            <p className="mt-2 text-sm text-base-content/60 sm:text-base">
              চাল, ডাল, তেল, সবজি, মাছ, মাংস, ডিম ও মসলাসহ সব পণ্যের আজকের বাজার
              দর।
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <GroceryCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
};

export default ProductSections;
