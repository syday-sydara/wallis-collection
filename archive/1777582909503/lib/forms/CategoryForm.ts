// === AUTO-GENERATED START ===
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CategorySchema } from "@/lib/validation/schemas/Category.schema";
import type { CategoryInput } from "@/lib/validation/types/Category.types";

export function useCategoryForm(defaultValues?: Partial<CategoryInput>) {
  return useForm<CategoryInput>({
    resolver: zodResolver(CategorySchema),
    defaultValues: defaultValues as any,
  });
}
// === AUTO-GENERATED END ===
