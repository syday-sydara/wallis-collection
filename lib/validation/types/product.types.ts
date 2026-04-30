import { z } from "zod";
import { productSchema } from "../schemas/product.schema";

export type ProductInput = z.infer<typeof productSchema>;
