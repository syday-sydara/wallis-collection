// === AUTO-GENERATED START ===
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { OTPSchema } from "@/lib/validation/schemas/OTP.schema";
import type { OTPInput } from "@/lib/validation/types/OTP.types";

export function OTPAdminForm({ defaultValues, onSubmit }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OTPInput>({
    resolver: zodResolver(OTPSchema),
    defaultValues: defaultValues as any,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>id</label>
        <input type="text" {...register("id")} />
      </div>

      <div>
        <label>phone</label>
        <input type="text" {...register("phone")} />
      </div>

      <div>
        <label>code</label>
        <input type="text" {...register("code")} />
      </div>

      <div>
        <label>type</label>
        <select {...register("type")}>
          <option value="LOGIN">LOGIN</option>
          <option value="VERIFY_PHONE">VERIFY_PHONE</option>
          <option value="RESET_PASSWORD">RESET_PASSWORD</option>
          <option value="ORDER_CONFIRMATION">ORDER_CONFIRMATION</option>
        </select>
      </div>

      <div>
        <label>expiresAt</label>
        <input type="datetime-local" {...register("expiresAt")} />
      </div>

      <div>
        <label>used</label>
        <input type="checkbox" {...register("used")} />
      </div>

      <div>
        <label>attempts</label>
        <input type="number" {...register("attempts")} />
      </div>

      <div>
        <label>createdAt</label>
        <input type="datetime-local" {...register("createdAt")} />
      </div>

      <button type="submit">Save OTP</button>
    </form>
  );
}
// === AUTO-GENERATED END ===
