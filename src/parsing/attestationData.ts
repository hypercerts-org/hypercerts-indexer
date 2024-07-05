import { decodeAbiParameters, isAddress } from "viem";
import { Tables } from "@/types/database.types.js";
import { EasAttestation } from "@/fetching/fetchAttestationData.js";
import { parseSchemaToABI } from "@/utils/parseSchemaToAbi.js";
import { z } from "zod";

const HypercertAttestationSchema = z.object(
  {
    chain_id: z.coerce.bigint(),
    contract_address: z.string().refine(isAddress, {
      message: `[decodeAttestationData] Invalid contract address in attestation data`,
    }),
    token_id: z.coerce.bigint(),
  },
  { message: `[decodeAttestationData] Invalid hypercert attestation data` },
);

const DecodedAttestationSchema = z.object({
  attester: z.string(),
  recipient: z.string(),
  uid: z.string(),
  supported_schemas_id: z.string(),
  attestation: z.unknown(),
  data: z.unknown(),
  chain_id: z.coerce.bigint(),
  contract_address: z.string(),
  token_id: z.coerce.bigint(),
});

export type DecodedAttestation = z.infer<typeof DecodedAttestationSchema>;

/**
 * Decodes attestation data from a given attestation and schema.
 *
 * This function takes an attestation and a schema as input, and attempts to decode the attestation data.
 * If the schema or attestation is missing, it logs an error and returns.
 * If the attestation data can be successfully decoded, it creates a new attestation object with the decoded data.
 * If an error occurs during the decoding process, it logs the error and returns.
 *
 * @param {Object} params - The parameters for the function.
 * @param {ParsedAttestedEvent} params.event - The event data associated with the attestation.
 * @param {EasAttestation} params.attestation - The attestation data to decode.
 * @param {Tables<"supported_schemas">} params.schema - The schema to use for decoding. It should contain a `schema` and an `id`.
 *
 * @returns {Object | undefined} A new attestation object with the decoded data, or undefined if the attestation data could not be decoded.
 *
 * @example
 * ```typescript
 * const attestation = {
 *   attestation: {
 *     attester: "0x1234",
 *     recipient: "0x5678",
 *     data: "0x9abc",
 *   },
 *   block_timestamp: 1234567890n,
 *   uid: "abcdef",
 * };
 * const schema = {
 *   schema: "0xdef0",
 *   id: 1,
 * };
 * const decodedAttestation = decodeAttestationData({ event, attestation, schema });
 * console.log(decodedAttestation);
 * */
export const decodeAttestationData = ({
  attestation,
  schema,
}: {
  attestation: EasAttestation;
  schema: Tables<"supported_schemas">;
}) => {
  if (!schema.schema) {
    console.debug(
      `[DecodeAttestationData] Schema is missing for ${schema.id}.`,
      {
        id: schema.id,
        uid: attestation.uid,
      },
    );
    throw new Error(
      "[DecodeAttestationData] Schema is missing for ${schema.id}.",
    );
  }

  const { attester, recipient, data, uid } = attestation;
  let _attestation: { [key: string]: unknown } = {};

  try {
    const abiFromSchema = parseSchemaToABI(schema.schema)[0];

    const decodedAttestation = decodeAbiParameters(abiFromSchema.outputs, data);

    _attestation = Object.fromEntries(
      abiFromSchema.outputs.map((output, index) => [
        output.name,
        decodedAttestation[index],
      ]),
    );
  } catch (error) {
    console.error(
      "[DecodeAttestationData] Error while decoding attestation data: ",
      error,
    );
    throw error;
  }

  try {
    const { chain_id, contract_address, token_id } =
      HypercertAttestationSchema.parse(_attestation);

    return DecodedAttestationSchema.parse({
      attester,
      recipient,
      uid,
      supported_schemas_id: schema.id,
      attestation: attestation,
      data: _attestation,
      chain_id,
      contract_address,
      token_id,
    });
  } catch (error) {
    console.error(
      "[DecodeAttestationData] Error while constructing attestation data: ",
      error,
    );
    throw error;
  }
};
