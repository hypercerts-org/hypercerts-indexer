import { supabase } from "@/clients/supabaseClient.js";
import { NewUnitTransfer } from "@/types/types.js";
import { getHypercertTokenId } from "@/utils/tokenIds.js";

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
    console.debug(
      "[StoreUnitTransfer] No transfer to store or contract ID provided",
    );
    return;
  }

  console.debug(
    `[StoreUnitTransfer] Storing ${transfers.length} unit transfers`,
  );

  const claimIds: { [key: string]: string } = {};

  const _transfers = await Promise.all(
    transfers.map(async (transfer) => {
      const claimTokenId =
        transfer.from_token_id === 0n
          ? getHypercertTokenId(transfer.to_token_id).toString()
          : getHypercertTokenId(transfer.from_token_id).toString();
      let claimId = claimIds[claimTokenId];

      if (!claimId) {
        const { data: claim } = await supabase
          .rpc("get_or_create_claim", {
            p_token_id: claimTokenId,
            p_contracts_id: transfer.contracts_id,
          })
          .throwOnError();
        claimId = claim?.id;
        claimIds[claimTokenId] = claim?.id;
      }

      if (!claimId) {
        console.error(`[StoreUnitTransfer] Could net get claim_id.`);
        return;
      }

      return {
        claim_id: claimId,
        from_token_id: transfer.from_token_id.toString(),
        to_token_id: transfer.to_token_id.toString(),
        last_update_block_timestamp:
          transfer.last_update_block_timestamp.toString(),
        last_update_block_number: transfer.last_update_block_number.toString(),
        units_transferred: transfer.units,
      };
    }),
  );

  await supabase
    .rpc("transfer_units_batch", {
      p_transfers: _transfers,
    })
    .throwOnError();
};
