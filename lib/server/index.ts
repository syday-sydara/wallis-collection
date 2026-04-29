// server/index.ts

import express from "express";
import securityRouter from "./security";

const app = express();
app.use(express.json());

app.use("/api", securityRouter);

app.listen(3000, () => {
  console.log("Server listening on :3000");
});
