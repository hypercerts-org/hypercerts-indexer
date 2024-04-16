import { supabase } from "@/clients/supabaseClient";
import { Tables } from "@/types/database.types";
import { NewTransfer } from "@/types/types";
import console from "console";

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
  tokens?: NewTransfer[];
  contract: Pick<Tables<"contracts">, "id">;
}

export const storeTransferSingle = async ({
  tokens,
  contract,
}: StoreTransferSingle) => {
  if (!tokens || tokens.length === 0 || !contract) {
    console.error(
      "[StoreTransferSingle] No tokens to store or contract ID provided",
    );
    return;
  }

  console.debug(`[StoreTransferSingle] Storing ${tokens.length} tokens`);

  const results = []; // Array to store the results

  for (const token of tokens) {
    try {
      const _token = {
        p_contracts_id: contract.id,
        p_token_id: token.token_id.toString(),
        p_creation_block_timestamp: token.block_timestamp,
        p_last_block_update_timestamp: token.block_timestamp,
        p_owner_address: token.owner_address,
        p_value: token.value.toString(),
        p_type: token.type,
      };

      const { data, error } = await supabase.rpc(
        "upsert_hypercert_token",
        _token,
      );

      if (error) {
        throw new Error(
          `[StoreTransferSingle] Error while storing hypercert: ${error.message}`,
        );
      }

      console.debug(
        `[StoreTransferSingle] Transferred ${token.token_id} units to ${token.owner_address}},
      );

      results.push(data);
    } catch (error) {
      if (error instanceof Error) {
        console.error(
          `[StoreTransferSingle] Error while storing transfer: ${error.message}`,
          error,
        );
      } else {
        console.error(
          `[StoreTransferSingle] An unknown error occurred while storing the token.`,
          error,
        );
      }
    }
  }
};
