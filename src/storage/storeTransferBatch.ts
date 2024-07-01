import { ParsedTransferSingle } from "@/parsing/transferSingleEvent.js";
import { storeTransferSingle } from "@/storage/storeTransferSingle.js";
import { StorageMethod } from "@/indexer/processLogs.js";

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

export const storeTransferBatch: StorageMethod<ParsedTransferSingle> = async ({
  data,
  context,
}) => {
  if (!Array.isArray(data)) return;

  await Promise.all(
    data.map((record) => storeTransferSingle({ data: record, context })),
  );
};
