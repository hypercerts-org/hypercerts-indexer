import {
  erc20Abi,
  getAddress,
  isAddress,
  parseEventLogs,
  zeroAddress,
} from "viem";
import { z } from "zod";
import { messages } from "@/utils/validation.js";
import { getEvmClient } from "@/clients/evmClient.js";
import { HypercertExchangeAbi, HypercertMinterAbi } from "@hypercerts-org/sdk";
import { getDeployment } from "@/utils/getDeployment.js";
import { TakerBid } from "@/storage/storeTakerBid.js";
import { ParserMethod } from "@/indexer/LogParser.js";
import { getHypercertTokenId } from "@/utils/tokenIds.js";

/**
 * Parses an event object to extract the details of a TakerBid event.
 *
 * This function attempts to parse the event object using the TakerBidEventSchema.
 * If the event object is valid, it extracts the details from the event's args property,
 * and returns them in a new object. If the event object is not valid, it logs an error and returns undefined.
 *
 * @param event - The event object to parse. Its structure should match the TakerBidEventSchema.
 *
 * @returns An object containing the details of the TakerBid event from the event's args property, or undefined if the event object is not valid.
 *
 * @example
 * ```typescript
 * const event = {
 *   address: "0x1234",
 *   args: {
 *     bidUser: "0x5678",
 *     bidRecipient: "0x5678",
 *     strategyId: 1234n,
 *     currency: "0x5678",
 *     collection: "0x5678",
 *     itemIds: [5678n],
 *     amounts: [1000n],
 *     feeRecipients: ["0x5678", "0x5678"],
 *     feeAmounts: [100n, 200n],
 *   },
 *   blockNumber: 1234n,
 * };
 * const parsedEvent = parseTakerBidEvent(event);
 * console.log(parsedEvent); // { bidUser: "0x5678", bidRecipient: "0x5678", strategyId: 1234n, ... }/
 **/

export const TakerBidEventSchema = z.object({
  address: z.string().refine(isAddress, { message: messages.INVALID_ADDRESS }),
  params: z.object({
    nonceInvalidationParameters: z.object({
      orderHash: z.string(),
      orderNonce: z.coerce.bigint(),
      isNonceInvalidated: z.boolean(),
    }),
    bidUser: z
      .string()
      .refine(isAddress, { message: messages.INVALID_ADDRESS }),
    bidRecipient: z
      .string()
      .refine(isAddress, { message: messages.INVALID_ADDRESS }),
    strategyId: z.bigint(),
    currency: z
      .string()
      .refine(isAddress, { message: messages.INVALID_ADDRESS }),
    collection: z
      .string()
      .refine(isAddress, { message: messages.INVALID_ADDRESS }),
    itemIds: z.array(z.coerce.bigint()),
    amounts: z.array(z.coerce.bigint()),
    feeRecipients: z.array(
      z.string().refine(isAddress, { message: messages.INVALID_ADDRESS }),
    ),
    feeAmounts: z.array(z.coerce.bigint()),
  }),
  blockNumber: z.coerce.bigint(),
  transactionHash: z.string(),
});

export const parseTakerBidEvent: ParserMethod<TakerBid> = async ({
  event,
  context: { chain_id },
}) => {
  const { addresses } = getDeployment(Number(chain_id));
  const client = getEvmClient(Number(chain_id));

  try {
    const bid = TakerBidEventSchema.parse(event);

    // parse logs to get claimID, contractAddress and cid
    const transactionReceipt = await client.getTransactionReceipt({
      hash: bid.transactionHash as `0x${string}`,
    });

    // parse logs to get claimID, contractAddress and cid
    const transactionLogsHypercertMinter = transactionReceipt.logs.filter(
      (log) =>
        log.address.toLowerCase() ===
        addresses?.HypercertMinterUUPS?.toLowerCase(),
    );

    const parsedLogs = parseEventLogs({
      abi: HypercertMinterAbi,
      logs: transactionLogsHypercertMinter,
    });

    // Look for both BatchValueTransfer and TransferSingle events
    const batchValueTransferLog = parsedLogs.find(
      // @ts-expect-error eventName is missing in the type
      (log) => log.eventName === "BatchValueTransfer",
    );
    const transferSingleLog = parsedLogs.find(
      // @ts-expect-error eventName is missing in the type
      (log) => log.eventName === "TransferSingle",
    );

    // Get the claim ID from either event type
    let claimId;
    // @ts-expect-error args is missing in the type
    if (batchValueTransferLog?.args?.claimIDs?.[0]) {
      // @ts-expect-error args is missing in the type
      claimId = batchValueTransferLog.args.claimIDs[0];
    // @ts-expect-error args is missing in the type
    } else if (transferSingleLog?.args?.id) {
      // In this case, the ID from the transferSingleLog is a fraction token ID
      // We need to get the claim ID from the fraction token ID
      // @ts-expect-error args is missing in the type
      claimId = getHypercertTokenId(transferSingleLog.args.id);
    }

    if (!claimId) {
      throw new Error(
        "Failed to find claim ID in BatchValueTransfer or TransferSingle events",
      );
    }

    const hypercertId = `${chain_id}-${getAddress(bid.params?.collection)}-${claimId}`;

    let currencyAmount = 0n;
    const currency = getAddress(bid.params.currency);
    if (currency === zeroAddress) {
      // Get value of the transaction
      const transaction = await client.getTransaction({
        hash: bid.transactionHash as `0x${string}`,
      });
      currencyAmount = transaction.value;
    } else {
      const currencyLogs = transactionReceipt.logs.filter(
        (log) => log.address.toLowerCase() === currency.toLowerCase(),
      );
      const parsedCurrencyLogs = parseEventLogs({
        abi: erc20Abi,
        logs: currencyLogs,
      });
      const transferLogs = parsedCurrencyLogs.filter(
        (log) => log.eventName === "Transfer",
      );
      currencyAmount = transferLogs.reduce(
        (acc, transferLog) => acc + (transferLog?.args?.value ?? 0n),
        0n,
      );
    }

    const exchangeLogs = transactionReceipt.logs.filter(
      (log) =>
        log.address.toLowerCase() ===
        addresses?.HypercertExchange?.toLowerCase(),
    );

    const parsedExchangeLog = parseEventLogs({
      abi: HypercertExchangeAbi,
      logs: exchangeLogs,
      // @ts-expect-error eventName is missing in the type
    }).find((log) => log.eventName === "TakerBid");

    // @ts-expect-error args is missing in the type
    const fee_amounts = parsedExchangeLog?.args?.feeAmounts;
    // @ts-expect-error args is missing in the type
    const fee_recipients = parsedExchangeLog?.args?.feeRecipients;

    return [
      TakerBid.parse({
        amounts: bid.params.amounts,
        seller: getAddress(bid.params.feeRecipients[0]),
        buyer: getAddress(bid.params.bidRecipient),
        currency: getAddress(bid.params.currency),
        collection: getAddress(bid.params.collection),
        item_ids: bid.params.itemIds,
        strategy_id: bid.params.strategyId,
        hypercert_id: hypercertId,
        transaction_hash: bid.transactionHash,
        currency_amount: currencyAmount,
        fee_amounts: fee_amounts,
        fee_recipients: fee_recipients,
      }),
    ];
  } catch (e) {
    console.error("[parseTakerBidEvent] Error parsing event", e);
    throw e;
  }
};
