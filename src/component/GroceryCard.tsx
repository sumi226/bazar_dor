import Image from "next/image";
import Link from "next/link";

export interface Product {
  id?: string | number;
  _id?: string | number;
  slug?: string;
  nameBn?: string;
  name?: string;
  title?: string;

  image?: string;
  imageUrl?: string;
  categoryIcon?: string;
  icon?: string;
  emoji?: string;
  category?: string;
  unit?: string;

  today?: number | string | null;
  priceBn?: number | string | null;
  price?: number | string | null;

  pct?: number | string | null;
  changePercent?: number | string | null;
  changePct?: number | string | null;
  priceChangePercent?: number | string | null;

  dir?: string;
  direction?: string;
  trend?: string;

  yesterday?: number | string | null;
  yesterdayPrice?: number | string | null;
  previousPrice?: number | string | null;
  oldPrice?: number | string | null;

  [key: string]: unknown;
}

export function readNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value !== "string") return null;

  const normalized = value
    .replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/[%٪,\s]/g, "")
    .replace(/টাকা/g, "")
    .trim();

  if (!normalized) return null;

  const result = Number(normalized);
  return Number.isFinite(result) ? result : null;
}

export function getChange(product: Product): number {
  const item = product as Record<string, unknown>;

  for (const key of [
    "pct",
    "changePercent",
    "changePct",
    "priceChangePercent",
    "percentChange",
    "change_percentage",
  ]) {
    const value = readNumber(item[key]);
    if (value !== null) return value;
  }

  const current = readNumber(item.today ?? item.priceBn ?? item.price);

  const previous = readNumber(
    item.yesterday ??
      item.yesterdayPrice ??
      item.previousPrice ??
      item.oldPrice ??
      item.previous_price,
  );

  if (current !== null && previous !== null && previous > 0) {
    return ((current - previous) / previous) * 100;
  }

  return 0;
}

export function getDirection(product: Product): "up" | "down" | "flat" {
  const item = product as Record<string, unknown>;

  const raw = String(item.dir ?? item.direction ?? item.trend ?? "")
    .toLowerCase()
    .trim();

  if (/up|rise|increase|বেড়েছে|বাড়ছে|বৃদ্ধি/.test(raw)) {
    return "up";
  }

  if (/down|fall|decrease|কমেছে|কমছে|হ্রাস/.test(raw)) {
    return "down";
  }

  const change = getChange(product);

  if (change > 0) return "up";
  if (change < 0) return "down";

  return "flat";
}

function formatPrice(value: unknown): string {
  const price = readNumber(value);

  return price === null
    ? "দাম নেই"
    : `${new Intl.NumberFormat("bn-BD").format(price)} টাকা`;
}

function getImageUrl(product: Product): string | null {
  const candidates = [
    product.image,
    product.imageUrl,
    product["image_url"],
    product["thumbnail"],
    product["photo"],
  ];

  for (const value of candidates) {
    if (typeof value !== "string" || !value.trim()) continue;

    const url = value.trim();

    if (url.startsWith("/") || /^https?:\/\/\S+$/i.test(url)) {
      return url;
    }
  }

  return null;
}

