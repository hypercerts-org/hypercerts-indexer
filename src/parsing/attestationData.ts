import { decodeAbiParameters } from "viem";
import { Tables } from "@/types/database.types";
import { isAttestation } from "@/fetching/fetchAttestationData";
import { parseSchemaToABI } from "@/utils/parseSchemaToAbi";
import * as console from "console";

/*
 * Helper method to get the attestation content from the encoded data
 *
 * @param attestation - The attestation object.
 *
 * @returns {AttestationData} - The provided attestaion object extended with the decoded attestation data.
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
  const decodedAttestationObject = keys.reduce((acc, key, index) => {
    acc[key] = values[index];
    return acc;
  }, {});

  if (!decodedAttestationObject) {
    console.error("Attestation data could not be parsed", attestation);
    return;
  }

  const _attestation = attestation;
  _attestation.decoded_attestation = JSON.stringify(decodedAttestationObject);
  if (decodedAttestationObject?.chain_id)
    _attestation.chain_id = decodedAttestationObject.chain_id;

  if (
    decodedAttestationObject?.contract_address &&
    decodedAttestationObject?.token_id
  ) {
    _attestation.contract_address = decodedAttestationObject.contract_address;
    _attestation.token_id = decodedAttestationObject.token_id;
  }

  return _attestation;
};
