import { getDeployment } from "@/utils";
import { client } from "@/clients/evmClient";
import schemaRegistryAbi from "@/abis/schemaRegistry.json";
import { Hex, isAddress } from "viem";
import { Tables } from "@/types/database.types";

//github.com/ethereum-attestation-service/eas-contracts/blob/master/contracts/ISchemaRegistry.sol

export interface SchemaRecord {
  uid: Hex;
  revocable: boolean;
  resolver: `0x${string}`;
  schema: string;
}

/*
 * This function fetches the attestation data as stored at the provided UID on the contract.
 *
 * @param attestation - The EAS Attested event data.
 * @returns  - The event data with the attestation data attached
 *
 * @example
 * ```js
 *
 * const easData: EASData = {
 * recipient: "0x1234...5678",
 * attester: "0x1234...5678",
 * uid: "0x1234...5678",
 * schema: "0x1234...5678",
 *  };
 *
 * const attestation = await fetchAttestationData(easData);
 * ```
 */
export const fetchSchemaData = async ({
  schema,
}: {
  schema?: Tables<"supported_schemas">;
}) => {
  if (!schema || !schema.eas_schema_id) {
    console.error(`Could not find EAS ID for schema`, schema);
    return;
  }

  const { schemaRegistryAddress } = getDeployment();
  const { eas_schema_id } = schema;

  try {
    const _schemaData = await client.readContract({
      address: schemaRegistryAddress as `0x${string}`,
      abi: schemaRegistryAbi,
      functionName: "getSchema",
      args: [eas_schema_id],
    });

    if (!_schemaData || !isSchemaRecord(_schemaData)) {
      console.error("Invalid schema data", _schemaData);
      return;
    }

    if (_schemaData.uid != eas_schema_id) {
      console.error(
        `Schema data UID ${_schemaData.uid} does not match schema UID ${eas_schema_id}`,
      );
      return;
    }

    const _schema = schema;

    _schema.schema = _schemaData.schema;
    _schema.resolver = _schemaData.resolver;
    _schema.revocable = _schemaData.revocable;

    return _schema;
  } catch (e) {
    console.error(
      `Error fetching data for schema ${eas_schema_id} on contract ${schemaRegistryAddress}:`,
      e,
    );
    return;
  }
};

const isSchemaRecord = (data: unknown): data is SchemaRecord => {
  return (
    typeof data === "object" &&
    data !== null &&
    "uid" in data &&
    typeof data.uid === "string" &&
    "revocable" in data &&
    typeof data.revocable === "boolean" &&
    "resolver" in data &&
    typeof data.resolver === "string" &&
    isAddress(data.resolver) &&
    "schema" in data &&
    typeof data.schema === "string"
  );
};
