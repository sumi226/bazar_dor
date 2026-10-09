
import GroceryCard, {
  type Product,
} from "@/component/GroceryCard";

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({
  products,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="card border border-base-300 bg-base-100 shadow-sm">
        <div className="card-body items-center py-10 text-center">
          <span className="text-4xl">🛒</span>

          <h2 className="card-title">
            কোনো পণ্য পাওয়া যায়নি
          </h2>

          <p className="text-base-content/60">
            পরে আবার চেষ্টা করুন।
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product, index) => (
        <GroceryCard
          key={
            product._id ??
            product.id ??
            product.slug ??
            index
          }
          product={product}
        />
      ))}
    </div>
  );
}

