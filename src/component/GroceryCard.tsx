
import Link from "next/link";

export interface Product {
  id?: string | number;
  _id?: string | number;
  slug?: string;
  nameBn?: string;
  name?: string;
  icon?: string;
  emoji?: string;
  unit?: string;
  today?: number | string | null;
  priceBn?: number | string | null;
  pct?: number | string | null;
  changePercent?: number | string | null;
  dir?: string;
  [key: string]: unknown;
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value !== "string") return null;

  const normalized = value
    .replace(/[০-৯]/g, (digit) =>
      String("০১২৩৪৫৬৭৮৯".indexOf(digit))
    )
    .replace(/,/g, "")
    .replace(/ টাকা/g, "")
    .trim();

  const result = Number(normalized);
  return normalized !== "" && Number.isFinite(result)
    ? result
    : null;
}

function formatPrice(value: unknown): string {
  const price = toNumber(value);

  return price === null
    ? "দাম নেই"
    : `${new Intl.NumberFormat("bn-BD").format(price)} টাকা`;
}

export default function GroceryCard({
  product,
}: {
  product: Product;
}) {
  const name =
    product.nameBn ??
    product.name ??
    "নাম নেই";

  const price = product.today ?? product.priceBn;
  const change = toNumber(
    product.pct ?? product.changePercent
  );

  const direction = String(product.dir ?? "").toLowerCase();

  const isUp =
    direction === "up" ||
    direction === "increase" ||
    direction === "increased" ||
    direction === "উপরে" ||
    direction === "বেড়েছে" ||
    (direction === "" && change !== null && change > 0);

  const isDown =
    direction === "down" ||
    direction === "decrease" ||
    direction === "decreased" ||
    direction === "নিচে" ||
    direction === "কমেছে" ||
    (direction === "" && change !== null && change < 0);

  const badgeClass = isUp
    ? "badge badge-success"
    : isDown
      ? "badge badge-error"
      : "badge badge-ghost";

  const identifier =
    product.slug ??
    product.id ??
    product._id;

  const href = identifier
    ? `/product/${encodeURIComponent(String(identifier))}`
    : "/";

  return (
    <article className="card h-full border border-base-300 bg-base-100 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="card-body gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-base-200 text-3xl">
            {product.icon ?? product.emoji ?? "🛒"}
          </div>

          <span className={badgeClass}>
            {isUp ? "▲ বেড়েছে" : isDown ? "▼ কমেছে" : "● অপরিবর্তিত"}
          </span>
        </div>

        <h2 className="card-title text-lg">
          {name}
        </h2>

        <p className="text-sm text-base-content/60">
          একক: {product.unit ?? "প্রযোজ্য নয়"}
        </p>

        <div>
          <p className="text-xs text-base-content/60">
            আজকের দাম
          </p>

          <p className="text-2xl font-extrabold text-primary">
            {formatPrice(price)}
          </p>
        </div>

        {change !== null && (
          <p className="text-sm text-base-content/70">
            পরিবর্তন: {change > 0 ? "+" : ""}
            {new Intl.NumberFormat("bn-BD").format(change)}%
          </p>
        )}

        <div className="card-actions mt-auto pt-2">
          <Link
            href={href}
            className="btn btn-primary btn-sm w-full"
          >
            বিস্তারিত দেখুন
          </Link>
        </div>
      </div>
    </article>
  );
}
