import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productsApi } from "@/sdk";

export const useProducts = () =>
  useQuery({
    queryKey: ["products"],
    queryFn: productsApi.list,
  });

export const useProductBySlug = (slug: string) =>
  useQuery({
    queryKey: ["products", "slug", slug],
    queryFn: () => productsApi.getBySlug({ slug }),
    enabled: !!slug,
  });

export const useProductById = (id: string) =>
  useQuery({
    queryKey: ["products", "id", id],
    queryFn: () => productsApi.getById(id),
    enabled: !!id,
  });

export const useProductSearch = (query: string) =>
  useQuery({
    queryKey: ["products", "search", query],
    queryFn: () => productsApi.search(query),
    enabled: query.length > 0,
  });
