import { supabase } from "@/clients/supabaseClient";
import { NewTransfer } from "@/types/types";
import { getClaimTokenId } from "@/utils/tokenIds";
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

      return {
        claims_id: claim.id,
        token_id: transfer.token_id.toString(),
        creation_block_timestamp: transfer.block_timestamp.toString(),
        block_timestamp: transfer.block_timestamp.toString(),
        from_owner_address: transfer.from_owner_address,
        to_owner_address: transfer.to_owner_address,
        value: transfer.value.toString(),
      };
    }),
  );

  console.debug(
    `[StoreTransferSingleFraction] Storing ${tokens.length} tokens`,
  );

  const sortedUniqueTokens = _(tokens)
    .orderBy(["last_block_update_timestamp"], ["desc"])
    .uniqBy("token_id")
    .value();

  console.debug(
    `[StoreTransferSingleFraction] Found ${sortedUniqueTokens.length} unique tokens`,
  );

  return await supabase
    .rpc("transfer_fractions_batch", { p_transfers: sortedUniqueTokens })
    .throwOnError();
};
