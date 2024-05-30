import { getDeployment } from "@/utils";
import { client } from "@/clients/evmClient";
import schemaRegistryAbi from "@/abis/schemaRegistry.json";
import { Hex, isAddress } from "viem";
import { Tables } from "@/types/database.types";
import { z } from "zod";
import { messages } from "@/utils/validation";

/**
 * Fetches schema data from a contract using the provided schema's EAS ID.
 *
 * @param schema - An optional object of type Tables<"supported_schemas">. If provided, it should contain a property `eas_schema_id` which is used to fetch the schema data from the contract.
 *
 * @returns If successful, it returns an object of type SchemaRecord containing the fetched schema data. If the schema is not provided, or if the schema does not contain an `eas_schema_id`, or if there is an error during the contract read operation, it returns undefined.
 *
 * @example
 * ```typescript
 * const schemaData = await fetchSchemaData({ schema: { eas_schema_id: '0x1234...5678' } });
 * ```
 */

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
  schema?: Pick<Tables<"supported_schemas">, "eas_schema_id">;
}

export const fetchSchemaData = async ({
  schema,
}: {
  schema?: Pick<Tables<"supported_schemas">, "eas_schema_id">;
}) => {
  if (!schema || !schema.eas_schema_id) {
    console.error(`Could not find EAS ID for schema`, schema);
    return;
  }

  const { schemaRegistryAddress } = getDeployment();
  const { eas_schema_id } = schema;
  const validationSchema = createSchemaRecordSchema(eas_schema_id);

  try {
    const _schemaData = await client.readContract({
      address: schemaRegistryAddress as `0x${string}`,
      abi: schemaRegistryAbi,
      functionName: "getSchema",
      args: [eas_schema_id],
    });

    return validationSchema.parse(_schemaData);
  } catch (e) {
    console.error(
      `Error fetching data for schema ${eas_schema_id} on contract ${schemaRegistryAddress}:`,
      e,
    );
    return;
  }
};
