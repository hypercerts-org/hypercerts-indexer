import { ParsedValueTransfer } from "@/parsing/valueTransferEvent.js";
import { storeValueTransfer } from "@/storage/storeValueTransfer.js";
import { StorageMethod } from "@/indexer/LogParser.js";
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

export const storeBatchValueTransfer: StorageMethod<
  ParsedValueTransfer
> = async ({ data, context }) => {
  await storeValueTransfer({ data, context });
};
