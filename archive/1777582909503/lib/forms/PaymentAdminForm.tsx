// === AUTO-GENERATED START ===
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PaymentSchema } from "@/lib/validation/schemas/Payment.schema";
import type { PaymentInput } from "@/lib/validation/types/Payment.types";

export function PaymentAdminForm({ defaultValues, onSubmit }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentInput>({
    resolver: zodResolver(PaymentSchema),
    defaultValues: defaultValues as any,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>id</label>
        <input type="text" {...register("id")} />
      </div>

      <div>
        <label>orderId</label>
        <input type="text" {...register("orderId")} />
      </div>

      <div>
        <label>provider</label>
        <select {...register("provider")}>
          <option value="PAYSTACK">PAYSTACK</option>
          <option value="MONNIFY">MONNIFY</option>
          <option value="BANK_TRANSFER">BANK_TRANSFER</option>
        </select>
      </div>

      <div>
        <label>reference</label>
        <input type="text" {...register("reference")} />
      </div>

      <div>
        <label>amount</label>
        <input type="number" {...register("amount")} />
      </div>

      <div>
        <label>fee</label>
        <input type="number" {...register("fee")} />
      </div>

      <div>
        <label>currency</label>
        <select {...register("currency")}>
          <option value="NGN">NGN</option>
          <option value="USD">USD</option>
          <option value="GBP">GBP</option>
        </select>
      </div>

      <div>
        <label>status</label>
        <select {...register("status")}>
          <option value="PENDING">PENDING</option>
          <option value="SUCCESS">SUCCESS</option>
          <option value="FAILED">FAILED</option>
          <option value="REFUNDED">REFUNDED</option>
          <option value="REVIEW">REVIEW</option>
          <option value="CHARGEBACK">CHARGEBACK</option>
          <option value="EXPIRED">EXPIRED</option>
          <option value="PARTIAL">PARTIAL</option>
        </select>
      </div>

      <div>
        <label>channel</label>
        <input type="text" {...register("channel")} />
      </div>

      <div>
        <label>raw</label>
        <input type="text" {...register("raw")} />
      </div>

      <div>
        <label>paidAt</label>
        <input type="datetime-local" {...register("paidAt")} />
      </div>

      <div>
        <label>settledAt</label>
        <input type="datetime-local" {...register("settledAt")} />
      </div>

      <div>
        <label>createdAt</label>
        <input type="datetime-local" {...register("createdAt")} />
      </div>

      <button type="submit">Save Payment</button>
    </form>
  );
}
// === AUTO-GENERATED END ===
