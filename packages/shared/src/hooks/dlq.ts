

export const useDLQ = () =>
  useQuery({
    queryKey: ["dlq"],
    queryFn: adminApi.dlq.list,
  });

export const useDLQEntry = (id: string) =>
  useQuery({
    queryKey: ["dlq", id],
    queryFn: () => adminApi.dlq.get(id),
    enabled: !!id,
  });

export const useRetryDLQ = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminApi.dlq.retry,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dlq"] }),
  });
};
