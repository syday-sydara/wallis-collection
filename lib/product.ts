export type Product = {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  description: string;
  tags?: string[];
};

export const products: Product[] = [
  {
    id: '1',
    slug: 'minimal-sneaker',
    name: 'Minimal Sneaker',
    price: 129,
    image: '/images/sneaker-1.jpg',
    description: 'A clean, minimal sneaker for everyday wear.',
    tags: ['shoes', 'minimal'],
  },
  // more products...
];

export function getAllProducts() {
  return products;
}

export function getProductBySlug(slug: string) {
  return products.find((p) => p.slug === slug);
}