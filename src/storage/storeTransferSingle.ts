import { supabase } from "@/clients/supabaseClient.js";
import { getHypercertTokenId } from "@/utils/tokenIds.js";
import { chainId } from "@/utils/constants.js";
import { getAddress } from "viem";
import { ParsedTransferSingle } from "@/parsing/parseTransferSingleEvent.js";
import { StorageMethod } from "@/indexer/LogParser.js";
import { dbClient } from "@/clients/dbClient.js";

/* 
    This function stores the hypercert token and the ownership of the token in the database.

    @param token The token to store. 
    @returns The stored data.

    @example
    ```js
    
    const token = {

      token_id: 1n,
      
    const storedData = await ("0x1234...5678", 1n, metadata, cid);
    ```
 */

export const storeTransferSingle: StorageMethod<ParsedTransferSingle> = async ({
  data,
  context: { block },
}) => {
  const tokens = [];

  for (const transfer of data) {
    const { token_id, contract_address, to_owner_address, value } = transfer;
    const hypercertTokenId = getHypercertTokenId(token_id);

    // Skip hypercert claim token transfers
    if (hypercertTokenId.toString() === token_id.toString()) return;

    let claims_id;

    try {
      const { data: claim_id } = await supabase
        .rpc("get_or_create_claim", {
          p_chain_id: chainId,
          p_contract_address: getAddress(contract_address),
          p_token_id: hypercertTokenId.toString(),
          p_creation_block_number: block.blockNumber,
          p_creation_block_timestamp: block.timestamp,
          p_last_update_block_timestamp: block.blockNumber,
          p_last_update_block_number: block.timestamp,
        })
        .throwOnError();

      claims_id = claim_id;
    } catch (e: unknown) {
      console.error(`[StoreUnitTransfer] Could net create or get claim_id.`, e);
      return;
    }

    tokens.push({
      claims_id,
      fraction_id: `${chainId}-${getAddress(contract_address)}-${token_id}`,
      token_id: token_id.toString(),
      creation_block_timestamp: block.timestamp.toString(),
      creation_block_number: block.blockNumber,
      last_update_block_timestamp: block.timestamp.toString(),
      last_update_block_number: block.blockNumber,
      owner_address: getAddress(to_owner_address),
      value: value.toString(),
    });
  }

  if (tokens.length === 0) return;

  return [
    dbClient
      .insertInto("fractions")
      .values(tokens)
      .onConflict((oc) =>
        oc.columns(["claims_id", "token_id"]).doUpdateSet((eb) => ({
          fraction_id: eb.ref("excluded.fraction_id"),
          owner_address: eb.ref("excluded.owner_address"),
          value: eb.ref("excluded.value"),
          creation_block_number: eb.ref("excluded.creation_block_number"),
          creation_block_timestamp: eb.ref("excluded.creation_block_timestamp"),
          last_update_block_number: eb.ref("excluded.last_update_block_number"),
          last_update_block_timestamp: eb.ref(
            "excluded.last_update_block_timestamp",
          ),
        })),
      )
      .compile(),
  ];
};
