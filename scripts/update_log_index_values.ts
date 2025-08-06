import "dotenv/config";

import {
  HypercertExchangeAbi,
  getHypercertTokenId,
  parseClaimOrFractionId,
} from "@hypercerts-org/sdk";
import { createClient } from "@supabase/supabase-js";
import { Chain, erc20Abi, getAddress, parseEventLogs, zeroAddress } from "viem";
import {
  arbitrum,
  arbitrumSepolia,
  base,
  baseSepolia,
  celo,
  filecoin,
  filecoinCalibration,
  optimism,
  sepolia,
} from "viem/chains";
import { EvmClientFactory } from "../src/clients/evmClient.js";
import { TakerBid } from "../src/storage/storeTakerBid.js";
import { getDeployment } from "../src/utils/getDeployment.js";

const getChain = (chainId: number) => {
  const chains: Record<number, Chain> = {
    10: optimism,
    314: filecoin,
    8453: base,
    42161: arbitrum,
    42220: celo,
    84532: baseSepolia,
    314159: filecoinCalibration,
    421614: arbitrumSepolia,
    11155111: sepolia,
  };

  const chain = chains[chainId];
  if (!chain) throw new Error(`Unsupported chain ID: ${chainId}`);
  return chain;
};

const main = async () => {
  console.log("update_log_index_values");
  // Get all sales rows
  // Create supabase client
  const supabase = createClient(
    process.env.SUPABASE_CACHING_DB_URL!,
    process.env.SUPABASE_CACHING_SERVICE_API_KEY!,
  );
  const salesResponse = await supabase
    .from("sales")
    .select("*")
    .filter("log_index", "is", null);
  const sales = salesResponse.data;

  if (!sales) {
    console.log("No sales found");
    return;
  }

  const results: {
    id: string;
    log_index: number;
    transaction_hash: string;
    chain_id: number;
  }[] = [];
  for (const sale of sales) {
    const chainId = parseClaimOrFractionId(sale.hypercert_id).chainId;

    if (!chainId) {
      throw new Error(
        `No chainId found for sale ${sale.transaction_hash} ${sale.hypercert_id}`,
      );
    }

    // Get transaction and parse logs using viem
    const client = EvmClientFactory.createClient(Number(chainId));
    const { addresses } = getDeployment(Number(chainId));

    try {
      const transactionReceipt = await client.getTransactionReceipt({
        hash: sale.transaction_hash as `0x${string}`,
      });
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

      if (parsedExchangeLog?.logIndex === undefined) {
        throw new Error(
          `No log index found for sale ${sale.transaction_hash} ${sale.hypercert_id}`,
        );
      }
      results.push({
        id: sale.id,
        log_index: parsedExchangeLog?.logIndex,
        transaction_hash: sale.transaction_hash,
        chain_id: chainId,
      });
    } catch (e) {
      console.log("Error parsing transaction", JSON.stringify(sale, null, 2));
      console.log(e);
      continue;
    }
  }

  console.log("Results");
  console.log(JSON.stringify(results, null, 2));

  for (const result of results) {
    const res = await supabase
      .from("sales")
      .update({
        log_index: result.log_index,
      })
      .eq("id", result.id);
    console.log("--------------------------------");
    console.log("Updating log index for sale", result.id);
    console.log(res);
  }
};

main();
