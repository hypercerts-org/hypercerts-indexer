import { storeTakerBid } from "@/storage/storeTakerBid.js";
import { parseClaimStoredEvent } from "@/parsing/parseClaimStoredEvent.js";
import { parseTransferSingleEvent } from "@/parsing/parseTransferSingleEvent.js";
import { parseLeafClaimedEvent } from "@/parsing/parseLeafClaimedEvent.js";
import { storeClaimStored } from "@/storage/storeClaimStored.js";
import { parseValueTransferEvent } from "@/parsing/parseValueTransferEvent.js";
import { storeValueTransfer } from "@/storage/storeValueTransfer.js";
import { storeTransferSingle } from "@/storage/storeTransferSingle.js";
import { updateAllowlistRecordClaimed } from "@/storage/updateAllowlistRecordClaimed.js";
import { parseTakerBidEvent } from "@/parsing/parseTakerBidEvent.js";
import LogParser, { ParserContext } from "@/indexer/LogParser.js";
import { parseBatchValueTransferEvent } from "@/parsing/parseBatchValueTransferEvent.js";
import { storeTransferBatch } from "@/storage/storeTransferBatch.js";
import { parseTransferBatchEvent } from "@/parsing/parseTransferBatchEvent.js";
import { storeBatchValueTransfer } from "@/storage/storeBatchValueTransfer.js";
import { parseAttestedEvent } from "@/parsing/parseAttestedEvent.js";
import { storeAttestations } from "@/storage/storeAttestations.js";
import { parseUriEvent } from "@/parsing/parseUriEvent.js";
import { storeMetadata } from "@/storage/storeMetadata.js";

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
      return new LogParser(parseValueTransferEvent, storeValueTransfer);
    case "BatchValueTransfer":
      return new LogParser(
        parseBatchValueTransferEvent,
        storeBatchValueTransfer,
      );
    case "TransferBatch":
      return new LogParser(parseTransferBatchEvent, storeTransferBatch);
    case "TransferSingle":
      return new LogParser(parseTransferSingleEvent, storeTransferSingle);
    case "LeafClaimed":
      return new LogParser(parseLeafClaimedEvent, updateAllowlistRecordClaimed);
    case "TakerBid":
      return new LogParser(parseTakerBidEvent, storeTakerBid);
    case "URI":
      return new LogParser(parseUriEvent, storeMetadata);
    default:
      throw new EventHandlerMissingError(eventName);
  }
};

export interface EventParser {
  event: unknown;
  context: ParserContext;
}

export const processEvent = async ({ event, context }: EventParser) => {
  try {
    const handler = getEventHandler(event.name);

    // TODO restore updating last block indexer per subscription
    // await handler.parse(data, context).then(() => {
    //   const { contracts_id, events_id, block } = context;
    //   updateLastBlockIndexedContractEvents({
    //     contracts_id,
    //     events_id,
    //     last_block_indexed: block.blockNumber,
    //   });
    // });

    return await handler.parse(event, context);
  } catch (e) {
    if (e instanceof EventHandlerMissingError) {
      console.warn(e.message);
    } else {
      console.error(`Error while processing event ${context.event_name}`);
      console.error(e);
    }
  }
};
