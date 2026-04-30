// === AUTO-GENERATED START ===
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SecurityEventSchema } from "@/lib/validation/schemas/SecurityEvent.schema";
import type { SecurityEventInput } from "@/lib/validation/types/SecurityEvent.types";

export function SecurityEventAdminForm({ defaultValues, onSubmit }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SecurityEventInput>({
    resolver: zodResolver(SecurityEventSchema),
    defaultValues: defaultValues as any,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>id</label>
        <input type="text" {...register("id")} />
      </div>

      <div>
        <label>version</label>
        <input type="number" {...register("version")} />
      </div>

      <div>
        <label>type</label>
        <input type="text" {...register("type")} />
      </div>

      <div>
        <label>message</label>
        <input type="text" {...register("message")} />
      </div>

      <div>
        <label>severity</label>
        <input type="text" {...register("severity")} />
      </div>

      <div>
        <label>category</label>
        <input type="text" {...register("category")} />
      </div>

      <div>
        <label>context</label>
        <input type="text" {...register("context")} />
      </div>

      <div>
        <label>source</label>
        <input type="text" {...register("source")} />
      </div>

      <div>
        <label>requestId</label>
        <input type="text" {...register("requestId")} />
      </div>

      <div>
        <label>actorType</label>
        <input type="text" {...register("actorType")} />
      </div>

      <div>
        <label>actorId</label>
        <input type="text" {...register("actorId")} />
      </div>

      <div>
        <label>orderId</label>
        <input type="text" {...register("orderId")} />
      </div>

      <div>
        <label>fulfillmentId</label>
        <input type="text" {...register("fulfillmentId")} />
      </div>

      <div>
        <label>riderId</label>
        <input type="text" {...register("riderId")} />
      </div>

      <div>
        <label>riskScore</label>
        <input type="number" {...register("riskScore")} />
      </div>

      <div>
        <label>tags</label>
        <input type="text" {...register("tags")} />
      </div>

      <div>
        <label>ip</label>
        <input type="text" {...register("ip")} />
      </div>

      <div>
        <label>userAgent</label>
        <input type="text" {...register("userAgent")} />
      </div>

      <div>
        <label>metadata</label>
        <input type="text" {...register("metadata")} />
      </div>

      <div>
        <label>timestamp</label>
        <input type="datetime-local" {...register("timestamp")} />
      </div>

      <div>
        <label>createdAt</label>
        <input type="datetime-local" {...register("createdAt")} />
      </div>

      <button type="submit">Save SecurityEvent</button>
    </form>
  );
}
// === AUTO-GENERATED END ===
