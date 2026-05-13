import { Router } from "express";
import { withHandler } from "@/lib/with-handler";
import { OrdersService } from "@/services/orders.service";

const router = Router();

router.get("/", withHandler(() => OrdersService.list()));

router.get("/:id", withHandler((req) => OrdersService.get(req.params.id)));

router.post("/", withHandler((req) => OrdersService.create(req.body)));

router.patch("/:id", withHandler((req) =>
  OrdersService.update(req.params.id, req.body)
));

router.delete("/:id", withHandler((req) =>
  OrdersService.remove(req.params.id)
));

export default router;
