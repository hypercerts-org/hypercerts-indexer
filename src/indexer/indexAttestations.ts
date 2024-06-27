import { getAttestationsForSchema } from "@/monitoring/eas.js";
import { decodeAttestationData } from "@/parsing/attestationData.js";
import { parseAttestedEvent } from "@/parsing/attestedEvent.js";

import { IndexerConfig } from "@/types/types.js";
import { getSupportedSchemas } from "@/storage/getSupportedSchemas.js";
import { storeSupportedSchemas } from "@/storage/storeSupportedSchemas.js";
import { storeAttestations } from "@/storage/storeAttestations.js";
import { fetchAttestationData } from "@/fetching/fetchAttestationData.js";

/**
 * Indexes attestation logs for all supported schemas. Attestation logs are fetched from the chain and parsed into attestation data.
 * The attestation data is then stored in the database.
 *
 * @param {IndexerConfig} config - Configuration object for the indexer. It has a batchSize property which determines the number of logs to fetch and parse in each batch.
 * @param {bigint} config.batchSize - The number of logs to fetch and parse in each batch. Defaults to 10000n.
 *
 * @returns {Promise<void>} - Returns a promise that resolves when the indexing operation is complete. If an error occurs during the operation, the promise is rejected with the error.
 *
 * @example
 * ```typescript
 * await indexAttestations({ batchSize: 1000n });
 * ```
 */

const defaultConfig = { batchSize: 10000n };

export const indexAttestations = async ({
  batchSize = defaultConfig.batchSize,
}: IndexerConfig = defaultConfig) => {
  const supportedSchemas = await getSupportedSchemas();

  if (!supportedSchemas || supportedSchemas.length === 0) {
    console.debug("[IndexAttestations] No supported schemas found");
    return;
  }

  await Promise.all(
    supportedSchemas.map(async (supportedSchema) => {
      const { id, uid, last_block_indexed } = supportedSchema;
      const attestedEvents = await getAttestationsForSchema({
        schema: { uid },
        lastBlockIndexed: last_block_indexed ? BigInt(last_block_indexed) : 0n,
        batchSize,
      });

      const { logs, toBlock } = attestedEvents;

      if (!logs || logs.length === 0) {
        console.debug(
          "[IndexAttestations] No logs found for supported schema",
          { supported_schema_id: id, uid },
        );

        console.debug(`Storing updated supported schema: `, {
          supportedSchemas: [
            {
              ...supportedSchema,
              last_block_indexed: toBlock,
            },
          ],
        });

        return await storeSupportedSchemas({
          supportedSchemas: [
            {
              ...supportedSchema,
              last_block_indexed: toBlock,
            },
          ],
        });
      }

      const parsedEvents = await Promise.all(logs.map(parseAttestedEvent));

      const attestations = await Promise.all(
        parsedEvents.flatMap(async (event) =>
          fetchAttestationData({ attestedEvent: event }).then(
            ({ attestation, event }) =>
              decodeAttestationData({
                attestation,
                event,
                schema: supportedSchema,
              }),
          ),
        ),
      );

      return await storeAttestations({
        attestations,
      }).then(
        async () =>
          await storeSupportedSchemas({
            supportedSchemas: [
              {
                ...supportedSchema,
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
