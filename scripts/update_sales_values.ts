import "dotenv/config";

import { HypercertExchangeAbi, getHypercertTokenId, parseClaimOrFractionId } from "@hypercerts-org/sdk";
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
  console.log("update_sales_values");
  // Get all sales rows
  // Create supabase client
  const supabase = createClient(
    process.env.SUPABASE_CACHING_DB_URL!,
    process.env.SUPABASE_CACHING_SERVICE_API_KEY!,
  );
  const salesResponse = await supabase.from("sales").select("*");
  const sales = salesResponse.data;

  if (!sales) {
    console.log("No sales found");
    return;
  }

  const results: TakerBid[] = [];
  for (const sale of sales) {
    const tokenId = BigInt(sale.item_ids[0]);
    const claimId = getHypercertTokenId(tokenId);
    const hypercert_id = sale.hypercert_id.replace("undefined", claimId);
    const chainId = parseClaimOrFractionId(hypercert_id).chainId;

    if (!chainId) {
      throw new Error(
        `No chainId found for sale ${sale.transaction_hash} ${hypercert_id}`,
      );
    }

    // Get transaction and parse logs using viem
    const client = EvmClientFactory.createClient(Number(chainId));
    const { addresses } = getDeployment(Number(chainId));
    const { currency } = sale;

    try {
      const transactionReceipt = await client.getTransactionReceipt({
        hash: sale.transaction_hash as `0x${string}`,
      });

      // parse logs to get claimID, contractAddress and cid
      const transactionLogsHypercertMinter = transactionReceipt.logs.filter(
        (log) =>
          log.address.toLowerCase() ===
          addresses?.HypercertMinterUUPS?.toLowerCase(),
      );

      let currencyAmount = 0n;
      if (currency === zeroAddress) {
        // Get value of the transaction
        const transaction = await client.getTransaction({
          hash: sale.transaction_hash as `0x${string}`,
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

      results.push(
        TakerBid.parse({
          amounts: sale.amounts.map((amount) => BigInt(amount)),
          seller: getAddress(sale.seller),
          buyer: getAddress(sale.buyer),
          currency: getAddress(sale.currency),
          collection: getAddress(sale.collection),
          item_ids: sale.item_ids.map((item_id) => BigInt(item_id)),
          strategy_id: BigInt(sale.strategy_id),
          hypercert_id: hypercert_id,
          transaction_hash: sale.transaction_hash,
          currency_amount: currencyAmount,
          fee_amounts: fee_amounts,
          fee_recipients: fee_recipients,
        }),
      );
    } catch (e) {
      console.log("Error parsing transaction", JSON.stringify(sale, null, 2));
      console.log(e);
      continue;
    }
  }

  // Combine parsed results with original sales data by matching transaction hashes
  const rowsToUpsert = results.map((result) => {
    const originalSale = sales.find(
      (sale) => sale.transaction_hash === result.transaction_hash,
    );
    if (!originalSale) {
      throw new Error(
        `Could not find original sale for transaction ${result.transaction_hash}`,
      );
    }
    return {
      ...originalSale,
      ...result,
      strategy_id: result.strategy_id.toString(),
      item_ids: result.item_ids.map((id) => id.toString()),
      amounts: result.amounts.map((amount) => amount.toString()),
      currency_amount: result.currency_amount.toString(),
      fee_amounts: result.fee_amounts.map((amount) => amount.toString()),
    };
  });


  // Upsert rows
  console.log("Upserting rows");
  console.log(JSON.stringify(rowsToUpsert, null, 2));
  const res = await supabase
    .from("sales")
    .upsert(rowsToUpsert)
    .select("*")
    .throwOnError();
  console.log("Rows after upsert");
  console.log(JSON.stringify(res.data, null, 2));
};

main();
