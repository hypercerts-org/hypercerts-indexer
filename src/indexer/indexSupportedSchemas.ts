import { getDeployment } from "@/utils";
import { getSupportedSchemas } from "@/storage/getSupportedSchemas";
import { IndexerConfig } from "@/types/types";
import { fetchSchemaData } from "@/fetching/fetchSchemaData";
import { Tables } from "@/types/database.types";
import { storeSupportedSchemas } from "@/storage/storeSupportedSchemas";

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
  batchSize = defaultConfig.batchSize,
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

  const _size = Number(batchSize);

  for (let i = 0; i < incompleteSchemas.length; i += _size) {
    const batch = incompleteSchemas.slice(i, i + _size);
    const schemaData = (
      await Promise.all(batch.map((schema) => fetchSchemaData({ schema })))
    ).filter(
      (schema): schema is Tables<"supported_schemas"> =>
        schema !== null && schema !== undefined,
    );

    await storeSupportedSchemas({
      supportedSchemas: schemaData,
    });
  }
};
