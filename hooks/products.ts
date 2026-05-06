import { useQuery, useQueryClient } from "@tanstack/react-query";
import { productsApi } from "@/lib/api/products";

export const productKeys = {
  all: ["products"] as const,
  lists: (params?: any) => [...productKeys.all, "list", params] as const,
  detail: (slug: string) => [...productKeys.all, "detail", slug] as const,
};

// LIST (with pagination + filters)
export function useProducts(params: { page: number; search?: string }) {
  return useQuery({
    queryKey: productKeys.lists(params),
    queryFn: () => productsApi.list(params),
    staleTime: 60_000,
    refetchInterval: 120_000,
    refetchOnWindowFocus: false,
  });
}

// DETAIL
export function useProduct(slug: string) {
  return useQuery({
    queryKey: productKeys.detail(slug),
    queryFn: () => productsApi.getBySlug(slug),
    enabled: !!slug,
  });
}

// PREFETCH
export function usePrefetchProduct() {
  const qc = useQueryClient();

  return (slug: string) =>
    qc.prefetchQuery({
      queryKey: productKeys.detail(slug),
      queryFn: () => productsApi.getBySlug(slug),
    });
}
