import { getDeployment } from "@/utils/getDeployment.js";
import { IndexerConfig, NewAllowList, NewUnitTransfer } from "@/types/types.js";
import { getContractEventsForChain } from "@/storage/getContractEventsForChain.js";
import { getLogsForContractEvents } from "@/monitoring/hypercerts.js";
import * as console from "node:console";
import { parseTakerBidEvent, TakerBidEvent } from "@/parsing/parseTakerBid.js";
import { storeTakerBid } from "@/storage/storeTakerBid.js";
import { updateLastBlockIndexedContractEvents } from "@/storage/updateLastBlockIndexedContractEvents.js";
import { client } from "@/clients/evmClient.js";
import { parseEventLogs } from "viem";
import { HypercertMinterAbi } from "@hypercerts-org/sdk";

/*
 * This function indexes the logs of the TransferSingle event emitted by the HypercertMinter contract. Based on the last
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
              };
            }),
          )
        ).filter(
          (
            allowList,
          ): allowList is TakerBidEvent & {
            hypercertId: string;
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
      })),
  }).then(() =>
    updateLastBlockIndexedContractEvents({
      contract_events: results.flatMap((res) =>
        res?.contractEventUpdate ? [res.contractEventUpdate] : [],
      ),
    }),
  );
};
