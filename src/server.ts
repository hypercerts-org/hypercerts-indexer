import dotenv from "dotenv";
dotenv.config();

import "./instrument.js";

import express from "express";
import { delay, port } from "./utils/constants.js";
import { indexAttestations } from "@/indexer/indexAttestations.js";
import { indexClaimsStoredEvents } from "@/indexer/indexClaimsStored.js";
import { indexTransferSingleEvents } from "@/indexer/indexFractionTransfers.js";
import { indexValueTransfer } from "@/indexer/indexValueTransfer.js";
import { indexMetadata } from "@/indexer/indexMetadata.js";
import { indexAllowlistRecords } from "@/indexer/indexAllowlistRecords.js";
import { indexAllowListData } from "@/indexer/indexAllowlistData.js";
import { indexSupportedSchemas } from "@/indexer/indexSupportedSchemas.js";
import { runIndexing } from "@/indexer/runIndexing.js";
import { indexAllowlistSingleClaimMinted } from "@/indexer/indexAllowlistSingleClaimMinted.js";
import { indexTakerBid } from "@/indexer/indexTakerBid.js";

import * as Sentry from "@sentry/node";
import { indexTransferBatchEvents } from "@/indexer/indexBatchFractionTransfers.js";
import { indexBatchValueTransfer } from "@/indexer/indexBatchValueTransfer.js";

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
  const indexingMethods = [
    indexSupportedSchemas,
    indexClaimsStoredEvents,
    indexValueTransfer,
    indexBatchValueTransfer,
    indexTransferSingleEvents,
    indexTransferBatchEvents,
    indexMetadata,
    indexAllowListData,
    indexAllowlistRecords,
    indexAttestations,
    indexAllowlistSingleClaimMinted,
    indexTakerBid,
  ];

  await runIndexing(indexingMethods, delay);
});

export { app };
