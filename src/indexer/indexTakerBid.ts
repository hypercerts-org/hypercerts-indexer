import { getDeployment } from "@/utils/getDeployment.js";
import { IndexerConfig } from "@/types/types.js";
import { getContractEventsForChain } from "@/storage/getContractEventsForChain.js";
import { getLogsForContractEvents } from "@/monitoring/hypercerts.js";
import * as console from "node:console";
import { parseTakerBidEvent, TakerBidEvent } from "@/parsing/parseTakerBid.js";
import { storeTakerBid } from "@/storage/storeTakerBid.js";
import { updateLastBlockIndexedContractEvents } from "@/storage/updateLastBlockIndexedContractEvents.js";
import { alchemyUrl, client } from "@/clients/evmClient.js";
import { parseEventLogs } from "viem";
import { HypercertMinterAbi } from "@hypercerts-org/sdk";
import { supabaseData } from "@/clients/supabaseClient.js";
import {
  HypercertExchangeClient,
  Maker,
  OrderValidatorCode,
} from "@hypercerts-org/marketplace-sdk";
import { ethers } from "ethers";
import { getBlockTimestamp } from "@/utils/getBlockTimestamp.js";

/*
 * This function indexes the logs of the TakerBid event emitted by the HypercertsExchange contract. Based on the last
 * block indexed, it fetches the logs in batches, parses them, fetches the metadata, and stores the claim and fraction tokens in the
 * database.
 *
 * @param [batchSize] - The number of logs to fetch and parse in each batch.
 *
 * @example
 * ```js
 * await indexTransferSingleEvents({ batchSize: 1000n });
 * ```
 */

const defaultConfig = {
  batchSize: 10000n,
  eventName: "TakerBid",
};

export const indexTakerBid = async ({
  batchSize = defaultConfig.batchSize,
  eventName = defaultConfig.eventName,
}: IndexerConfig = defaultConfig) => {
  const { chainId } = getDeployment();
  const contractsWithEvents = await getContractEventsForChain({
    eventName,
  });

  console.log(
    `[IndexTakerBid] Found ${contractsWithEvents?.length} contracts with events for ${eventName} event on chain ${chainId}`,
  );

  if (!contractsWithEvents || contractsWithEvents.length === 0) {
    console.debug(
      `[IndexTakerBid] No contract events found for ${eventName} event on chain ${chainId}`,
    );
    return;
  }

  const { addresses } = getDeployment();

  const results = await Promise.all(
    contractsWithEvents
      .filter((x) => x.contract_slug === "marketplace-contract")
      .map(async (contractEvent) => {
        const { last_block_indexed } = contractEvent;

        // Get logs in batches
        const logsFound = await getLogsForContractEvents({
          fromBlock: last_block_indexed ? BigInt(last_block_indexed) : 0n,
          batchSize,
          contractEvent,
        });

        if (!logsFound) {
          console.debug(
            " [IndexTakerBid] No logs found for contract event",
            contractEvent,
          );
          return;
        }

        const { logs, toBlock } = logsFound;

        // parse logs to get claimID, contractAddress and cid
        const takerBids = (
          await Promise.all(
            logs.map(async (event) => {
              const transactionLogs = await client
                .getTransactionReceipt({
                  hash: event.transactionHash,
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
              const parsed = await parseTakerBidEvent(event);
              // @ts-expect-error args is missing in the type
              const hypercertId = `${chainId}-${parsed?.args?.collection}-${batchValueTransferLog?.args?.claimIDs[0]}`;
              const timestamp = await getBlockTimestamp(event.blockNumber);
              return {
                ...parsed,
                hypercertId,
                transactionHash: event.transactionHash,
                creation_block_number: event.blockNumber,
                creation_block_timestamp: timestamp,
              };
            }),
          )
        ).filter(
          (
            takerBid,
          ): takerBid is TakerBidEvent & {
            hypercertId: string;
            transactionHash: `0x${string}`;
            creation_block_timestamp: bigint;
            creation_block_number: bigint;
          } => takerBid !== null && takerBid !== undefined,
        );

        return {
          takerBids,
          contractEventUpdate: {
            ...contractEvent,
            last_block_indexed: toBlock,
          },
        };
      }),
  );

  return await storeTakerBid({
    takerBids: results
      .flatMap((res) => (res?.takerBids ? res.takerBids : []))
      .map((takerBid) => ({
        amounts: takerBid.args.amounts,
        seller: takerBid.args.bidRecipient,
        buyer: takerBid.args.bidUser,
        currency: takerBid.args.currency,
        collection: takerBid.args.collection,
        item_ids: takerBid.args.itemIds,
        strategy_id: takerBid.args.strategyId,
        hypercert_id: takerBid.hypercertId,
        transaction_hash: takerBid.transactionHash,
        creation_block_timestamp: takerBid.creation_block_timestamp,
      })),
  })
    .then(async () => {
      // Check validity of existing orders for tokenIds
      const allItemIds = results
        .flatMap((res) =>
          res?.takerBids?.flatMap((takerBid) => takerBid.args.itemIds),
        )
        .filter((x) => x !== undefined);
      const { data: allOrders, error } = await supabaseData
        .from("marketplace_orders")
        .select("*")
        .overlaps("itemIds", allItemIds);

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

      allOrders.forEach((order) => {
        const {
          signature,
          chainId: _,
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
            const order = allOrders[index];
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
    })
    .then(() =>
      updateLastBlockIndexedContractEvents({
        contract_events: results.flatMap((res) =>
          res?.contractEventUpdate ? [res.contractEventUpdate] : [],
        ),
      }),
    );
};

// TODO: Determine all error codes that result in the order being deleted
const FAULTY_ORDER_VALIDATOR_CODES = [
  OrderValidatorCode.TOO_LATE_TO_EXECUTE_ORDER,
];
