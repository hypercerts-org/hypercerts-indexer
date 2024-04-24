import { decodeAbiParameters, isAddress } from "viem";
import { Tables } from "@/types/database.types";
import { isAttestation } from "@/fetching/fetchAttestationData";
import { parseSchemaToABI } from "@/utils/parseSchemaToAbi";

/*
 * Helper method to get the attestation content from the encoded data
 *
 * @param attestation - The attestation object.
 *
 * @returns {AttestationData} - The provided attestation object extended with the decoded attestation data.
 * */
export const decodeAttestationData = ({
  attestation,
  schema,
}: {
  attestation?: Partial<Tables<"attestations">>;
  schema?: Partial<Tables<"supported_schemas">>;
}) => {
  if (!schema || !schema?.schema) {
    console.error("Schema is missing data for parsing", schema);
    return;
  }

  if (!attestation || !attestation?.attestation) {
    console.error("Attestation is missing data for parsing", attestation);
    return;
  }

  const attestationData = JSON.parse(attestation.attestation as string);

  if (!isAttestation(attestationData)) {
    console.error("Invalid attestation data", attestationData);
    return;
  }

  const abiFromSchema = parseSchemaToABI(schema.schema);

  const decodedAttestation = decodeAbiParameters(
    abiFromSchema[0].outputs,
    attestationData.data,
  );

  const keys = abiFromSchema[0].outputs.map((output) => output.name);
  const values = decodedAttestation;
  const decodedAttestationObject: Record<string, unknown> = keys.reduce(
    (acc: Record<string, unknown>, key, index) => {
      acc[key] = values[index];
      return acc;
    },
    {},
  );

  if (!decodedAttestationObject) {
    console.error("Attestation data could not be parsed", attestation);
    return;
  }

  const _attestation = attestation;
  _attestation.decoded_attestation = JSON.stringify(decodedAttestationObject);
  if (decodedAttestationObject?.chain_id)
    _attestation.chain_id = mapUnknownToBigInt(
      decodedAttestationObject.chain_id,
    )?.toString();

  if (
    decodedAttestationObject?.contract_address &&
    decodedAttestationObject?.token_id
  ) {
    _attestation.contract_address =
      typeof decodedAttestationObject?.contract_address === "string" &&
      isAddress(decodedAttestationObject?.contract_address)
        ? decodedAttestationObject.contract_address
        : null;

    _attestation.token_id = mapUnknownToBigInt(
      decodedAttestationObject.token_id,
    )?.toString();
  }

  return _attestation;
};

const mapUnknownToBigInt = (value: unknown) => {
  if (typeof value === "bigint") return value;
  if (typeof value === "number") return BigInt(value);
  if (typeof value === "string") return BigInt(value);
  return null;
};
