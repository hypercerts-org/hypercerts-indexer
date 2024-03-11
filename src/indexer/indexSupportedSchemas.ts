import { getSupportedSchemas, storeSupportedSchema } from "@/storage";
import { fetchSchemaData } from "@/fetching";
import { getDeployment } from "@/utils";

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

export type IndexerConfig = {
  batchSize?: bigint;
};

export const indexSupportedSchemas = async (
  config?: Partial<IndexerConfig>,
) => {
  const { chainId } = getDeployment();
  const supportedSchemas = await getSupportedSchemas({ chainId });

  if (!supportedSchemas || supportedSchemas.length === 0) {
    console.error("No supported schemas found");
    return;
  }

  const incompleteSchemas = supportedSchemas.filter(
    (schema) => !schema.schema || !schema.resolver || !schema.revocable,
  );

  await Promise.all(
    incompleteSchemas.map((schema) =>
      fetchSchemaData({ schema }).then((supportedSchema) =>
        storeSupportedSchema({ supportedSchema }),
      ),
    ),
  ).catch((error) => {
    console.error("Error while fetching and updating schema data", error);
  });
};
