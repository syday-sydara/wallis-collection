// === AUTO-GENERATED START ===
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserSchema } from "@/lib/validation/schemas/User.schema";
import type { UserInput } from "@/lib/validation/types/User.types";

export function UserAdminForm({ defaultValues, onSubmit }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserInput>({
    resolver: zodResolver(UserSchema),
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
        <label>name</label>
        <input type="text" {...register("name")} />
      </div>

      <div>
        <label>role</label>
        <select {...register("role")}>
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
      </div>

      <div>
        <label>status</label>
        <select {...register("status")}>
          <option value="ACTIVE">ACTIVE</option>
          <option value="DISABLED">DISABLED</option>
          <option value="BANNED">BANNED</option>
        </select>
      </div>

      <div>
        <label>passwordHash</label>
        <input type="text" {...register("passwordHash")} />
      </div>

      <div>
        <label>phone</label>
        <input type="text" {...register("phone")} />
      </div>

      <div>
        <label>emailVerifiedAt</label>
        <input type="datetime-local" {...register("emailVerifiedAt")} />
      </div>

      <div>
        <label>risk_score</label>
        <input type="number" {...register("risk_score")} />
      </div>

      <div>
        <label>permissions</label>
        <input type="text" {...register("permissions")} />
      </div>

      <div>
        <label>deniedPermissions</label>
        <input type="text" {...register("deniedPermissions")} />
      </div>

      <div>
        <label>createdAt</label>
        <input type="datetime-local" {...register("createdAt")} />
      </div>

      <div>
        <label>updatedAt</label>
        <input type="datetime-local" {...register("updatedAt")} />
      </div>

      <button type="submit">Save User</button>
    </form>
  );
}
// === AUTO-GENERATED END ===
