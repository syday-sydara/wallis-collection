export const useQueueStats = () =>
  useQuery({
    queryKey: ["queue-stats"],
    queryFn: adminApi.queue.stats,
    refetchInterval: 5000,
  });
