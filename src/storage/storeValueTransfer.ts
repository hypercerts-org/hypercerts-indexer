import { supabase } from "@/clients/supabaseClient.js";
import { getAddress } from "viem";
import { ParsedValueTransfer } from "@/parsing/parseValueTransferEvent.js";
import { StorageMethod } from "@/indexer/LogParser.js";
import { dbClient } from "@/clients/dbClient.js";

/**
 * Stores the value transfer data in the database.
 *
 * This function processes the parsed value transfer data and stores the relevant information
 * in the database. It handles the creation or retrieval of claims and updates the token information.
 *
 * @param {Object} params - The parameters for the function.
 * @param {ParsedValueTransfer[]} params.data - The parsed value transfer event data.
 * @param {Object} params.context - The context for the storage operation.
 * @param {Object} params.context.block - The block information.
 * @param {Function} params.context.readContract - The function to read contract data.
 *
 * @returns {Promise<void>} A promise that resolves when the data has been stored.
 *
 * @example
 * ```typescript
 * const data = [
 *   {
 *     from_token_id: 1n,
 *     to_token_id: 2n,
 *     contract_address: "0x1234...5678",
 *     claim_id: 1n,
 *   },
 *   // other transfers...
 * ];
 * const context = {
 *   block: {
 *     timestamp: 1234567890n,
 *     blockNumber: 12345,
 *   },
 *   readContract: async ({ address, contract, functionName, args }) => {
 *     // implementation...
 *   },
 * };
 * await storeValueTransfer({ data, context });
 */
export const storeValueTransfer: StorageMethod<ParsedValueTransfer> = async ({
  data,
  context: { block, chain_id, readContract, contracts_id, events_id },
}) => {
  const requests = [];

  for (const transfer of data) {
    const {
      from_token_id,
      to_token_id,
      contract_address,
      claim_id: hypercert_token_id,
    } = transfer;

    let claims_id;

    try {
      const { data: claim_id } = await supabase
        .rpc("get_or_create_claim", {
          p_chain_id: chain_id,
          p_contract_address: getAddress(contract_address),
          p_token_id: hypercert_token_id.toString(),
          p_last_update_block_timestamp: block.timestamp.toString(),
          p_last_update_block_number: block.blockNumber,
          p_creation_block_timestamp: block.timestamp.toString(),
          p_creation_block_number: block.blockNumber,
        })
        .throwOnError();

      claims_id = claim_id;
    } catch (e: unknown) {
      console.error(`[StoreUnitTransfer] Could net create or get claim_id.`, e);
      throw e;
    }

    let fromToken;
    let toToken;

    if (!readContract) throw new Error("readContract is not defined");

    if (from_token_id !== 0n) {
      fromToken = {
        claims_id,
        token_id: from_token_id.toString(),
        fraction_id: `${chain_id}-${getAddress(contract_address)}-${from_token_id}`,
        units: (await readContract({
          address: contract_address,
          contract: "HypercertMinter",
          functionName: "unitsOf",
          args: [from_token_id],
        })) as unknown as bigint,
        last_update_block_timestamp: block.timestamp.toString(),
        last_update_block_number: block.blockNumber,
        creation_block_number: block.blockNumber,
        creation_block_timestamp: block.timestamp.toString(),
      };
    }

    if (to_token_id !== 0n) {
      toToken = {
        claims_id,
        token_id: to_token_id.toString(),
        fraction_id: `${chain_id}-${getAddress(contract_address)}-${to_token_id}`,
        units: (await readContract({
          address: contract_address,
          contract: "HypercertMinter",
          functionName: "unitsOf",
          args: [to_token_id],
        })) as unknown as bigint,
        last_update_block_timestamp: block.timestamp.toString(),
        last_update_block_number: block.blockNumber,
        creation_block_number: block.blockNumber,
        creation_block_timestamp: block.timestamp.toString(),
      };

      const filteredTokens = [fromToken, toToken].filter(
        (token) => token !== undefined,
      );

      const parsedTokens = filteredTokens.map((token) => {
        return {
          ...token,
          claims_id,
          token_id: token.token_id.toString(),
          units: token.units.toString(),
          creation_block_number: block.blockNumber.toString(),
          creation_block_timestamp: block.timestamp.toString(),
          last_update_block_number: block.blockNumber.toString(),
          last_update_block_timestamp: block.timestamp.toString(),
        };
      });

      requests.push(
        dbClient
          .insertInto("fractions")
          .values(parsedTokens)
          .onConflict((oc) =>
            oc.columns(["claims_id", "token_id"]).doUpdateSet((eb) => ({
              units: eb.ref("excluded.units"),
              fraction_id: eb.ref("excluded.fraction_id"),
              last_update_block_number: eb.ref(
                "excluded.last_update_block_number",
              ),
              last_update_block_timestamp: eb.ref(
                "excluded.last_update_block_timestamp",
              ),
            })),
          )
          .compile(),
        dbClient
          .updateTable("contract_events")
          .set({ last_block_indexed: block.blockNumber })
          .where("contracts_id", "=", contracts_id)
          .where("events_id", "=", events_id)
          .compile(),
      );
    }
  }

  return requests;
};
