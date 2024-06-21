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
} from "@hypercerts-org/marketplace-sdk";
import { ethers } from "ethers";

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
              return {
                ...parsed,
                hypercertId,
                transactionHash: event.transactionHash,
              };
            }),
          )
        ).filter(
          (
            allowList,
          ): allowList is TakerBidEvent & {
            hypercertId: string;
            transactionHash: `0x${string}`;
          } => allowList !== null && allowList !== undefined,
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
        itemIds: takerBid.args.itemIds,
        strategy_id: takerBid.args.strategyId,
        hypercert_id: takerBid.hypercertId,
        transactionHash: takerBid.transactionHash,
      })),
  })
    .then(async () => {
      // Check validity of existing orders for tokenIds
      const allItemIds = results
        .flatMap((res) =>
          res?.takerBids?.flatMap((takerBid) => takerBid.args.itemIds),
        )
        .filter((x): x is bigint => !!x);
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

      const ordersToDelete = validationResults
        .map((result, index) => {
          const isValid = result.every((code) => code === 0);
          if (!isValid) {
            return allOrders[index].id;
          }
        })
        .filter((x): x is string => !!x);

      console.log("[IndexTakerBid] Deleting invalid orders", ordersToDelete);
      await supabaseData
        .from("marketplace_orders")
        .delete()
        .in("id", ordersToDelete);
    })
    .then(() =>
      updateLastBlockIndexedContractEvents({
        contract_events: results.flatMap((res) =>
          res?.contractEventUpdate ? [res.contractEventUpdate] : [],
        ),
      }),
    );
};
