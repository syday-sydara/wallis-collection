import { useQuery } from "@tanstack/react-query";
import { adminApi } from "../api";

export const useAuditLogs = () =>
  useQuery({
    queryKey: ["audit"],
    queryFn: adminApi.audit.list,
  });

export const useAuditLog = (id: string) =>
  useQuery({
    queryKey: ["audit", id],
    queryFn: () => adminApi.audit.get(id),
    enabled: !!id,
  });
