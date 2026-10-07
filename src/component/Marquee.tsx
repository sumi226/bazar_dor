
interface Product {
  id: string | number;
  nameBn?: string;
  name?: string;
  icon?: string;
  emoji?: string;
  price?: number;
  priceBn?: number;
  unit?: string;
  change?: number;
  changePercent?: number;
}

interface MarqueeProps {
  products: Product[];
}

const Marquee = ({ products }: MarqueeProps) => {
  if (!products.length) {
    return null;
  }

  const renderProduct = (
    product: Product,
    prefix: string
  ) => {
    const name =
      product.nameBn ??
      product.name ??
      "পণ্য";

    const price =
      product.price ??
      product.priceBn ??
      0;

    const unit =
      product.unit ??
      "কেজি";

    const change =
      product.changePercent ??
      product.change ??
      0;

    const isUp = change >= 0;

    return (
      <div
        key={`${prefix}-${product.id}`}
        className="flex shrink-0 items-center gap-2 border-r border-gray-200 px-6 py-3 text-sm"
      >
        {/* Product Icon */}
        <span className="text-lg">
          {product.icon ??
            product.emoji ??
            "🛒"}
        </span>

        {/* Product Name */}
        <span className="whitespace-nowrap font-medium text-gray-700">
          {name}
        </span>

        {/* Price */}
        <span className="whitespace-nowrap font-bold text-gray-900">
          ৳{price}/{unit}
        </span>

        {/* Change */}
        <span
          className={
            isUp
              ? "whitespace-nowrap font-semibold text-green-600"
              : "whitespace-nowrap font-semibold text-red-600"
          }
        >
          {isUp ? "▲" : "▼"}{" "}
          {Math.abs(change)}%
        </span>
      </div>
    );
  };

  return (
    <div className="overflow-hidden border-t bg-gray-50">
      <div className="marquee-track flex w-max">
        {/* First Set */}
        <div className="flex shrink-0">
          {products.map((product) =>
            renderProduct(product, "first")
          )}
        </div>

        {/* Second Set */}
        <div className="flex shrink-0">
          {products.map((product) =>
            renderProduct(product, "second")
          )}
        </div>
      </div>

      {/* Marquee Animation */}
      <style>{`
        .marquee-track {
          animation: marquee 35s linear infinite;
        }

        .marquee-track:hover {
          animation-play-state: paused;
        }

        @keyframes marquee {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
};

export default Marquee;
