import { isAddress, parseEventLogs } from "viem";
import { z } from "zod";
import { messages } from "@/utils/validation.js";
import { client } from "@/clients/evmClient.js";
import { HypercertMinterAbi } from "@hypercerts-org/sdk";
import { getBlockTimestamp } from "@/utils/getBlockTimestamp.js";
import { getDeployment } from "@/utils/getDeployment.js";
import { chainId } from "@/utils/constants.js";
import { TakerBid } from "@/storage/storeTakerBid.js";

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

const TakerBidEventSchema = z.object({
  address: z.string().refine(isAddress, { message: messages.INVALID_ADDRESS }),
  args: z.object({
    nonceInvalidationParameters: z.object({
      orderHash: z.string(),
      orderNonce: z.bigint(),
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
    itemIds: z.array(z.bigint()),
    amounts: z.array(z.bigint()),
    feeRecipients: z.array(
      z.string().refine(isAddress, { message: messages.INVALID_ADDRESS }),
    ),
    feeAmounts: z.array(z.bigint()),
  }),
  blockNumber: z.bigint(),
  transactionHash: z.string(),
});

export type TakerBidEvent = z.infer<typeof TakerBidEventSchema>;

export const parseTakerBidEvent = async (event: unknown) => {
  const { addresses } = getDeployment();

  try {
    const bid = TakerBidEventSchema.parse(event);

    // parse logs to get claimID, contractAddress and cid
    const transactionLogs = await client
      .getTransactionReceipt({
        hash: bid.transactionHash as `0x${string}`,
      })
      .then((res) => {
        return res.logs.filter(
          (log) =>
            log.address.toLowerCase() ===
            addresses?.HypercertMinterUUPS?.toLowerCase(),
        );
      });
    const batchValueTransferLog = parseEventLogs({
      abi: HypercertMinterAbi,
      logs: transactionLogs,
      // @ts-expect-error eventName is missing in the type
    }).find((log) => log.eventName === "BatchValueTransfer");

    // @ts-expect-error args is missing in the type
    const hypercertId = `${chainId}-${bid.args?.collection}-${batchValueTransferLog?.args?.claimIDs[0]}`;

    const timestamp = await getBlockTimestamp(bid.blockNumber);

    return TakerBid.parse({
      amounts: bid.args.amounts,
      seller: bid.args.bidRecipient,
      buyer: bid.args.bidUser,
      currency: bid.args.currency,
      collection: bid.args.collection,
      item_ids: bid.args.itemIds,
      strategy_id: bid.args.strategyId,
      hypercert_id: hypercertId,
      transaction_hash: bid.transactionHash,
      creation_block_number: bid.blockNumber,
      creation_block_timestamp: timestamp,
    });
  } catch (e) {
    console.error("[parseTakerBidEvent] Error parsing event", e);
    throw e;
  }
};
