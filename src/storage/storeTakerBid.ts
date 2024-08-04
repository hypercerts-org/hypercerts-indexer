import { isAddress } from "viem";
import { z } from "zod";
import { supabaseData } from "@/clients/supabaseClient.js";
import {
  HypercertExchangeClient,
  Maker,
  OrderValidatorCode,
} from "@hypercerts-org/marketplace-sdk";
import { ethers } from "ethers";
import { getRpcUrl } from "@/clients/evmClient.js";
import { StorageMethod } from "@/indexer/LogParser.js";
import { dbClient } from "@/clients/dbClient.js";

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
export const storeTakerBid: StorageMethod<TakerBid> = async ({
  data,
  context: { block, chain_id, contracts_id, events_id },
}) => {
  const takerBids = [];

  for (const takerBid of data) {
    const _takerBid = {
      ...takerBid,
      creation_block_timestamp: block.timestamp,
      creation_block_number: block.blockNumber.toString(),
      item_ids: takerBid.item_ids.map((id) => id.toString()),
      amounts: takerBid.amounts.map((amount) => amount.toString()),
      strategy_id: takerBid.strategy_id.toString(),
    };

    takerBids.push(_takerBid);
  }

  // Check and update validity of related bids
  // TODO refactor to separate step after block updates
  for (const takerBid of data) {
    // Check validity of existing orders for tokenIds
    const { data: matchingOrders } = await supabaseData
      .from("marketplace_orders")
      .select("*")
      .overlaps(
        "itemIds",
        takerBid.item_ids.map((id) => id.toString()),
      )
      .throwOnError();

    if (!matchingOrders)
      throw new Error(
        "[StoreTakerBid] Could not read matching orders from database",
      );

    const rpcUrl = getRpcUrl(Number(chain_id));
    const hypercertsExchange = new HypercertExchangeClient(
      Number(chain_id),
      // @ts-expect-error - No types available
      new ethers.JsonRpcProvider(rpcUrl),
    );

    const signatures: string[] = [];
    const orders: Maker[] = [];

    matchingOrders.forEach((order) => {
      const {
        signature,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        chainId: _,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        id: __,
        ...orderWithoutSignature
      } = order;
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
  }

  return [
    dbClient.insertInto("sales").values(takerBids).compile(),
    dbClient
      .updateTable("contract_events")
      .set({ last_block_indexed: block.blockNumber })
      .where("contracts_id", "=", contracts_id)
      .where("events_id", "=", events_id)
      .compile(),
  ];
};

// TODO: Determine all error codes that result in the order being deleted
const FAULTY_ORDER_VALIDATOR_CODES = [
  OrderValidatorCode.TOO_LATE_TO_EXECUTE_ORDER,
];
