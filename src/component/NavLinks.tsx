
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface Category {
  id: string | number;
  slug: string;
  icon?: string;
  nameBn: string;
}

interface NavLinksProps {
  categories?: Category[];
}

const NavLinks = ({ categories = [] }: NavLinksProps) => {
  const pathname = usePathname();
  
  return (
    <nav className="border-t border-gray-100">
      <div className="mx-auto flex max-w-4xl bg-emerald-100 m-10 shadow-xl rounded-2xl items-center justify-center gap-2 overflow-x-auto px-4 py-3">
        {categories.map((category) => {
          const isActive = pathname === `/category/${category.slug}`;

          return (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className={`flex items-center gap-1 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-red-50 text-red-700"
                  : "text-gray-700 hover:bg-green-300 hover:text-black"
              }`}
            >
              {category.icon && <span>{category.icon}</span>}
              <span>{category.nameBn}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default NavLinks;
