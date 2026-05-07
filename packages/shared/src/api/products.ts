import { http } from "./http";
import {
  ProductSchema,
  ProductListSchema,
  Product,
} from "@/schemas";

// Strongly typed input for clarity
export interface ProductGetBySlugInput {
  slug: string;
}

export const productsApi = {
  list: (): Promise<Product[]> =>
    http.get<Product[]>("/api/products", ProductListSchema),

  getBySlug: ({ slug }: ProductGetBySlugInput): Promise<Product> =>
    http.get<Product>(`/api/products/${slug}`, ProductSchema),

  getById: (id: string): Promise<Product> =>
    http.get<Product>(`/api/products/id/${id}`, ProductSchema),

  search: (query: string): Promise<Product[]> =>
    http.get<Product[]>(
      `/api/products?search=${encodeURIComponent(query)}`,
      ProductListSchema
    ),
};
