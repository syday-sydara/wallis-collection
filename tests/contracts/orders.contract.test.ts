import request from "supertest";
import { app } from "@/server";
import { z } from "zod";
import { ApiSuccessSchema } from "@tests/schemas/api-envelope.schema";
import { OrdersSchema } from "@tests/schemas/orders.schema";

const OrdersListSchema = z.array(OrdersSchema);

describe("Orders Contract Tests", () => {
  it("GET /api/orders returns valid list", async () => {
    const res = await request(app).get("/api/orders").expect(200);

    const envelope = ApiSuccessSchema.parse(res.body);

    OrdersListSchema.parse(envelope.data);
  });
});
