import { supabase } from "@/clients/supabaseClient.js";
import { getHypercertTokenId } from "@/utils/tokenIds.js";
import { chainId } from "@/utils/constants.js";
import { getAddress } from "viem";
import { ParsedTransferSingle } from "@/parsing/transferSingleEvent.js";
import { StorageMethod } from "@/indexer/LogParser.js";

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
  for (const transfer of data) {
    const { token_id, contract_address, to_owner_address, value } = transfer;
    const hypercertTokenId = getHypercertTokenId(token_id);

    if (hypercertTokenId.toString() === token_id.toString()) return;

    let claims_id;

    try {
      const { data: claim_id, error: claimError } = await supabase.rpc(
        "get_or_create_claim",
        {
          p_chain_id: chainId,
          p_contract_address: getAddress(contract_address),
          p_token_id: hypercertTokenId.toString(),
          p_creation_block_number: block.blockNumber,
          p_creation_block_timestamp: block.timestamp,
          p_last_update_block_timestamp: block.blockNumber,
          p_last_update_block_number: block.timestamp,
        },
      );
      if (claimError || !claim_id) {
        console.error(
          `[storeTransferSingle] Error while getting or creating claim for token ${token_id}.`,
          claimError,
          claim_id,
        );
        return;
      }

      claims_id = claim_id;
    } catch (e: unknown) {
      console.error(`[StoreUnitTransfer] Could net create or get claim_id.`, e);
      return;
    }

    const { data: token, error } = await supabase
      .from("fractions")
      .select("*, token_id::text")
      .eq("token_id", token_id.toString())
      .ilike("fraction_id", `${chainId}-${getAddress(contract_address)}-%`)
      .maybeSingle();

    if (error) {
      console.error(`[storeTransferSingle] Error while getting token.`, error);
      return;
    }

    const _token = {
      ...token,
      claims_id: token?.claims_id ?? claims_id,
      fraction_id: `${chainId}-${getAddress(contract_address)}-${token_id}`,
      token_id: token?.token_id.toString() ?? token_id.toString(),
      creation_block_timestamp: block.timestamp.toString(),
      creation_block_number: block.blockNumber,
      last_update_block_timestamp: block.timestamp.toString(),
      last_update_block_number: block.blockNumber,
      owner_address: getAddress(to_owner_address),
      value: value.toString(),
    };

    await supabase
      .from("fractions")
      .upsert(_token, {
        onConflict: "claims_id, token_id",
        ignoreDuplicates: false,
        defaultToNull: true,
      })
      .throwOnError();
  }
};
