
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";

const BASE_URLS = [
    "https://openapi.programming-hero.com/api/bazardor",
  "https://api.api-store.workers.dev/api/bazardor",
  "https://api.abcz.workers.dev/api/bazardor",
] as const;

type Data = Record<string, unknown>;

type Market = {
  name: string;
  min: number | null;
  max: number | null;
  average: number | null;
  price: number | null;
  unit: string;
  date: string;
};

type ProductDetails = {
  id: string;
  title: string;
  description: string;
  emoji: string;
  image: string;
  unit: string;
  categories: string[];
  min: number | null;
  max: number | null;
  average: number | null;
  today: number | null;
  yesterday: number | null;
  change: number | null;
  markets: Market[];
  history: Data[];
  raw: Data;
};

type PageProps = {
  params: Promise<{ slug: string }>;
};

function object(value: unknown): Data | null {
  if (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return value as Data;
  }

  return null;
}

function text(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }

    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }

  return "";
}

function numberValue(...values: unknown[]): number | null {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string" && value.trim()) {
      const normalized = value
        .replace(/[০-৯]/g, (digit) =>
          String("০১২৩৪৫৬৭৮৯".indexOf(digit)),
        )
        .replace(/[٠-٩]/g, (digit) =>
          String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)),
        )
        .replace(/টাকা/g, "")
        .replace(/[৳,\s%]/g, "");

      if (!normalized) continue;

      const result = Number(normalized);

      if (Number.isFinite(result)) {
        return result;
      }
    }
  }

  return null;
}

function list(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;

  const data = object(value);
  if (!data) return [];

  const keys = [
    "products",
    "items",
    "results",
    "markets",
    "bazars",
    "prices",
    "history",
    "priceHistory",
    "price_history",
    "data",
  ];

  for (const key of keys) {
    const child = data[key];

    if (Array.isArray(child)) {
      return child;
    }

    const nested = object(child);

    if (nested) {
      const found = list(nested);
      if (found.length) return found;
    }
  }

  return [];
}

async function fetchApi(path: string): Promise<unknown | null> {
  for (const base of BASE_URLS) {
    try {
      const response = await fetch(`${base}${path}`, {
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
        headers: { Accept: "application/json" },
      });

      if (!response.ok) continue;

      const json: unknown = await response.json();
      const data = object(json);

      if (
        data?.success === false ||
        data?.error ||
        data?.status === "error"
      ) {
        continue;
      }

      return json;
    } catch {
      // Try the next API.
    }
  }

  return null;
}

function getProductCandidate(value: unknown): Data | null {
  const data = object(value);
  if (!data) return null;

  for (const key of ["product", "item", "result", "data"]) {
    const nested = object(data[key]);

    if (nested) {
      const candidate = getProductCandidate(nested);
      if (candidate) return candidate;
    }
  }

  if (
    text(
      data.slug,
      data._id,
      data.id,
      data.nameBn,
      data.name_bn,
      data.name,
    )
  ) {
    return data;
  }

  return null;
}

function categoriesFrom(raw: Data): string[] {
  const values =
    raw.categories ?? raw.categoryTags ?? raw.category_tags;

  if (Array.isArray(values)) {
    return values
      .map((item) => {
        if (typeof item === "string") return item;

        const data = object(item);

        return text(
          data?.nameBn,
          data?.name_bn,
          data?.name,
          data?.title,
        );
      })
      .filter(Boolean);
  }

  return [
    text(
      raw.categoryBn,
      raw.category_bn,
      raw.category,
      raw.categoryName,
      raw.category_name,
    ),
  ].filter(Boolean);
}

function marketFrom(value: unknown): Market | null {
  const raw = object(value);
  if (!raw) return null;

  const min = numberValue(
    raw.minPrice,
    raw.min_price,
    raw.minimumPrice,
  );

  const max = numberValue(
    raw.maxPrice,
    raw.max_price,
    raw.maximumPrice,
  );

  const average = numberValue(
    raw.averagePrice,
    raw.average_price,
    raw.avgPrice,
    raw.avg_price,
  );

  const price = numberValue(
    raw.today,
    raw.priceBn,
    raw.price,
    raw.currentPrice,
    raw.current_price,
    raw.marketPrice,
    raw.market_price,
  );

  if (
    min === null &&
    max === null &&
    average === null &&
    price === null
  ) {
    return null;
  }

  return {
    name:
      text(
        raw.marketName,
        raw.market_name,
        raw.bazarName,
        raw.bazar_name,
        raw.market,
        raw.bazar,
        raw.name,
        raw.location,
      ) || "বাজারের নাম নেই",
    min,
    max,
    average,
    price,
    unit: text(raw.unit, raw.unitBn, raw.unit_bn),
    date: text(
      raw.date,
      raw.updatedAt,
      raw.updated_at,
      raw.priceDate,
      raw.price_date,
      raw.createdAt,
    ),
  };
}

