// types/products.ts
export type Product = {
  id: string;
  slug: string;
  name: string;
  priceNaira: number; // integer, in naira
  image: string;
  description: string;
  tags?: string[];
};

export const products: Product[] = [
  {
    id: "1",
    slug: "premium-body-wax",
    name: "Premium Body Wax",
    priceNaira: 129, // ₦129
    image: "/images/wax-1.jpg",
    description: "A smooth, long-lasting premium wax ideal for body grooming and skincare.",
    tags: ["wax", "skincare", "grooming"],
  },
  // ...
];

export function getAllProducts(): Product[] {
  return products;
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}