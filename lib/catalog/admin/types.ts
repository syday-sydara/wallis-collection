export type AdminProductSummary = {
  id: string;
  name: string;
  slug: string;
  basePrice: number | null;
  stock: number;
  isArchived: boolean;
  updatedAt: Date;
};

export type AdminProductDetail = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  basePrice: number | null;
  stock: number;
  isArchived: boolean;
  updatedAt: Date;
  images: { id: string; url: string; alt: string | null; sortOrder: number }[];
  variants: {
    id: string;
    name: string;
    sku: string;
    price: number;
    stock: number;
  }[];
};