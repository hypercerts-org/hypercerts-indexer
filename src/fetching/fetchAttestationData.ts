import { getDeployment } from "@/utils/getDeployment.js";
import { client } from "@/clients/evmClient.js";
import easAbi from "@/abis/eas.json" assert { type: "json" };
import { isAddress, isHex } from "viem";
import { ParsedAttestedEvent } from "@/parsing/attestedEvent.js";
import * as z from "zod";
import { messages } from "@/utils/validation.js";

//https://github.com/ethereum-attestation-service/eas-sdk/blob/master/src/eas.ts#L87
// Zod validation of Attestation
export const EasAttestationSchema = z.object({
  uid: z.string().refine(isHex),
  schema: z.string().refine(isHex),
  refUID: z.string().refine(isHex),
  time: z.bigint(),
  expirationTime: z.bigint(),
  revocationTime: z.bigint(),
  recipient: z
    .string()
    .refine(isAddress, { message: messages.INVALID_ADDRESS }),
  revocable: z.boolean(),
  attester: z.string().refine(isAddress, { message: messages.INVALID_ADDRESS }),
  data: z.string().refine(isHex),
});

export type EasAttestation = z.infer<typeof EasAttestationSchema>;

export interface FetchAttestationData {
  attestedEvent: ParsedAttestedEvent;
}

/**
 * fetchAttestationData is an async function that fetches attestation data for a given UID from a contract.
 * It uses the client to read the contract and parses the returned data using the EasAttestationSchema.
 * @param {FetchAttestationData} attestedEvent - The event to fetch attestation data for.
 * @returns {Promise<{event: ParsedAttestedEvent, attestation: EasAttestation}>} - The attested event with the fetched attestation data.
 */
export const fetchAttestationData = async ({
  attestedEvent,
}: FetchAttestationData) => {
  const { easAddress } = getDeployment();
  const { uid } = attestedEvent;

  console.debug(
    `[fetchAttestationData] Fetching attestation data for UID: ${uid} from contract: ${easAddress}`,
  );

  const _attestationData = await client.readContract({
    address: easAddress as `0x${string}`,
    abi: easAbi,
    functionName: "getAttestation",
    args: [uid],
  });

  return {
    event: attestedEvent,
    attestation: EasAttestationSchema.parse(_attestationData),
  };
};
