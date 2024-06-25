import { supabase } from "@/clients/supabaseClient.js";
import { getHypercertTokenId } from "@/utils/tokenIds.js";
import _ from "lodash";
import { chainId } from "@/utils/constants.js";
import { getAddress } from "viem";
import { Tables } from "@/types/database.types.js";
import { ParsedTransferSingle } from "@/parsing/transferSingleEvent";

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

export const storeTransferSingleFraction = async ({
  transfers,
}: StoreTransferSingle) => {
  if (!transfers || transfers.length === 0) {
    console.debug("[StoreTransferSingle] No transfers to store");
    return;
  }

  console.debug(
    `[StoreTransferSingleFraction] Storing ${transfers.length} transfers`,
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
          `[StoreTransferSingleFraction] Error while getting token.`,
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
        const { data: claim, error: claimError } = await supabase.rpc(
          "get_or_create_claim",
          {
            p_token_id: getHypercertTokenId(transfer.token_id).toString(),
            p_contracts_id: transfer.contracts_id,
          },
        );

        if (claimError || !claim) {
          console.error(
            `[StoreTransferSingleFraction] Error while getting or creating claim.`,
            claimError,
          );
          return;
        }

        data.claims_id = claim.id;
      }

      return {
        ...data,
        fraction_id: `${chainId}-${getAddress(transfer.contract_address)}-${transfer.token_id}`,
        token_id: token?.token_id.toString() ?? transfer.token_id.toString(),
        creation_block_timestamp:
          token?.creation_block_timestamp ??
          transfer.block_timestamp.toString(),
        creation_block_number:
          token?.creation_block_number ?? transfer.block_number.toString(),
        last_update_block_timestamp: transfer.block_timestamp.toString(),
        last_update_block_number: transfer.block_number.toString(),
        owner_address: getAddress(transfer.to_owner_address),
        value: transfer.value.toString(),
      };
    }),
  );

  console.debug(
    `[StoreTransferSingleFraction] Storing ${tokens.length} tokens`,
  );

  const sortedUniqueTokens = _(tokens)
    .orderBy(["last_update_block_timestamp"], ["desc"])
    .uniqBy("fraction_id")
    .value();

  console.debug(
    `[StoreTransferSingleFraction] Found ${sortedUniqueTokens.length} unique tokens`,
  );

  return await supabase
    .from("fractions")
    .upsert(sortedUniqueTokens, {
      ignoreDuplicates: false,
      defaultToNull: false,
    })
    .throwOnError();
};
