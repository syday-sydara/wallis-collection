import { http } from "./http";

export const adminApi = {
  queues: () => http.get("/api/admin/queues"),
  dlq: () => http.get("/api/admin/dlq"),
  messages: () => http.get("/api/admin/messages"),
  audit: () => http.get("/api/admin/audit"),
};
