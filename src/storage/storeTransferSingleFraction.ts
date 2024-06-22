import { supabase } from "@/clients/supabaseClient.js";
import { NewTransfer } from "@/types/types.js";
import { getClaimTokenId } from "@/utils/tokenIds.js";
import _ from "lodash";
import { chainId } from "@/utils/constants.js";
import { getAddress } from "viem";
import { Database } from "@/types/database.types.js";

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
  transfers?: NewTransfer[];
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
        .select("*")
        .eq("token_id", transfer.token_id.toString())
        .maybeSingle();

      if (tokenError) {
        console.error(
          `[StoreTransferSingleFraction] Error while getting token.`,
          tokenError,
        );
        return;
      }

      let data: Partial<Database["public"]["Tables"]["fractions"]["Row"]> = {};
      if (token) {
        data = {
          id: token.id,
          claims_id: token.claims_id,
        };
      }

      if (
        token?.owner_address &&
        token.owner_address !== transfer.from_owner_address
      ) {
        console.error(
          `[StoreTransferSingleFraction] Error while getting token; owner address mismatch.`,
          tokenError,
        );
        return;
      }

      if (!data?.claims_id) {
        const { data: claim, error: claimError } = await supabase.rpc(
          "get_or_create_claim",
          {
            p_token_id: getClaimTokenId(transfer.token_id).toString(),
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
        hypercert_id: `${chainId}-${getAddress(transfer.contract_address)}-${getClaimTokenId(transfer.token_id)}`,
        fraction_id:
          token?.fraction_id ??
          `${chainId}-${getAddress(transfer.contract_address)}-${transfer.token_id}`,
        token_id: token?.token_id ?? transfer.token_id.toString(),
        creation_block_timestamp:
          token?.creation_block_timestamp ??
          transfer.block_timestamp.toString(),
        creation_block_number:
          token?.creation_block_number ?? transfer.block_number.toString(),
        last_block_update_timestamp: transfer.block_timestamp.toString(),
        last_block_update_number: transfer.block_number.toString(),
        owner_address: transfer.to_owner_address,
        value: transfer.value.toString(),
      };
    }),
  );

  console.debug(
    `[StoreTransferSingleFraction] Storing ${tokens.length} tokens`,
  );

  const sortedUniqueTokens = _(tokens)
    .orderBy(["last_block_update_timestamp"], ["desc"])
    .uniqBy("fraction_id")
    .value();

  console.debug(
    `[StoreTransferSingleFraction] Found ${sortedUniqueTokens.length} unique tokens`,
  );

  return await supabase
    .from("fractions")
    .upsert(sortedUniqueTokens, { onConflict: "fraction_id" })
    .throwOnError();
};
