import { getDeployment } from "@/utils";
import { getSupportedSchemas } from "@/storage/getSupportedSchemas";
import { storeSupportedSchemas } from "@/storage/storeSupportedSchemas";
import { IndexerConfig } from "@/types/types";
import { fetchSchemaData } from "@/fetching/fetchSchemaData";
import { Tables } from "@/types/database.types";

/*
 * This function indexes the logs of the ClaimStored event emitted by the HypercertMinter contract. Based on the last
 * block indexed, it fetches the logs in batches, parses them, fetches the metadata, and stores the hypercerts in the
 * database.
 *
 * @param [batchSize] - The number of logs to fetch and parse in each batch.
 *
 * @example
 * ```js
 * await indexClaimsStoredEvents({ batchSize: 1000n });
 * ```
 */

const defaultConfig = {
  batchSize: 5n,
};

export const indexSupportedSchemas = async ({
  batchSize = defaultConfig.batchSiz,
}: IndexerConfig = defaultConfig) => {
  const { chainId } = getDeployment();
  const supportedSchemas = await getSupportedSchemas({ chainId });

  if (!supportedSchemas || supportedSchemas.length === 0) {
    console.error("[IndexSupportedSchema] No supported schemas found");
    return;
  }

  const incompleteSchemas = supportedSchemas.filter(
    (schema) => !schema.schema || !schema.resolver || !schema.revocable,
  );

  const schemaData = (
    await Promise.all(
      incompleteSchemas.map((schema) => fetchSchemaData({ schema })),
    )
  ).filter(
    (schema): schema is Tables<"supported_schemas"> =>
      schema !== null && schema !== undefined,
  );

  const res = await storeSupportedSchemas({
    supportedSchemas: schemaData,
  });

  if (!res) {
    console.error("[IndexSupportedSchema] Failed to store supported schemas");
  }
};