function normalize(raw: Data, slug: string): ProductDetails {
  const priceData =
    object(raw.priceSummary) ??
    object(raw.price_summary) ??
    object(raw.prices) ??
    raw;

  const marketsRaw =
    raw.markets ??
    raw.marketPrices ??
    raw.market_prices ??
    raw.bazars ??
    raw.marketData ??
    raw.market_data ??
    raw.pricesByMarket ??
    raw.prices_by_market;

  const markets = list(marketsRaw)
    .map(marketFrom)
    .filter((item): item is Market => item !== null);

  const today = numberValue(
    raw.today,
    raw.priceBn,
    raw.currentPrice,
    raw.current_price,
    raw.price,
    priceData.averagePrice,
    priceData.average_price,
    priceData.avgPrice,
    priceData.avg_price,
  );

  const yesterday = numberValue(
    raw.yesterday,
    raw.yesterdayPrice,
    raw.yesterday_price,
    raw.previousPrice,
    raw.previous_price,
    raw.oldPrice,
  );

  const marketPrices = markets
    .map((market) => market.price)
    .filter((value): value is number => value !== null);

  const min =
    numberValue(
      priceData.minPrice,
      priceData.min_price,
      priceData.minimumPrice,
      raw.minPrice,
      raw.min_price,
    ) ??
    (marketPrices.length ? Math.min(...marketPrices) : null);

  const max =
    numberValue(
      priceData.maxPrice,
      priceData.max_price,
      priceData.maximumPrice,
      raw.maxPrice,
      raw.max_price,
    ) ??
    (marketPrices.length ? Math.max(...marketPrices) : null);

  const average =
    numberValue(
      priceData.averagePrice,
      priceData.average_price,
      priceData.avgPrice,
      priceData.avg_price,
      raw.averagePrice,
      raw.average_price,
      raw.avgPrice,
      raw.avg_price,
    ) ??
    (marketPrices.length
      ? marketPrices.reduce((sum, price) => sum + price, 0) /
        marketPrices.length
      : null);

  const history = list(
    raw.priceHistory ??
      raw.price_history ??
      raw.history ??
      raw.trends,
  )
    .map(object)
    .filter((item): item is Data => item !== null);

  const change =
    numberValue(
      raw.pct,
      raw.changePercent,
      raw.change_percentage,
      raw.changePct,
      raw.priceChangePercent,
    ) ??
    (today !== null && yesterday !== null && yesterday > 0
      ? ((today - yesterday) / yesterday) * 100
      : null);

  return {
    id: text(raw._id, raw.id, raw.slug) || slug,
    title:
      text(
        raw.nameBn,
        raw.name_bn,
        raw.titleBn,
        raw.title_bn,
        raw.name,
        raw.title,
      ) || slug,
    description: text(
      raw.descriptionBn,
      raw.description_bn,
      raw.description,
      raw.marketSummary,
      raw.market_summary,
      raw.summary,
      raw.subtitle,
    ),
    emoji:
      text(
        raw.emoji,
        raw.icon,
        raw.categoryIcon,
        raw.category_icon,
      ) || "🛒",
    image: text(
      raw.image,
      raw.imageUrl,
      raw.image_url,
      raw.thumbnail,
      raw.photo,
    ),
    unit:
      text(raw.unitBn, raw.unit_bn, raw.unit, raw.measurementUnit) ||
      "প্রতি ইউনিট",
    categories: categoriesFrom(raw),
    min,
    max,
    average,
    today,
    yesterday,
    change,
    markets,
    history,
    raw,
  };
}

