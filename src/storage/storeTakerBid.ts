import { isAddress } from "viem";
import { z } from "zod";
import { supabase } from "@/clients/supabaseClient.js";

const TakerBidSchema = z.object({
  buyer: z.string().refine(isAddress, { message: "Invalid buyer address" }),
  seller: z.string().refine(isAddress, { message: "Invalid seller address" }),
  strategy_id: z.bigint(),
  currency: z
    .string()
    .refine(isAddress, { message: "Invalid currency address" }),
  collection: z
    .string()
    .refine(isAddress, { message: "Invalid collection address" }),
  itemIds: z.array(z.bigint()),
  hypercert_id: z.string(),
  amounts: z.array(z.bigint()),
  transactionHash: z.string(),
  creation_block_timestamp: z.bigint(),
});

export type TakerBid = z.infer<typeof TakerBidSchema>;

/**
 * This function is responsible for storing taker bids in the database.
 *
 * It accepts an object containing an array of taker bids. Each taker bid is an object that must conform to the TakerBidSchema.
 * The function iterates over the array of taker bids, validates each taker bid using the TakerBidSchema, and prepares them for storage.
 * The taker bids are then stored in the database using the Supabase client.
 * If a taker bid with the same properties already exists in the database, the existing record is updated with the new taker bid data.
 * If any error occurs during the process, the error is logged and rethrown.
 *
 * @param {Object} { takerBids } - An object containing an array of taker bids to be stored. Each taker bid must conform to the TakerBidSchema.
 *
 * @throws {Error} If any error occurs during the process, the error is logged and rethrown.
 *
 * @example
 * ```typescript
 * const takerBids: TakerBid[] = [
 *   {
 *     buyer: '0x1234...5678',
 *     seller: '0x1234...5678',
 *     strategy_id: BigInt('12345678901234567890'),
 *     currency: '0x1234...5678',
 *     collection: '0x1234...5678',
 *     itemIds: [BigInt('12345678901234567890')],
 *     hypercert_id: '1234',
 *     amounts: [BigInt('1000')],
 *   },
 *   // More taker bids...
 * ];
 *
 * await storeTakerBid({ takerBids });
 **/
export const storeTakerBid = async ({
  takerBids,
}: {
  takerBids: TakerBid[];
}) => {
  try {
    const _takerBids = takerBids.map((takerBid) =>
      TakerBidSchema.parse(takerBid),
    );
    console.debug(`[StoreTakerBid] Storing ${_takerBids.length} taker bids`);
    const _takerBidForStorage = _takerBids.map((takerBid) => ({
      ...takerBid,
      creation_block_timestamp: takerBid.creation_block_timestamp.toString(),
      itemIds: takerBid.itemIds.map((id) => id.toString()),
      amounts: takerBid.amounts.map((amount) => amount.toString()),
    }));
    await supabase
      .from("sales")
      .upsert(_takerBidForStorage, { ignoreDuplicates: true })
      .throwOnError();
  } catch (error) {
    console.error("[StoreClaim] Error storing claims", error);
    throw error;
  }
};
