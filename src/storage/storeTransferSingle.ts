import { supabase } from "@/clients/supabaseClient.js";
import { getHypercertTokenId } from "@/utils/tokenIds.js";
import { chainId } from "@/utils/constants.js";
import { getAddress } from "viem";
import { getLowestValue } from "@/utils/getMostRecentOrDefined.js";
import { ParsedTransferSingle } from "@/parsing/transferSingleEvent.js";
import { StorageMethod } from "@/indexer/processLogs.js";
import _ from "lodash";

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
}) => {
  if (_.isArray(data)) return;

  const hypercertTokenId = getHypercertTokenId(data.token_id);

  if (hypercertTokenId.toString() === data.token_id.toString()) return;

  let claims_id = null;

  const { data: token, error } = await supabase
    .from("fractions")
    .select("*, token_id::text")
    .eq("token_id", data.token_id.toString())
    .maybeSingle();

  if (error) {
    console.error(`[storeTransferSingle] Error while getting token.`, error);
    return;
  }

  if (!token?.claims_id) {
    const { data: claim_id, error: claimError } = await supabase.rpc(
      "get_or_create_claim",
      {
        p_chain_id: chainId,
        p_contract_address: getAddress(data.contract_address),
        p_token_id: hypercertTokenId.toString(),
        p_creation_block_number: getLowestValue(
          token?.creation_block_timestamp,
          data.block_number,
        ),
        p_creation_block_timestamp: getLowestValue(
          token?.creation_block_timestamp,
          data.block_timestamp,
        ),
        p_last_update_block_timestamp: data.block_timestamp,
        p_last_update_block_number: data.block_number,
      },
    );
    if (claimError || !claim_id) {
      console.error(
        `[storeTransferSingle] Error while getting or creating claim for token ${data.token_id}.`,
        claimError,
        claim_id,
      );
      return;
    }

    claims_id = claim_id;
  }

  const _token = {
    ...token,
    claims_id: token?.claims_id ?? claims_id,
    fraction_id: `${chainId}-${getAddress(data.contract_address)}-${data.token_id}`,
    token_id: token?.token_id.toString() ?? data.token_id.toString(),
    creation_block_timestamp: getLowestValue(
      token?.creation_block_timestamp,
      data.block_timestamp,
    ),
    creation_block_number: getLowestValue(
      token?.creation_block_number,
      data.block_number,
    ),
    last_update_block_timestamp: data.block_timestamp,
    last_update_block_number: data.block_number,
    owner_address: getAddress(data.to_owner_address),
    value: data.value.toString(),
  };

  await supabase
    .from("fractions")
    .upsert(_token, {
      onConflict: "claims_id, token_id",
      ignoreDuplicates: false,
      defaultToNull: true,
    })
    .throwOnError();
};
