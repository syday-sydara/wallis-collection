// === AUTO-GENERATED START ===
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AddressSchema } from "@/lib/validation/schemas/Address.schema";
import type { AddressInput } from "@/lib/validation/types/Address.types";

export function AddressAdminForm({ defaultValues, onSubmit }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressInput>({
    resolver: zodResolver(AddressSchema),
    defaultValues: defaultValues as any,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>id</label>
        <input type="text" {...register("id")} />
      </div>

      <div>
        <label>userId</label>
        <input type="text" {...register("userId")} />
      </div>

      <div>
        <label>fullName</label>
        <input type="text" {...register("fullName")} />
      </div>

      <div>
        <label>phone</label>
        <input type="text" {...register("phone")} />
      </div>

      <div>
        <label>line1</label>
        <input type="text" {...register("line1")} />
      </div>

      <div>
        <label>line2</label>
        <input type="text" {...register("line2")} />
      </div>

      <div>
        <label>city</label>
        <input type="text" {...register("city")} />
      </div>

      <div>
        <label>state</label>
        <input type="text" {...register("state")} />
      </div>

      <div>
        <label>lga</label>
        <input type="text" {...register("lga")} />
      </div>

      <div>
        <label>postalCode</label>
        <input type="text" {...register("postalCode")} />
      </div>

      <div>
        <label>country</label>
        <input type="text" {...register("country")} />
      </div>

      <div>
        <label>createdAt</label>
        <input type="datetime-local" {...register("createdAt")} />
      </div>

      <button type="submit">Save Address</button>
    </form>
  );
}
// === AUTO-GENERATED END ===
