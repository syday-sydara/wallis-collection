import { useQuery } from "@tanstack/react-query";
import { adminApi } from "../api";

export const useQueueStats = () =>
  useQuery({
    queryKey: ["queue-stats"],
    queryFn: adminApi.queue.stats,
    refetchInterval: 5000,
  });
