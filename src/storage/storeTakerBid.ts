import { isAddress } from "viem";
import { z } from "zod";
import { supabase, supabaseData } from "@/clients/supabaseClient.js";
import {
  HypercertExchangeClient,
  Maker,
  OrderValidatorCode,
} from "@hypercerts-org/marketplace-sdk";
import { ethers } from "ethers";
import { alchemyUrl } from "@/clients/evmClient.js";
import { chainId } from "@/utils/constants.js";
import { StorageMethod } from "@/indexer/LogParser.js";
import _ from "lodash";

export const TakerBid = z.object({
  buyer: z.string().refine(isAddress, { message: "Invalid buyer address" }),
  seller: z.string().refine(isAddress, { message: "Invalid seller address" }),
  strategy_id: z.bigint(),
  currency: z
    .string()
    .refine(isAddress, { message: "Invalid currency address" }),
  collection: z
    .string()
    .refine(isAddress, { message: "Invalid collection address" }),
  item_ids: z.array(z.bigint()),
  hypercert_id: z.string(),
  amounts: z.array(z.bigint()),
  transaction_hash: z.string(),
  creation_block_timestamp: z.bigint(),
  creation_block_number: z.bigint(),
});

export type TakerBid = z.infer<typeof TakerBid>;

/**
 * This function is responsible for storing taker bids in the database.
 *
 * It accepts an object containing an array of taker bids. Each taker bid is an object that must conform to the TakerBidSchema.
 * The function iterates over the array of taker bids, validates each taker bid using the TakerBidSchema, and prepares them for storage.
 * The taker bids are then stored in the database using the Supabase client.
 * If a taker bid with the same properties already exists in the database, the existing record is updated with the new taker bid data.
 * If any error occurs during the process, the error is logged and rethrown.
 *
 * @param {TakerBid[]} data - An object containing an array of taker bids to be stored. Each taker bid must conform to the TakerBidSchema.
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
export const storeTakerBid: StorageMethod<TakerBid> = async ({ data }) => {
  if (_.isArray(data)) return;
  // Update taker bids in database
  try {
    const _takerBidForStorage = {
      ...data,
      creation_block_timestamp: data.creation_block_timestamp.toString(),
      creation_block_number: data.creation_block_number.toString(),
      item_ids: data.item_ids.map((id) => id.toString()),
      amounts: data.amounts.map((amount) => amount.toString()),
    };

    await supabase
      .from("sales")
      .upsert(_takerBidForStorage, {
        ignoreDuplicates: true,
        onConflict: "transaction_hash",
      })
      .throwOnError();
  } catch (error) {
    console.error("[StoreTakerBid] Error storing taker bid", error);
    throw error;
  }

  // Check and update validity of related bids

  try {
    // Check validity of existing orders for tokenIds
    const { data: matchingOrders, error } = await supabaseData
      .from("marketplace_orders")
      .select("*")
      .overlaps(
        "itemIds",
        data.item_ids.map((id) => id.toString()),
      );

    if (error) {
      console.error(
        "[IndexTakerBid] Error while fetching existing orders for tokenIds",
        error,
      );
      return;
    }

    const hypercertsExchange = new HypercertExchangeClient(
      chainId,
      new ethers.JsonRpcProvider(alchemyUrl()),
    );

    const signatures: string[] = [];
    const orders: Maker[] = [];

    matchingOrders.forEach((order) => {
      const { signature, chainId: _, id: __, ...orderWithoutSignature } = order;
      signatures.push(signature);
      orders.push(orderWithoutSignature);
    });

    const validationResults = await hypercertsExchange.verifyMakerOrders(
      orders,
      signatures,
    );

    const ordersToUpdate = validationResults
      .map((result, index) => {
        const isValid = !result.some((code) =>
          FAULTY_ORDER_VALIDATOR_CODES.includes(code),
        );

        if (!isValid) {
          const order = matchingOrders[index];
          return {
            ...order,
            invalidated: true,
            validator_codes: result,
          };
        }
        return null;
      })
      .filter((x) => x !== null);

    console.log("[IndexTakerBid] Deleting invalid orders", ordersToUpdate);
    await supabaseData.from("marketplace_orders").upsert(ordersToUpdate);
  } catch (error) {
    console.error("[IndexTakerBid] Error processing taker bid", error);
    throw error;
  }
};

// TODO: Determine all error codes that result in the order being deleted
const FAULTY_ORDER_VALIDATOR_CODES = [
  OrderValidatorCode.TOO_LATE_TO_EXECUTE_ORDER,
];
