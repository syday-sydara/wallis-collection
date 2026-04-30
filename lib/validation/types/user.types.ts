import { z } from "zod";
import { userSchema } from "../schemas/user.schema";

export type UserInput = z.infer<typeof userSchema>;
