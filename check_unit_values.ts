/**
 * This script checks the units of all fractions in the database against the units on-chain.
 */
import * as dotenv from "dotenv";
dotenv.config();

import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/database.types";
import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";

const main = async () => {
  const supabase = createClient<Database>(
    process.env.SUPABASE_CACHING_DB_URL!,
    process.env.SUPABASE_CACHING_SERVICE_API_KEY!,
  );

  const { count } = await supabase
    .from("fractions")
    .select("id", { count: "exact", head: true });

  console.log(count);

  if (!count) {
    throw new Error("No fractions found in the database");
  }

  const pageSize = 100;

  for (let i = 0; i < count; i += pageSize) {
    const { data: fractions } = await supabase
      .from("fractions")
      .select("token_id::text, units::text")
      .order("creation_block_timestamp", { ascending: true })
      .range(i, i + pageSize - 1);

    if (!fractions) {
      throw new Error("No fractions found in the database");
    }

    console.log(fractions);

    const client = createPublicClient({
      chain: sepolia,
      transport: http(
        `https://eth-sepolia.g.alchemy.com/v2/${process.env["ALCHEMY_API_KEY"]}`,
        {
          timeout: 20_000,
        },
      ),
      batch: {
        multicall: {
          wait: 32,
        },
      },
    });

    await Promise.all(
      fractions.map(async (fraction) => {
        const units = await client.readContract({
          address: "0xa16DFb32Eb140a6f3F2AC68f41dAd8c7e83C4941",
          abi: [
            {
              inputs: [
                {
                  internalType: "uint256",
                  name: "tokenID",
                  type: "uint256",
                },
              ],
              name: "unitsOf",
              outputs: [
                {
                  internalType: "uint256",
                  name: "units",
                  type: "uint256",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
          ],
          functionName: "unitsOf",
          args: [fraction.token_id],
        });
        if (units.toString() !== fraction.units.toString()) {
          throw new Error(
            `Units of token ${fraction.token_id} in the database do not match the units on-chain. DB: ${fraction.units}, Chain: ${units}. Range: ${i} - ${i + pageSize - 1}`,
          );
        }
      }),
    );
  }

  console.log("🚀 Units indexed correctly!");
  process.exit();
};

main();
