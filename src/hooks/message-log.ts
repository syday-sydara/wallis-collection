import { useQuery } from "@tanstack/react-query";
import { adminApi } from "../api";

export const useMessageLogs = () =>
  useQuery({
    queryKey: ["messages"],
    queryFn: adminApi.messages.list,
  });

export const useMessageLog = (id: string) =>
  useQuery({
    queryKey: ["messages", id],
    queryFn: () => adminApi.messages.get(id),
    enabled: !!id,
  });
