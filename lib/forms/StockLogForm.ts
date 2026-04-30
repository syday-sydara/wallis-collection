// === AUTO-GENERATED START ===
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { StockLogSchema } from "@/lib/validation/schemas/StockLog.schema";
import type { StockLogInput } from "@/lib/validation/types/StockLog.types";

export function useStockLogForm(defaultValues?: Partial<StockLogInput>) {
  return useForm<StockLogInput>({
    resolver: zodResolver(StockLogSchema),
    defaultValues: defaultValues as any,
  });
}
// === AUTO-GENERATED END ===
