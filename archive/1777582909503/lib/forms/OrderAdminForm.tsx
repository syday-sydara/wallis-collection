// === AUTO-GENERATED START ===
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { OrderSchema } from "@/lib/validation/schemas/Order.schema";
import type { OrderInput } from "@/lib/validation/types/Order.types";

export function OrderAdminForm({ defaultValues, onSubmit }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OrderInput>({
    resolver: zodResolver(OrderSchema),
    defaultValues: defaultValues as any,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>id</label>
        <input type="text" {...register("id")} />
      </div>

      <div>
        <label>email</label>
        <input type="text" {...register("email")} />
      </div>

      <div>
        <label>phone</label>
        <input type="text" {...register("phone")} />
      </div>

      <div>
        <label>fullName</label>
        <input type="text" {...register("fullName")} />
      </div>

      <div>
        <label>subtotal</label>
        <input type="number" {...register("subtotal")} />
      </div>

      <div>
        <label>shippingCost</label>
        <input type="number" {...register("shippingCost")} />
      </div>

      <div>
        <label>discountAmount</label>
        <input type="number" {...register("discountAmount")} />
      </div>

      <div>
        <label>total</label>
        <input type="number" {...register("total")} />
      </div>

      <div>
        <label>refundedAmount</label>
        <input type="number" {...register("refundedAmount")} />
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
        <label>paymentMethod</label>
        <select {...register("paymentMethod")}>
          <option value="CARD">CARD</option>
          <option value="TRANSFER">TRANSFER</option>
          <option value="CASH">CASH</option>
        </select>
      </div>

      <div>
        <label>orderStatus</label>
        <select {...register("orderStatus")}>
          <option value="CREATED">CREATED</option>
          <option value="PENDING_PAYMENT">PENDING_PAYMENT</option>
          <option value="REVIEW">REVIEW</option>
          <option value="CONFIRMED">CONFIRMED</option>
          <option value="PACKING">PACKING</option>
          <option value="SHIPPED">SHIPPED</option>
          <option value="DELIVERED">DELIVERED</option>
          <option value="RETURN_REQUESTED">RETURN_REQUESTED</option>
          <option value="RETURNED">RETURNED</option>
          <option value="FAILED_DELIVERY">FAILED_DELIVERY</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </div>

      <div>
        <label>paymentStatus</label>
        <select {...register("paymentStatus")}>
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
        <label>paymentProvider</label>
        <select {...register("paymentProvider")}>
          <option value="PAYSTACK">PAYSTACK</option>
          <option value="MONNIFY">MONNIFY</option>
          <option value="BANK_TRANSFER">BANK_TRANSFER</option>
        </select>
      </div>

      <div>
        <label>fraudScore</label>
        <input type="number" {...register("fraudScore")} />
      </div>

      <div>
        <label>riskScore</label>
        <input type="number" {...register("riskScore")} />
      </div>

      <div>
        <label>riskTriggeredRules</label>
        <input type="text" {...register("riskTriggeredRules")} />
      </div>

      <div>
        <label>riskLevel</label>
        <input type="text" {...register("riskLevel")} />
      </div>

      <div>
        <label>riskContextSnapshot</label>
        <input type="text" {...register("riskContextSnapshot")} />
      </div>

      <div>
        <label>shippingType</label>
        <select {...register("shippingType")}>
          <option value="STANDARD">STANDARD</option>
          <option value="EXPRESS">EXPRESS</option>
          <option value="PICKUP">PICKUP</option>
        </select>
      </div>

      <div>
        <label>shippingAddress</label>
        <input type="text" {...register("shippingAddress")} />
      </div>

      <div>
        <label>deliveryNotes</label>
        <input type="text" {...register("deliveryNotes")} />
      </div>

      <div>
        <label>deliveredAt</label>
        <input type="datetime-local" {...register("deliveredAt")} />
      </div>

      <div>
        <label>isPaid</label>
        <input type="checkbox" {...register("isPaid")} />
      </div>

      <div>
        <label>trackingNumber</label>
        <input type="text" {...register("trackingNumber")} />
      </div>

      <div>
        <label>carrier</label>
        <input type="text" {...register("carrier")} />
      </div>

      <div>
        <label>idempotencyKey</label>
        <input type="text" {...register("idempotencyKey")} />
      </div>

      <div>
        <label>cartSnapshot</label>
        <input type="text" {...register("cartSnapshot")} />
      </div>

      <div>
        <label>inventoryReserved</label>
        <input type="checkbox" {...register("inventoryReserved")} />
      </div>

      <div>
        <label>inventoryConfirmed</label>
        <input type="checkbox" {...register("inventoryConfirmed")} />
      </div>

      <div>
        <label>createdAt</label>
        <input type="datetime-local" {...register("createdAt")} />
      </div>

      <div>
        <label>updatedAt</label>
        <input type="datetime-local" {...register("updatedAt")} />
      </div>

      <div>
        <label>userId</label>
        <input type="text" {...register("userId")} />
      </div>

      <button type="submit">Save Order</button>
    </form>
  );
}
// === AUTO-GENERATED END ===