function getEmoji(product: Product, name: string): string {
  const candidates = [product.icon, product.categoryIcon, product.emoji];

  for (const value of candidates) {
    if (
      typeof value === "string" &&
      value.trim() &&
      !/^https?:\/\//i.test(value.trim())
    ) {
      return value.trim();
    }
  }

  const category = String(product.category ?? "").toLowerCase();
  const text = `${name} ${category}`.toLowerCase();

  if (/rice|চাল|ধান/.test(text)) return "🍚";
  if (/fish|মাছ|ইলিশ/.test(text)) return "🐟";
  if (/meat|beef|মাংস|গরু|খাসি/.test(text)) return "🥩";
  if (/chicken|মুরগি/.test(text)) return "🍗";
  if (/egg|ডিম/.test(text)) return "🥚";
  if (/milk|দুধ/.test(text)) return "🥛";
  if (/oil|তেল/.test(text)) return "🫗";
  if (/onion|পেঁয়াজ|পেঁয়াজ/.test(text)) return "🧅";
  if (/potato|আলু/.test(text)) return "🥔";
  if (/tomato|টমেটো/.test(text)) return "🍅";
  if (/garlic|রসুন/.test(text)) return "🧄";
  if (/ginger|আদা/.test(text)) return "🫚";
  if (/chili|pepper|মরিচ/.test(text)) return "🌶️";
  if (/banana|কলা/.test(text)) return "🍌";
  if (/mango|আম\b/.test(text)) return "🥭";
  if (/apple|আপেল/.test(text)) return "🍎";
  if (/vegetable|সবজি|শাক/.test(text)) return "🥬";
  if (/fruit|ফল/.test(text)) return "🍎";
  if (/dal|lentil|ডাল/.test(text)) return "🫘";
  if (/flour|আটা|ময়দা|ময়দা/.test(text)) return "🌾";
  if (/sugar|চিনি/.test(text)) return "🍬";
  if (/salt|লবণ/.test(text)) return "🧂";
  if (/bread|পাউরুটি/.test(text)) return "🍞";

  return "🛒";
}

export default function GroceryCard({ product }: { product: Product }) {
  const name = product.nameBn ?? product.name ?? product.title ?? "নাম নেই";

  const price = product.today ?? product.priceBn ?? product.price;

  const change = getChange(product);
  const direction = getDirection(product);
  const imageUrl = getImageUrl(product);
  const emoji = getEmoji(product, String(name));

  const badgeClass =
    direction === "up"
      ? "badge badge-success"
      : direction === "down"
        ? "badge badge-error"
        : "badge badge-ghost";

  const identifier = product.slug ?? product.id ?? product._id;

  const href = identifier
    ? `/product/${encodeURIComponent(String(identifier))}`
    : "/";

  return (
    <article className="card h-full overflow-hidden border border-base-300 bg-base-100 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
      <figure className="relative flex h-44 items-center justify-center overflow-hidden bg-base-200">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={String(name)}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-contain p-3"
            onError={(event) => {
              event.currentTarget.style.display = "none";

              const fallback = event.currentTarget.parentElement?.querySelector(
                "[data-emoji-fallback]",
              ) as HTMLElement | null;

              if (fallback) {
                fallback.style.display = "flex";
              }
            }}
          />
        )}

        <span
          data-emoji-fallback
          role="img"
          aria-label={String(name)}
          className="h-full w-full items-center justify-center text-6xl"
          style={{ display: imageUrl ? "none" : "flex" }}
        >
          {emoji}
        </span>

        <span className={`absolute right-3 top-3 ${badgeClass}`}>
          {direction === "up"
            ? "▲ বেড়েছে"
            : direction === "down"
              ? "▼ কমেছে"
              : "● অপরিবর্তিত"}
        </span>
      </figure>

      <div className="card-body gap-3 p-5">
        <h2 className="card-title text-lg">{name}</h2>

        {product.category && (
          <p className="text-sm text-base-content/60">
            ক্যাটাগরি: {product.category}
          </p>
        )}

        <p className="text-sm text-base-content/60">
          একক: {product.unit ?? "প্রযোজ্য নয়"}
        </p>

        <div>
          <p className="text-xs text-base-content/60">আজকের দাম</p>
          <p className="text-2xl font-extrabold text-primary">
            {formatPrice(price)}
          </p>
        </div>

        {(product.pct != null ||
          product.changePercent != null ||
          product.changePct != null ||
          product.priceChangePercent != null ||
          change !== 0) && (
          <p
            className={`text-sm font-semibold ${
              direction === "up"
                ? "text-success"
                : direction === "down"
                  ? "text-error"
                  : "text-base-content/70"
            }`}
          >
            পরিবর্তন: {change > 0 ? "+" : ""}
            {new Intl.NumberFormat("bn-BD", {
              maximumFractionDigits: 2,
            }).format(change)}
            %
          </p>
        )}

        <div className="card-actions mt-auto pt-2">
          <Link href={href} className="btn btn-primary btn-sm w-full">
            বিস্তারিত দেখুন
          </Link>
        </div>
      </div>
    </article>
  );
}
