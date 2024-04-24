import { getAttestationsForSchema } from "@/monitoring";
import { getDeployment } from "@/utils";
import { decodeAttestationData, parseAttestedEvent } from "@/parsing";
import { Tables } from "@/types/database.types";
import { ParsedAttestedEvent } from "@/parsing/attestedEvent";
import { IndexerConfig } from "@/types/types";
import { getSupportedSchemas } from "@/storage/getSupportedSchemas";
import { storeSupportedSchemas } from "@/storage/storeSupportedSchemas";
import { storeAttestations } from "@/storage/storeAttestations";
import { fetchAttestationData } from "@/fetching/fetchAttestationData";

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

const defaultConfig = { batchSize: 1000n };

export const indexAttestations = async ({
  batchSize = defaultConfig.batchSize,
}: IndexerConfig = defaultConfig) => {
  const { chainId } = getDeployment();
  const supportedSchemas = await getSupportedSchemas({ chainId });

  if (!supportedSchemas || supportedSchemas.length === 0) {
    console.debug("[IndexAttestations] No supported schemas found");
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

      if (!attestedEvents) {
        return;
      }

      const { logs, toBlock } = attestedEvents;

      if (!logs || logs.length === 0) {
        console.debug(
          "[IndexAttestations] No logs found for supported schemas",
          schemasToIndex.map((schema) => schema?.id),
        );

        await storeSupportedSchemas({
          supportedSchemas: [
            {
              ...schema,
              last_block_indexed: toBlock,
            },
          ],
        });
        return;
      }

      const parsedEvents = (
        await Promise.all(logs.map(parseAttestedEvent))
      ).filter((attestation) => attestation !== null) as ParsedAttestedEvent[];

      const attestations = (
        await Promise.all(
          parsedEvents.map(async (parsedEvent) =>
            fetchAttestationData({ attestation: parsedEvent }).then(
              (attestation) => decodeAttestationData({ attestation, schema }),
            ),
          ),
        )
      ).filter(
        (attestation): attestation is Tables<"attestations"> =>
          attestation !== null,
      );

      const result = await storeAttestations({
        attestations,
        schema,
      });

      if (result) {
        await storeSupportedSchemas({
          supportedSchemas: [
            {
              ...schema,
              last_block_indexed: attestedEvents.toBlock,
            },
          ],
        });
      }
    }),
  ).catch((error) => {
    console.error(
      "[IndexAttestations] Error while fetching and updating attestation data",
      error,
    );
    return;
  });
};