async function getProduct(
  slug: string,
): Promise<ProductDetails | null> {
  const encoded = encodeURIComponent(slug);

  const paths = [
    `/products/${encoded}`,
    `/product/${encoded}`,
    `/products?slug=${encoded}`,
    `/products`,
  ];

  for (const path of paths) {
    const response = await fetchApi(path);
    if (!response) continue;

    const direct = getProductCandidate(response);

    const candidates = list(response)
      .map(getProductCandidate)
      .filter((item): item is Data => item !== null);

    const matchesSlug = (item: Data) =>
      [item.slug, item._id, item.id].some(
        (value) => String(value ?? "") === slug,
      );

    const match =
      candidates.find(matchesSlug) ??
      (direct && matchesSlug(direct) ? direct : null);

    if (match) {
      return normalize(match, slug);
    }

    // Use a detail response only when it contains product-like fields.
    if (
      path === `/products/${encoded}` ||
      path === `/product/${encoded}`
    ) {
      const root = object(response);
      const candidate =
        object(root?.product) ??
        object(root?.data) ??
        root;

      if (
        candidate &&
        text(
          candidate.name,
          candidate.nameBn,
          candidate.name_bn,
          candidate.title,
        )
      ) {
        return normalize(candidate, slug);
      }
    }
  }

  return null;
}

function money(value: number | null): string {
  if (value === null) return "তথ্য নেই";

  return `৳${new Intl.NumberFormat("bn-BD", {
    maximumFractionDigits: 2,
  }).format(value)}`;
}

function prettyDate(value: string): string {
  if (!value) return "তারিখ পাওয়া যায়নি";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("bn-BD", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function displayValue(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return "—";
    }
  }

  return String(value);
}

function PriceCard({
  title,
  value,
  note,
}: {
  title: string;
  value: string;
  note?: string;
}) {
  return (
    <article className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
      <p className="text-sm text-base-content/60">{title}</p>
      <p className="mt-2 text-2xl font-extrabold text-primary">
        {value}
      </p>
      {note && (
        <p className="mt-1 text-xs text-base-content/60">{note}</p>
      )}
    </article>
  );
}

