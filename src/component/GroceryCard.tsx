import Link from "next/link";

export interface Product {
  id: string | number;
  nameBn: string;
  icon?: string;
  priceBn: number;
  unit: string;
  changePercent: number;
}

interface GroceryCardProps {
  product: Product;
}

const toBanglaNumber = (value: number): string => {
  const numbers: Record<string, string> = {
    "0": "০",
    "1": "১",
    "2": "২",
    "3": "৩",
    "4": "৪",
    "5": "৫",
    "6": "৬",
    "7": "৭",
    "8": "৮",
    "9": "৯",
  };

  return String(value).replace(/\d/g, (digit) => numbers[digit]);
};

export default function GroceryCard({ product }: GroceryCardProps) {
  const { id, nameBn, icon, priceBn, unit, changePercent } = product;

  const isUp = changePercent > 0;
  const isDown = changePercent < 0;

  return (
    <Link href={`/products/${id}`} className="group block">
      <div className="card h-full border border-base-200 bg-base-100 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
        <div className="card-body p-5">
          {/* Icon + Details */}
          <div className="flex items-center justify-between">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-success/10 text-4xl transition-transform duration-300 group-hover:scale-110">
              {icon || "🛒"}
            </div>

            <span className="badge badge-ghost">বিস্তারিত →</span>
          </div>

          {/* Product Info */}
          <div className="mt-4">
            <h3 className="text-lg font-bold text-base-content">{nameBn}</h3>

            <p className="mt-1 text-sm text-base-content/60">{unit}</p>
          </div>

          {/* Price */}
          <div className="mt-5 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs text-base-content/60">আজকের দাম</p>

              <p className="mt-1 text-xl font-extrabold text-base-content">
                {toBanglaNumber(priceBn)} টাকা
              </p>
            </div>

            {/* Change */}
            <span
              className={`badge border-0 px-3 py-3 font-bold ${
                isUp
                  ? "bg-success/15 text-success"
                  : isDown
                    ? "bg-error/15 text-error"
                    : "bg-base-200 text-base-content/60"
              }`}
            >
              {isUp ? "▲" : isDown ? "▼" : "—"}{" "}
              {toBanglaNumber(Math.abs(changePercent))}%
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
