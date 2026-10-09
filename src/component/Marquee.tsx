
"use client";

import { useEffect, useState } from "react";
import Image from "next/image"

export interface Product {
  id?: string | number;
  nameBn?: string;
  name?: string;
  unit?: string;
  today?: string | number | null;
  dir?: string | number | null;
  pct?: string | number | null;
  categoryIcon?: string;
  image?: string;
  emoji?: string;
  icon?: string;
  [key: string]: unknown;
}

type Obj = Record<string, unknown>;

const API_URL =
  "https://api.api-store.workers.dev/api/bazardor/products";

function isObject(value: unknown): value is Obj {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function firstValue(...values: unknown[]): unknown {
  return values.find(
    (value) =>
      value !== undefined && value !== null && value !== "",
  );
}

function getPath(obj: Obj, path: string): unknown {
  let current: unknown = obj;

  for (const key of path.split(".")) {
    if (!isObject(current)) return undefined;
    current = current[key];
  }

  return current;
}

function read(obj: Obj, paths: string[]): unknown {
  for (const path of paths) {
    const value = getPath(obj, path);

    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  return undefined;
}

function asText(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) return value;
  if (typeof value === "number") return String(value);
  return undefined;
}

function getProducts(data: unknown): Product[] {
  let value: unknown = data;

  for (let i = 0; i < 8; i++) {
    if (Array.isArray(value)) {
      return value
        .filter(isObject)
        .map((item): Product => {
          const categoryValue = item.category;
          const category = isObject(categoryValue) ? categoryValue : {};

          const priceValue = read(item, [
            "today",
            "todayPrice",
            "today_price",
            "priceToday",
            "price_today",
            "currentPrice",
            "current_price",
            "latestPrice",
            "latest_price",
            "prices.today",
            "price.today",
            "pricing.today",
            "price.current",
            "price.amount",
            "current.price",
          ]);

          const today = firstValue(
            priceValue,
            typeof item.price === "number" ||
              typeof item.price === "string"
              ? item.price
              : undefined,
          );

          const pct = firstValue(
            read(item, [
              "pct",
              "percent",
              "percentage",
              "changePercent",
              "change_percent",
              "changePercentage",
              "change_percentage",
              "priceChangePercent",
              "price_change_percent",
              "change.pct",
              "change.percent",
              "change.percentage",
              "priceChange.percent",
              "price_change.percent",
            ]),
          );

          const dir = firstValue(
            read(item, [
              "dir",
              "direction",
              "trend",
              "priceDirection",
              "price_direction",
              "change.direction",
              "priceChange.direction",
            ]),
          );

          return {
            ...item,
            id: asText(firstValue(item.id, item._id)),
            nameBn:
              asText(
                firstValue(
                  item.nameBn,
                  item.name_bn,
                  item.nameBangla,
                  item.name_bangla,
                  item.banglaName,
                  item.bangla_name,
                  item.name,
                ),
              ) ?? "পণ্য",
            name: asText(item.name),
            unit: asText(
              firstValue(
                item.unit,
                item.unitBn,
                item.unit_bn,
                item.unitName,
                item.unit_name,
              ),
            ),
            today: today as string | number | null | undefined,
            pct: pct as string | number | null | undefined,
            dir: dir as string | number | null | undefined,
            categoryIcon: asText(
              firstValue(
                item.categoryIcon,
                item.category_icon,
                category.icon,
                category.emoji,
              ),
            ),
            image: asText(
              firstValue(item.image, item.imageUrl, item.image_url),
            ),
            emoji: asText(item.emoji),
            icon: asText(item.icon),
          };
        })
        .filter((product) => product.nameBn !== "পণ্য" || Boolean(product.name));
    }

    if (!isObject(value)) return [];

    const next = firstValue(
      value.products,
      value.items,
      value.results,
      value.data,
    );

    if (next === undefined || next === value) return [];
    value = next;
  }

  return [];
}

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;

  if (isObject(value)) {
    return toNumber(
      firstValue(value.amount, value.value, value.price, value.today),
    );
  }

  const cleaned = String(value).replace(/[৳,\s%]/g, "");
  const number = Number(cleaned);

  return Number.isFinite(number) ? number : null;
}

