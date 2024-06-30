import { supabase } from "@/clients/supabaseClient.js";
import { getHypercertTokenId } from "@/utils/tokenIds.js";
import { chainId } from "@/utils/constants.js";
import { getAddress } from "viem";
import { getLowestValue } from "@/utils/getMostRecentOrDefined.js";
import { Tables } from "@/types/database.types";
import _ from "lodash";
import { ParsedTransferSingle } from "@/parsing/transferSingleEvent.js";

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

export const storeTransferSingle = async (data: ParsedTransferSingle[]) => {
  const tokens: Tables<"fractions">[] = [];

  console.debug(`[StoreTransferSingle] Storing ${data.length} tokens`);

  for (const transfer of data) {
    const hypercertTokenId = getHypercertTokenId(transfer.token_id);

    if (hypercertTokenId.toString() === transfer.token_id.toString()) continue;

    let token = tokens.find(
      (t) => t?.token_id === transfer.token_id.toString(),
    );

    let claims_id = null;

    if (!token) {
      const { data, error } = await supabase
        .from("fractions")
        .select("*, token_id::text")
        .eq("token_id", transfer.token_id.toString())
        .maybeSingle();

      if (error) {
        console.error(
          `[StoreTransferFraction] Error while getting token.`,
          error,
        );
        return;
      }

      token = data;
    }

    if (!token?.claims_id) {
      const { data: claim_id, error: claimError } = await supabase.rpc(
        "get_or_create_claim",
        {
          p_chain_id: chainId,
          p_contract_address: getAddress(transfer.contract_address),
          p_token_id: hypercertTokenId.toString(),
          p_creation_block_number: getLowestValue(
            token?.creation_block_timestamp,
            transfer.block_number,
          ),
          p_creation_block_timestamp: getLowestValue(
            token?.creation_block_timestamp,
            transfer.block_timestamp,
          ),
          p_last_update_block_timestamp: transfer.block_timestamp,
          p_last_update_block_number: transfer.block_number,
        },
      );
      if (claimError || !claim_id) {
        console.error(
          `[StoreTransferFraction] Error while getting or creating claim for token ${transfer.token_id}.`,
          claimError,
          claim_id,
        );
        return;
      }

      claims_id = claim_id;
    }

    const replaceToken = (array, token) => {
      const index = array.findIndex((t) => t.token_id === token.token_id);
      if (index !== -1) {
        array[index] = token;
      } else {
        array.push(token);
      }
    };

    const _token = {
      ...token,
      claims_id: token?.claims_id ?? claims_id,
      fraction_id: `${chainId}-${getAddress(transfer.contract_address)}-${transfer.token_id}`,
      token_id: token?.token_id.toString() ?? transfer.token_id.toString(),
      creation_block_timestamp: getLowestValue(
        token?.creation_block_timestamp,
        transfer.block_timestamp,
      ),
      creation_block_number: getLowestValue(
        token?.creation_block_number,
        transfer.block_number,
      ),
      last_update_block_timestamp: transfer.block_timestamp,
      last_update_block_number: transfer.block_number,
      owner_address: getAddress(transfer.to_owner_address),
      value: transfer.value.toString(),
    };

    replaceToken(tokens, _token);
  }

  const sortedUniqueTokens = _(tokens)
    .orderBy(["last_update_block_timestamp"], ["desc"])
    .uniqBy("fraction_id")
    .value();

  const tokensToStore = sortedUniqueTokens.filter(
    (token) => token !== undefined && token !== null,
  );

  if (tokensToStore.length === 0) {
    console.debug("[StoreTransferFraction] No tokens to store");
    return;
  }

  await supabase
    .from("fractions")
    .upsert(tokensToStore, {
      onConflict: "claims_id, token_id",
      ignoreDuplicates: false,
      defaultToNull: true,
    })
    .throwOnError();
};
