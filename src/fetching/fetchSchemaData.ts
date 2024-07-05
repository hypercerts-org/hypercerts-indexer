import { getDeployment } from "@/utils/getDeployment.js";
import { client } from "@/clients/evmClient.js";
import SchemaRegistryAbi from "@/abis/schemaRegistry.js";
import { Hex, isAddress, stringToHex } from "viem";
import { Tables } from "@/types/database.types.js";
import { z } from "zod";
import { messages } from "@/utils/validation.js";

//github.com/ethereum-attestation-service/eas-contracts/blob/master/contracts/ISchemaRegistry.sol
export interface SchemaRecord {
  uid: Hex;
  revocable: boolean;
  resolver: `0x${string}`;
  schema: string;
}

export const createSchemaRecordSchema = (schema_uid: string) =>
  z.object({
    uid: z.string().refine((uid) => uid === schema_uid, {
      message: `Schema data does not match schema UID ${schema_uid}`,
    }),
    revocable: z.boolean(),
    resolver: z.string().refine(isAddress, {
      message: messages.INVALID_ADDRESS,
    }),
    schema: z.string(),
  });

export interface FetchSchemaDataArgs {
  schema: Pick<Tables<"supported_schemas">, "uid">;
}

/**
 * Fetches schema data from a contract using the provided schema's UID.
 *
 * This function takes a schema object as input, which should contain a property `uid`.
 * It uses this UID to fetch the schema data from the contract.
 * If the schema is not provided, or if the schema does not contain a `uid`, the function will throw an error.
 *
 * @param {Object} params - The parameters for the function.
 * @param {Object} params.schema - The schema object. It should contain a property `uid`.
 * @param {string} params.schema.uid - The UID of the schema.
 *
 * @returns {Promise<SchemaRecord | undefined>} A promise that resolves to an object of type SchemaRecord containing the fetched schema data. If there is an error during the contract read operation, the promise is rejected with the error.
 *
 * @example
 * ```typescript
 * const schemaData = await fetchSchemaData({ schema: { uid: '0x1234...5678' } });
 * console.log(schemaData);
 * ```
 */
export const fetchSchemaData = async ({
  schema: { uid },
}: FetchSchemaDataArgs) => {
  const { schemaRegistryAddress } = getDeployment();
  const validationSchema = createSchemaRecordSchema(uid);

  try {
    const _schemaData = await client.readContract({
      address: schemaRegistryAddress as `0x${string}`,
      abi: SchemaRegistryAbi,
      functionName: "getSchema",
      args: [uid as `0x${string}`],
    });

    return validationSchema.parse(_schemaData);
  } catch (e) {
    console.error(
      `[fetchSchemaData] Error fetching data for schema ${uid} on contract ${schemaRegistryAddress}:`,
      e,
    );
    throw e;
  }
};
