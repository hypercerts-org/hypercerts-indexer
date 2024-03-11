import { decodeAbiParameters, parseAbiParameters } from "viem";
import { Tables } from "@/types/database.types";
import { isAttestation } from "@/fetching/fetchAttestationData";

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

  const decodedAttestation = decodeAbiParameters(
    parseAbiParameters(schema.schema),
    attestationData.data,
  );

  if (!decodedAttestation) {
    console.error("Attestation data could not be parsed", attestation);
    return;
  }

  const _attestation = attestation;
  _attestation.decoded_attestation = JSON.stringify(decodedAttestation);

  return _attestation;
};
