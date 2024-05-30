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
 * Indexes attestation logs for all supported schemas. Attestation logs are fetched from the chain and parsed into attestation data.
 * The attestation data is then stored in the database.
 *
 * @param [batchSize] - The number of logs to fetch and parse in each batch.
 *
 * @example
 * ```js
 * await indexAttestations({ batchSize: 1000n });
 * ```
 */

const defaultConfig = { batchSize: 10000n };

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

        return await storeSupportedSchemas({
          supportedSchemas: [
            {
              ...schema,
              last_block_indexed: toBlock,
            },
          ],
        });
      }

      const parsedEvents = (
        await Promise.all(logs.map(parseAttestedEvent))
      ).filter(
        (attestation): attestation is ParsedAttestedEvent =>
          attestation !== null,
      );

      const attestations = (
        await Promise.all(
          parsedEvents.map(async (event) =>
            fetchAttestationData({ attestedEvent: event }).then((attestation) =>
              decodeAttestationData({ attestation, schema }),
            ),
          ),
        )
      ).filter(
        (attestation): attestation is Tables<"attestations"> =>
          attestation !== null && attestation !== undefined,
      );

      return await storeAttestations({
        attestations,
      }).then(
        async () =>
          await storeSupportedSchemas({
            supportedSchemas: [
              {
                ...schema,
                last_block_indexed: attestedEvents.toBlock,
              },
            ],
          }),
      );
    }),
  ).catch((error) => {
    console.error(
      "[IndexAttestations] Error while fetching and updating attestation data",
      error,
    );
    return;
  });
};
