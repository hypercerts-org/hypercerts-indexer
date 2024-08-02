import { ParsedTransferSingle } from "@/parsing/parseTransferSingleEvent.js";
import { storeTransferSingle } from "@/storage/storeTransferSingle.js";
import { StorageMethod } from "@/indexer/LogParser.js";

/**
 * Stores the hypercert token and the ownership of the token in the database.
 *
 * This function takes parsed transfer single event data and context, and stores the token information
 * by delegating to the `storeTransferSingle` function.
 *
 * @param {Object} params - The parameters for the function.
 * @param {ParsedTransferSingle} params.data - The parsed transfer single event data.
 * @param {Object} params.context - The context for the storage operation.
 *
 * @returns {Promise<void>} A promise that resolves when the data has been stored.
 *
 * @example
 * ```typescript
 * const data = {
 *   token_id: 1n,
 *   // other properties...
 * };
 * const context = {
 *   // context properties...
 * };
 * await storeTransferBatch({ data, context });
 */
export const storeTransferBatch: StorageMethod<ParsedTransferSingle> = async ({
  data,
  context,
}) => {
  return await storeTransferSingle({ data, context });
};