export default async function ProductDetailsPage({
  params,
}: PageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/signin");
  }

  const { slug } = await params;

  if (!slug?.trim()) {
    notFound();
  }

  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const excluded = new Set([
    "markets",
    "marketPrices",
    "market_prices",
    "bazars",
    "marketData",
    "market_data",
    "pricesByMarket",
    "prices_by_market",
    "priceHistory",
    "price_history",
    "history",
    "trends",
    "categories",
    "categoryTags",
  ]);

  const extraFields = Object.entries(product.raw).filter(
    ([key, value]) =>
      !excluded.has(key) &&
      (typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"),
  );

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-6 sm:py-10">
      <section className="rounded-3xl border border-base-300 bg-base-100 p-5 shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-base-200 text-6xl">
            {product.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.image}
                alt={product.title}
                className="h-full w-full object-contain p-2"
              />
            ) : (
              <span role="img" aria-label={product.title}>
                {product.emoji}
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-extrabold sm:text-3xl">
                {product.title}
              </h1>
              <span className="badge badge-outline">
                {product.unit}
              </span>
            </div>

            <p className="mt-3 leading-7 text-base-content/70">
              {product.description ||
                "এই পণ্যের বাজার-সারাংশ পাওয়া যায়নি।"}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {product.categories.length ? (
                product.categories.map((category, index) => (
                  <span
                    key={`${category}-${index}`}
                    className="badge badge-success badge-outline"
                  >
                    {category}
                  </span>
                ))
              ) : (
                <span className="text-sm text-base-content/50">
                  ক্যাটাগরি পাওয়া যায়নি
                </span>
              )}
            </div>

            {product.change !== null && (
              <p
                className={`mt-4 text-sm font-semibold ${
                  product.change > 0
                    ? "text-error"
                    : product.change < 0
                      ? "text-success"
                      : "text-base-content/60"
                }`}
              >
                {product.change > 0
                  ? "▲ দাম বেড়েছে "
                  : product.change < 0
                    ? "▼ দাম কমেছে "
                    : "● দাম অপরিবর্তিত "}
                {new Intl.NumberFormat("bn-BD", {
                  maximumFractionDigits: 2,
                }).format(Math.abs(product.change))}
                %
              </p>
            )}
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold sm:text-2xl">
          দামের সারসংক্ষেপ
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <PriceCard title="সর্বনিম্ন দাম" value={money(product.min)} />
          <PriceCard title="সর্বোচ্চ দাম" value={money(product.max)} />
          <PriceCard
            title="গড় দাম"
            value={money(product.average)}
            note="API-এর গড় অথবা পাওয়া বাজারের দাম থেকে হিসাব"
          />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <PriceCard
            title="আজকের দাম"
            value={money(product.today)}
            note={product.unit}
          />
          <PriceCard
            title="গতকালের দাম"
            value={money(product.yesterday)}
            note={product.unit}
          />
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm">
        <div className="border-b border-base-300 p-5">
          <h2 className="text-xl font-bold">
            বাজারভিত্তিক দামের তুলনা
          </h2>
          <p className="mt-1 text-sm text-base-content/60">
            বিভিন্ন বাজারে এই পণ্যের দামের তথ্য
          </p>
        </div>

        {product.markets.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>বাজার</th>
                  <th>সর্বনিম্ন</th>
                  <th>সর্বোচ্চ</th>
                  <th>গড় / বর্তমান দাম</th>
                  <th>একক</th>
                  <th>তারিখ</th>
                </tr>
              </thead>
              <tbody>
                {product.markets.map((market, index) => (
                  <tr key={`${market.name}-${index}`}>
                    <td className="font-semibold">{market.name}</td>
                    <td>{money(market.min)}</td>
                    <td>{money(market.max)}</td>
                    <td className="font-bold text-primary">
                      {money(market.average ?? market.price)}
                    </td>
                    <td>{market.unit || product.unit}</td>
                    <td>{prettyDate(market.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="p-5 text-sm text-base-content/60">
            API response-এ আলাদা বাজারের তালিকা পাওয়া যায়নি।
          </p>
        )}
      </section>

      <section className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm">
        <div className="border-b border-base-300 p-5">
          <h2 className="text-xl font-bold">দামের ইতিহাস</h2>
          <p className="mt-1 text-sm text-base-content/60">
            API-তে পাওয়া আগের দামের রেকর্ড
          </p>
        </div>

        {product.history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>তারিখ</th>
                  <th>দাম</th>
                  <th>বাজার</th>
                  <th>অন্যান্য তথ্য</th>
                </tr>
              </thead>
              <tbody>
                {product.history.map((row, index) => (
                  <tr key={index}>
                    <td>
                      {prettyDate(
                        text(
                          row.date,
                          row.updatedAt,
                          row.updated_at,
                          row.createdAt,
                        ),
                      )}
                    </td>
                    <td className="font-semibold">
                      {money(
                        numberValue(
                          row.price,
                          row.today,
                          row.priceBn,
                          row.averagePrice,
                          row.average_price,
                        ),
                      )}
                    </td>
                    <td>
                      {text(
                        row.marketName,
                        row.market_name,
                        row.bazarName,
                        row.bazar_name,
                        row.market,
                      ) || "—"}
                    </td>
                    <td>
                      {Object.entries(row)
                        .filter(
                          ([key]) =>
                            ![
                              "date",
                              "updatedAt",
                              "updated_at",
                              "createdAt",
                              "price",
                              "today",
                              "priceBn",
                              "averagePrice",
                              "average_price",
                              "marketName",
                              "market_name",
                              "bazarName",
                              "bazar_name",
                              "market",
                            ].includes(key),
                        )
                        .map(
                          ([key, value]) =>
                            `${key}: ${displayValue(value)}`,
                        )
                        .join(" · ") || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="p-5 text-sm text-base-content/60">
            আলাদা price history পাওয়া যায়নি।
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
        <h2 className="mb-4 text-xl font-bold">
          পণ্যের অন্যান্য তথ্য
        </h2>

        {extraFields.length > 0 ? (
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {extraFields.map(([key, value]) => (
              <div
                key={key}
                className="min-w-0 rounded-xl bg-base-200/60 p-3"
              >
                <dt className="break-words text-xs text-base-content/60">
                  {key}
                </dt>
                <dd className="mt-1 break-words font-medium">
                  {displayValue(value)}
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="text-sm text-base-content/60">
            অতিরিক্ত তথ্য পাওয়া যায়নি।
          </p>
        )}
      </section>
    </main>
  );
}
