import { getSupportedSchemas } from "@/storage/getSupportedSchemas";
import { IndexerConfig } from "@/types/types";
import { fetchSchemaData } from "@/fetching/fetchSchemaData";
import { storeSupportedSchemas } from "@/storage/storeSupportedSchemas";

/**
 * Indexes supported schemas and stores them in the database.
 *
 * This function fetches the supported schemas and filters out any that are incomplete.
 * An incomplete schema is one that does not have a `schema`, `resolver`, or `revocable` property.
 * The function then processes the incomplete schemas in batches, fetching additional data for each schema and storing the updated schemas in the database.
 *
 * @param {Object} config - The configuration for the function.
 * @param {bigint} config.batchSize - The number of schemas to process in each batch. Defaults to `defaultConfig.batchSize`.
 *
 * @returns {Promise<void>} A promise that resolves when all supported schemas have been processed and stored. If there is an error during the process, the promise is rejected with the error.
 *
 * @example
 * ```typescript
 * await indexSupportedSchemas({ batchSize: 5n });
 * ```
 */

const defaultConfig = {
  batchSize: 5n,
};

export const indexSupportedSchemas = async ({
  batchSize = defaultConfig.batchSize,
}: IndexerConfig = defaultConfig) => {
  const supportedSchemas = await getSupportedSchemas();

  if (!supportedSchemas || supportedSchemas.length === 0) {
    console.debug("[IndexSupportedSchema] No supported schemas found");
    return;
  }

  const incompleteSchemas = supportedSchemas.filter(
    (schema) =>
      !schema.schema ||
      !schema.resolver ||
      schema.revocable === null ||
      schema.revocable === undefined,
  );

  const _size = Number(batchSize);

  for (let i = 0; i < incompleteSchemas.length; i += _size) {
    const batch = incompleteSchemas.slice(i, i + _size);

    try {
      const schemaData = await Promise.all(
        batch.map(async (schema) => ({
          ...schema,
          ...(await fetchSchemaData({ schema })),
        })),
      );

      await storeSupportedSchemas({
        supportedSchemas: schemaData,
      });
    } catch (error) {
      console.error("[IndexSupportedSchema] Error processing batch: ", {
        error,
        batch,
      });
      throw error;
    }
  }
};
