import { supabase } from "@/clients/supabaseClient";
import { Tables } from "@/types/database.types";
import { NewUnitTransfer } from "@/types/types";
import { getClaimTokenId } from "@/utils/tokenIds";

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

interface StoreUnitTransfer {
  transfers?: NewUnitTransfer[];
}

export const storeUnitTransfer = async ({ transfers }: StoreUnitTransfer) => {
  if (!transfers || transfers.length === 0) {
    console.error(
      "[StoreUnitTransfer] No transfer to store or contract ID provided",
    );
    return;
  }

  console.debug(
    `[StoreUnitTransfer] Storing ${transfers.length} unit transfers`,
  );

  const _transfers = await Promise.all(
    transfers.map(async (transfer) => {
      const { data: claim, error: claimError } = await supabase.rpc(
        "get_or_create_claim",
        {
          p_token_id: getClaimTokenId(transfer.to_token_id).toString(),
          p_contracts_id: transfer.contracts_id,
        },
      );

      if (claimError || !claim) {
        console.error(
          `[StoreUnitTransfer] Error while getting or creating claim.`,
          claimError,
        );
        return;
      }

      const _transfer = {
        claim_id: claim.id,
        from_token_id: transfer.from_token_id.toString(),
        to_token_id: transfer.to_token_id.toString(),
        block_timestamp: transfer.block_timestamp,
        units_transferred: transfer.units,
      };

      return _transfer;
    }),
  );

  await supabase
    .rpc("transfer_units_batch", {
      p_transfers: _transfers,
    })
    .throwOnError();
};