function directionOf(dir: unknown, pct: number | null) {
  const value = String(dir ?? "").trim().toLowerCase();

  if (
    ["up", "rise", "increase", "increased", "↑", "1", "বৃদ্ধি"].includes(value) ||
    value.includes("increase") ||
    value.includes("up")
  ) {
    return { arrow: "▲", className: "price-up" };
  }

  if (
    ["down", "fall", "decrease", "decreased", "↓", "-1", "কমেছে", "হ্রাস"].includes(value) ||
    value.includes("decrease") ||
    value.includes("down")
  ) {
    return { arrow: "▼", className: "price-down" };
  }

  if (pct !== null && pct > 0) {
    return { arrow: "▲", className: "price-up" };
  }

  if (pct !== null && pct < 0) {
    return { arrow: "▼", className: "price-down" };
  }

  return { arrow: "●", className: "price-neutral" };
}

function isImage(value: string): boolean {
  return /^https?:\/\//i.test(value) || value.startsWith("/");
}

function PriceItem({ product }: { product: Product }) {
  const price = toNumber(product.today);
  const pct = toNumber(product.pct);
  const direction = directionOf(product.dir, pct);

  const visual =
    product.categoryIcon ||
    product.image ||
    product.emoji ||
    product.icon;

  return (
    <div className="marquee-item">
      <span className="marquee-icon" aria-hidden="true">
        {visual && isImage(visual) ? (
          <Image
            src={visual}
            alt=""
            className="marquee-product-image"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
          />
        ) : (
         
          visual || "🛒"
        )}
      </span>

      <span className="marquee-name">
        {product.nameBn || product.name || "পণ্য"}
      </span>

      <span className="marquee-price">
        {price === null
          ? "দাম নেই"
          : `৳${price.toLocaleString("bn-BD", {
              maximumFractionDigits: 2,
            })}`}
        /{product.unit || "একক"}
      </span>

      <span className={`marquee-change ${direction.className}`}>
        {pct === null
          ? direction.arrow
          : `${direction.arrow} ${Math.abs(pct).toLocaleString("bn-BD")}%`}
      </span>
    </div>
  );
}

export default function Marquee({
  products: initialProducts = [],
}: {
  products?: Product[];
}) {
  const [products, setProducts] = useState<Product[]>(() =>
    getProducts(initialProducts),
  );
  const [loading, setLoading] = useState(initialProducts.length === 0);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    let controller: AbortController | undefined;

    async function load() {
      controller?.abort();
      const current = new AbortController();
      controller = current;

      try {
        const response = await fetch(API_URL, {
          cache: "no-store",
          signal: current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const json: unknown = await response.json();
        const list = getProducts(json);

        if (!list.length) {
          console.error("Unexpected products API response:", json);
          throw new Error("API response-এ product পাওয়া যায়নি");
        }

        if (active) {
          setProducts(list);
          setError("");
        }
      } catch (error: unknown) {
        if (
          !active ||
          (error instanceof Error && error.name === "AbortError")
        ) {
          return;
        }

        setError(
          error instanceof Error ? error.message : "তথ্য লোড হয়নি",
        );
        console.error("Marquee API error:", error);
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();

    const timer = window.setInterval(() => {
      void load();
    }, 60_000);

    return () => {
      active = false;
      controller?.abort();
      window.clearInterval(timer);
    };
  }, []);

  if (!products.length) {
    return (
      <div className="marquee-container px-4 py-3 text-sm text-gray-600">
        {loading
          ? "বাজারদর লোড হচ্ছে..."
          : error || "বাজারদর পাওয়া যায়নি"}
      </div>
    );
  }

  return (
    <section className="marquee-container" aria-label="সর্বশেষ বাজারদর">
      {error && (
        <p className="px-4 py-1 text-xs text-amber-700">
          আপডেট ব্যর্থ; আগের তথ্য দেখানো হচ্ছে।
        </p>
      )}

      <div className="marquee-track">
        {[0, 1].map((copy) => (
          <div
            className="marquee-group"
            key={copy}
            aria-hidden={copy === 1}
          >
            {products.map((product, index) => (
              <PriceItem
                key={`${copy}-${product.id ?? product.nameBn ?? index}`}
                product={product}
              />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
