import { supabase } from "@/clients/supabaseClient";
import { Tables } from "@/types/database.types";
import { NewUnitTransfer } from "@/types/types";
import * as console from "console";

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
  contract?: Pick<Tables<"contracts">, "id">;
}

export const storeUnitTransfer = async ({
  transfers,
  contract,
}: StoreUnitTransfer) => {
  if (!transfers || transfers.length === 0 || !contract) {
    console.error(
      "[StoreUnitTransfer] No transfer to store or contract ID provided",
    );
    return;
  }

  console.debug(
    `[StoreUnitTransfer] Storing ${transfers.length} unit transfers`,
  );

  const results = []; // Array to store the results

  for (const transfer of transfers) {
    try {
      const { data, error } = await supabase.rpc("transfer_units", {
        p_contracts_id: contract.id,
        p_from_token_id: transfer.from_token_id.toString(),
        p_to_token_id: transfer.to_token_id.toString(),
        p_block_timestamp: transfer.block_timestamp.toString(),
        p_units_transferred: transfer.units.toString(),
      });

      if (error) {
        console.error(
          `[StoreUnitTransfer] Error while transferring units: ${error.message}`,
        );
        return;
      }

      console.debug(
        `[StoreUnitTransfer] Transferred ${transfer.units.toString()} units from token ${transfer.from_token_id.toString()} to token ${transfer.to_token_id.toString()}`,
      );

      results.push(data); // Add the result to the results array
    } catch (error) {
      if (error instanceof Error) {
        console.error(
          `[StoreUnitTransfer] Error while transferring units: ${error.message}`,
        );
      } else {
        console.error(
          `[StoreUnitTransfer] An unknown error occurred: ${JSON.stringify(error)}`,
        );
      }
    }
  }
};
