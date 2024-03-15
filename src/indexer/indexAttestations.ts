import { getAttestationsForSchema } from "@/monitoring";
import {
  getSupportedSchemas,
  storeAttestations,
  storeSupportedSchema,
} from "@/storage";
import { fetchAttestationData } from "@/fetching";
import { getDeployment } from "@/utils";
import { decodeAttestationData, parseAttestedEvent } from "@/parsing";
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

export type IndexerConfig = {
  batchSize?: bigint;
};

const defaultConfig = { batchSize: 1000n };

export const indexAttestations = async ({
  batchSize = defaultConfig.batchSize,
}: IndexerConfig = defaultConfig) => {
  const { chainId } = getDeployment();
  const supportedSchemas = await getSupportedSchemas({ chainId });

  if (!supportedSchemas || supportedSchemas.length === 0) {
    console.error("No supported schemas found");
    return;
  }

  // Get schema structure for all supported schemas
  const schemasToIndex = supportedSchemas.filter((schema) => schema?.schema);

  await Promise.all(
    schemasToIndex.map(async (schema) => {
      const attestedEvents = await getAttestationsForSchema({
        schema,
        fromBlock: schema?.last_block_indexed
          ? BigInt(schema?.last_block_indexed)
          : undefined,
        batchSize,
      });

      if (!attestedEvents?.logs || attestedEvents.logs.length === 0) {
        console.info(
          "No logs found for supported schemas",
          schemasToIndex.map((schema) => schema?.id),
        );

        await storeSupportedSchema({
          supportedSchema: {
            ...schema,
            last_block_indexed: attestedEvents.toBlock,
          },
        });
        return;
      }

      const parsedEvents = await Promise.all(
        attestedEvents.logs.map(parseAttestedEvent),
      );

      const parsedAttestations = await Promise.all(
        parsedEvents.map(
          async (parsedEvent) =>
            await fetchAttestationData({ attestation: parsedEvent }).then(
              (attestation) => decodeAttestationData({ attestation, schema }),
            ),
        ),
      );

      const filteredAttestations = parsedAttestations.filter(
        (attestation): attestation is Tables<"attestations"> =>
          attestation !== null,
      );

      const result = await storeAttestations({
        attestations: filteredAttestations,
        schema,
      });

      if (result) {
        await storeSupportedSchema({
          supportedSchema: {
            ...schema,
            last_block_indexed: attestedEvents.toBlock,
          },
        });
      }
    }),
  ).catch((error) => {
    console.error("Error while fetching and updating attestation data", error);
    return;
  });
};
