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
import LogParser, { ParserContext } from "@/indexer/LogParser.js";
import { updateLastBlockIndexedContractEvents } from "@/storage/updateLastBlockIndexedContractEvents.js";
import { parseBatchValueTransfer } from "@/parsing/batchValueTransferEvent.js";
import { storeTransferBatch } from "@/storage/storeTransferBatch.js";
import { parseTransferBatch } from "@/parsing/transferBatchEvent.js";
import { storeBatchValueTransfer } from "@/storage/storeBatchValueTransfer.js";
import { parseAttestedEvent } from "@/parsing/attestedEvent.js";
import { storeAttestations } from "@/storage/storeAttestations.js";

class EventHandlerMissingError extends Error {
  constructor(eventName: string) {
    super(`No handler found for event ${eventName}`);
  }
}

export const getEventHandler = (eventName: string) => {
  switch (eventName) {
    case "Attested":
      return new LogParser(parseAttestedEvent, storeAttestations);
    case "ClaimStored":
      return new LogParser(parseClaimStoredEvent, storeClaimStored);
    case "ValueTransfer":
      return new LogParser(parseValueTransfer, storeValueTransfer);
    case "BatchValueTransfer":
      return new LogParser(parseBatchValueTransfer, storeBatchValueTransfer);
    case "TransferBatch":
      return new LogParser(parseTransferBatch, storeTransferBatch);
    case "TransferSingle":
      return new LogParser(parseTransferSingle, storeTransferSingle);
    case "LeafClaimed":
      return new LogParser(parseLeafClaimedEvent, updateAllowlistRecordClaimed);
    case "TakerBid":
      return new LogParser(parseTakerBidEvent, storeTakerBid);
    default:
      throw new EventHandlerMissingError(eventName);
  }
};

export interface EventParser {
  data: unknown;
  context: ParserContext;
}

export const processEvent = async ({ data, context }: EventParser) => {
  try {
    const handler = getEventHandler(data.name);
    await handler.parse(data, context).then(() => {
      const { contracts_id, events_id, block } = context;
      updateLastBlockIndexedContractEvents({
        contracts_id,
        events_id,
        last_block_indexed: block.blockNumber,
      });
    });
  } catch (e) {
    if (e instanceof EventHandlerMissingError) {
      console.warn(e.message);
    } else {
      console.error(`Error while processing event ${context.event_name}`);
      throw e;
    }
  }
};
