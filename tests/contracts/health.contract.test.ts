import request from "supertest";
import { app } from "@/server";

describe("Health API", () => {
  it("GET /api/health returns ok", async () => {
    const res = await request(app)
      .get("/api/health")
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).toMatchObject({
      ok: true,
    });

    expect(typeof res.body.timestamp).toBe("string");
  });
});
