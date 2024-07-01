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
import { processLogs } from "@/indexer/processLogs.js";
import { updateLastBlockIndexedContractEvents } from "@/storage/updateLastBlockIndexedContractEvents.js";
import { parseBatchValueTransfer } from "@/parsing/batchValueTransferEvent.js";
import { storeTransferBatch } from "@/storage/storeTransferBatch.js";
import { parseTransferBatch } from "@/parsing/transferBatchEvent.js";
import { storeBatchValueTransfer } from "@/storage/storeBatchValueTransfer.js";
import { chainId } from "@/utils/constants.js";

export const eventHandlers = {
  ClaimStored: {
    parsingMethod: parseClaimStoredEvent,
    storageMethod: storeClaimStored,
  },
  ValueTransfer: {
    parsingMethod: parseValueTransfer,
    storageMethod: storeValueTransfer,
  },
  BatchValueTransfer: {
    parsingMethod: parseBatchValueTransfer,
    storageMethod: storeBatchValueTransfer,
  },
  TransferBatch: {
    parsingMethod: parseTransferBatch,
    storageMethod: storeTransferBatch,
  },
  TransferSingle: {
    parsingMethod: parseTransferSingle,
    storageMethod: storeTransferSingle,
  },
  LeafClaimed: {
    parsingMethod: parseLeafClaimedEvent,
    storageMethod: updateAllowlistRecordClaimed,
  },
  TakerBid: {
    parsingMethod: parseTakerBidEvent,
    storageMethod: storeTakerBid,
  },
} as const;

export interface ProcessEventParams {
  eventName: string;
  log: unknown;
  contracts_id: string;
  events_id: string;
  blockNumber: bigint;
}

export const processEvent = async ({
  eventName,
  log,
  contracts_id,
  events_id,
  blockNumber,
}: ProcessEventParams) => {
  const handler = eventHandlers[eventName];
  if (!handler) {
    console.error(`[runIndexing] No handler found for event ${eventName}`);
    return;
  }

  const { parsingMethod, storageMethod } = handler;
  await processLogs({
    log,
    parsingMethod,
    storageMethod,
    context: {
      chain_id: chainId,
      contracts_id,
      events_id,
      event_name: eventName,
    },
  }).then(() =>
    updateLastBlockIndexedContractEvents({
      contracts_id,
      events_id,
      last_block_indexed: BigInt(blockNumber),
    }),
  );
};
