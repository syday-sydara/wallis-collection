import { http } from "./http";
import { ProductSchema, Product } from "../schemas/product";

export const productsApi = {
  list: () =>
    http.get<Product[]>("/api/products", ProductSchema.array()),

  getBySlug: (slug: string) =>
    http.get<Product>(`/api/products/${slug}`, ProductSchema),
};
