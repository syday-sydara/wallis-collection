import { useQuery } from "@tanstack/react-query";
import { productsApi } from "@/lib/api/products";

export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: () => [...productKeys.lists(), "default"] as const,
  detail: (slug: string) => [...productKeys.all, "detail", slug] as const,
};

export function useProducts() {
  return useQuery({
    queryKey: productKeys.list(),
    queryFn: () => productsApi.list(),
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: productKeys.detail(slug),
    queryFn: () => productsApi.getBySlug(slug),
    enabled: !!slug,
  });
}
