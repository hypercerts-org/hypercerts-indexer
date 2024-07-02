import { storeTakerBid } from "@/storage/storeTakerBid.js";
import { parseClaimStoredEvent } from "@/parsing/claimStoredEvent.js";
import { parseTransferSingle } from "@/parsing/transferSingleEvent.js";
import { parseLeafClaimedEvent } from "@/parsing/leafClaimedEvent.js";
import { storeClaimStored } from "@/storage/storeClaimStored.js";
import { parseValueTransfer } from "@/parsing/valueTransferEvent.js";
import { storeValueTransfer } from "@/storage/storeValueTransfer.js";
import { storeTransferSingle } from "@/storage/storeTransferSingle.js";
import { updateAllowlistRecordClaimed } from "@/storage/updateAllowlistRecordClaimed.js";
import { parseTakerBidEvent } from "@/parsing/parseTakerBid.js";
import {
  ParserContext,
  ParserMethod,
  processLogs,
  StorageMethod,
} from "@/indexer/processLogs.js";
import { updateLastBlockIndexedContractEvents } from "@/storage/updateLastBlockIndexedContractEvents.js";
import { parseBatchValueTransfer } from "@/parsing/batchValueTransferEvent.js";
import { storeTransferBatch } from "@/storage/storeTransferBatch.js";
import { parseTransferBatch } from "@/parsing/transferBatchEvent.js";
import { storeBatchValueTransfer } from "@/storage/storeBatchValueTransfer.js";

const createHandler = <T>(
  parsingMethod: ParserMethod<T | T[]>,
  storageMethod: StorageMethod<T>,
) => {
  return {
    parsingMethod,
    storageMethod,
  };
};

export const eventHandlers = {
  ClaimStored: createHandler(parseClaimStoredEvent, storeClaimStored),
  ValueTransfer: createHandler(parseValueTransfer, storeValueTransfer),
  BatchValueTransfer: createHandler(
    parseBatchValueTransfer,
    storeBatchValueTransfer,
  ),
  TransferBatch: createHandler(parseTransferBatch, storeTransferBatch),
  TransferSingle: createHandler(parseTransferSingle, storeTransferSingle),
  LeafClaimed: createHandler(
    parseLeafClaimedEvent,
    updateAllowlistRecordClaimed,
  ),
  TakerBid: createHandler(parseTakerBidEvent, storeTakerBid),
} as const;

export interface EventParser {
  log: unknown;
  context: ParserContext;
}

export const processEvent = async ({ log, context }: EventParser) => {
  if (!(log.eventName in eventHandlers)) {
    console.error(`[runIndexing] No handler found for event ${log.eventName}`);
    return;
  }

  const handler = eventHandlers[log.eventName];

  const { parsingMethod, storageMethod } = handler;
  await processLogs({
    log,
    parsingMethod,
    storageMethod,
    context,
  }).then(() => {
    const { contracts_id, events_id, block } = context;
    updateLastBlockIndexedContractEvents({
      contracts_id,
      events_id,
      last_block_indexed: block.number!,
    });
  });
};
