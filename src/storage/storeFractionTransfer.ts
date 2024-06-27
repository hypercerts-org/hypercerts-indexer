import { supabase } from "@/clients/supabaseClient.js";
import { getHypercertTokenId } from "@/utils/tokenIds.js";
import _ from "lodash";
import { chainId } from "@/utils/constants.js";
import { getAddress } from "viem";
import { Tables } from "@/types/database.types.js";
import { ParsedTransferSingle } from "@/parsing/transferSingleEvent";
import {
  getHighestValue,
  getLowestValue,
} from "@/utils/getMostRecentOrDefined";

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

interface StoreTransferSingle {
  transfers?: ParsedTransferSingle[];
}

export const storeFractionTransfer = async ({
  transfers,
}: StoreTransferSingle) => {
  if (!transfers || transfers.length === 0) {
    console.debug("[StoreTransferSingle] No transfers to store");
    return;
  }

  console.debug(
    `[StoreTransferFraction] Storing ${transfers.length} transfers`,
  );

  const tokens = await Promise.all(
    transfers.map(async (transfer) => {
      const { data: token, error: tokenError } = await supabase
        .from("fractions")
        .select("*, token_id::text")
        .eq("token_id", transfer.token_id.toString())
        .maybeSingle();

      if (tokenError) {
        console.error(
          `[StoreTransferFraction] Error while getting token.`,
          tokenError,
        );
        return;
      }

      let data: Partial<Tables<"fractions">> = {};
      if (token) {
        data = {
          id: token.id,
          claims_id: token.claims_id,
        };
      }

      if (!data?.claims_id) {
        const { data: claim_id, error: claimError } = await supabase.rpc(
          "get_or_create_claim",
          {
            p_chain_id: chainId,
            p_contract_address: getAddress(transfer.contract_address),
            p_token_id: getHypercertTokenId(transfer.token_id).toString(),
            p_creation_block_number: getLowestValue(
              token?.creation_block_timestamp,
              transfer.block_number,
            ),
            p_creation_block_timestamp: getLowestValue(
              token?.creation_block_timestamp,
              transfer.block_timestamp,
            ),
            p_last_update_block_number: getHighestValue(
              token?.last_update_block_number,
              transfer.block_number,
            ),
            p_last_update_block_timestamp: getHighestValue(
              token?.last_update_block_timestamp,
              transfer.block_timestamp,
            ),
          },
        );

        if (claimError || !claim_id) {
          console.error(
            `[StoreTransferFraction] Error while getting or creating claim.`,
            claimError,
            claim_id,
          );
          return;
        }

        data.claims_id = claim_id;
      }

      console.log("token: ", token);

      return {
        ...data,
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
        last_update_block_timestamp: getHighestValue(
          token?.last_update_block_timestamp,
          transfer.block_timestamp,
        ),
        last_update_block_number: getHighestValue(
          token?.last_update_block_number,
          transfer.block_number,
        ),
        owner_address: getAddress(transfer.to_owner_address),
        value: transfer.value.toString(),
      };
    }),
  );

  console.debug(`[StoreTransferFraction] Storing ${tokens.length} tokens`);

  console.log("tokens", tokens);

  const sortedUniqueTokens = _(tokens)
    .orderBy(["last_update_block_timestamp"], ["desc"])
    .uniqBy("fraction_id")
    .value();

  console.debug(
    `[StoreTransferFraction] Found ${sortedUniqueTokens.length} unique tokens`,
  );

  console.log("sortedUniqueTokens", sortedUniqueTokens);

  return await supabase
    .from("fractions")
    .upsert(sortedUniqueTokens, {
      onConflict: "claims_id, token_id",
      ignoreDuplicates: false,
      defaultToNull: false,
    })
    .throwOnError();
};
