
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface Category {
  id: string;
  slug: string;
  icon?: string;
  nameBn: string;
}

interface NavLinksProps {
  categories: Category[];
}

const NavLinks = ({ categories }: NavLinksProps) => {
  const pathname = usePathname();

  return (
    <nav className="border-t border-gray-100 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 overflow-x-auto px-4 py-3">
        
        {/* Categories */}
        {categories.map((category) => {
          const isActive =
            pathname === `/category/${category.slug}`;

          return (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className={`flex items-center gap-1 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-red-50 text-red-700"
                  : "text-gray-700 hover:bg-red-50 hover:text-red-700"
              }`}
            >
              {category.icon && (
                <span>{category.icon}</span>
              )}

              <span>{category.nameBn}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default NavLinks;
