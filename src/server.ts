import dotenv from "dotenv";

dotenv.config();

import "./instrument.js";
import express from "express";
import * as Sentry from "@sentry/node";
import { port } from "@/utils/constants.js";
import Indexer from "@/indexer/indexer.js";

// @ts-expect-error BigInt is not supported by JSON
BigInt.prototype.toJSON = function () {
  const int = Number.parseInt(this.toString());
  return int ?? this.toString();
};

// @ts-expect-error BigInt is not supported by JSON
BigInt.prototype.fromJSON = function () {
  const int = Number.parseInt(this.toString());
  return int ?? this.toString();
};

const app = express();

app.get("/heartbeat", (req, res) => {
  res.status(200).send("OK");
});

// The error handler must be registered before any other error middleware and after all controllers
Sentry.setupExpressErrorHandler(app);

app.listen(port, async () => {
  console.log(`Indexer listening on port ${port}`);

  const indexer = new Indexer();

  await indexer.start();
});

export { app };
