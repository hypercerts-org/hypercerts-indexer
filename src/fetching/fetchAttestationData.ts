import { getDeployment } from "@/utils";
import { client } from "@/clients/evmClient";
import easAbi from "@/abis/eas.json";
import { Address, Hex, isAddress } from "viem";
import { ParsedAttestedEvent } from "@/parsing/attestedEvent";
import * as z from "zod";
import { messages } from "@/utils/validation";

/**
 * Asynchronously fetches attestation data from a contract.
 *
 * This function fetches the attestation data as stored at the provided UID on the contract.
 * It first checks if the attestedEvent and its UID are defined. If not, it logs an error and returns.
 * Then, it tries to read the contract using the client, with the provided address, abi, function name, and arguments.
 * If the contract read is successful, it parses the attestation data using the AttestationSchema.
 * If the parsing is successful, it returns the attestedEvent with the attestation data attached.
 * If an error occurs during the contract read, it logs the error and returns.
 *
 * @param {Object} attestedEvent - The EAS Attested event data.
 * @returns {Promise<Object | undefined>} - The event data with the attestation data attached, or undefined if an error occurs.
 *
 * @example
 * ```js
 * const attestedEvent = {
 *    recipient: "0x1234...5678",
 *    attester: "0x1234...5678",
 *    uid: "0x1234...5678",
 *    schema: "0x1234...5678",
 *    refUID: "0x1234...5678",
 *    time: BigInt(1633027200),
 *    expirationTime: BigInt(1733027200),
 *    revocationTime: BigInt(0),
 *    revocable: true,
 *    data: "0x1234...5678",
 *  };
 * const attestation: Attestation | undefined = await fetchAttestationData({ attestedEvent });
 **/

//https://github.com/ethereum-attestation-service/eas-sdk/blob/master/src/eas.ts#L87
export interface Attestation {
  uid: Hex;
  schema: Hex;
  refUID: Hex;
  time: bigint;
  expirationTime: bigint;
  revocationTime: bigint;
  recipient: Address;
  revocable: boolean;
  attester: Address;
  data: Hex;
}

// Zod validation of Attestation
export const AttestationSchema = z.object({
  uid: z.string(),
  schema: z.string(),
  refUID: z.string(),
  time: z.bigint(),
  expirationTime: z.bigint(),
  revocationTime: z.bigint(),
  recipient: z
    .string()
    .refine(isAddress, { message: messages.INVALID_ADDRESS }),
  revocable: z.boolean(),
  attester: z.string().refine(isAddress, { message: messages.INVALID_ADDRESS }),
  data: z.string(),
});

interface FetchAttestationData {
  attestedEvent?: ParsedAttestedEvent;
}

export const fetchAttestationData = async ({
  attestedEvent,
}: FetchAttestationData) => {
  const { easAddress } = getDeployment();
  if (!attestedEvent || !attestedEvent.uid) {
    console.error(
      `[FetchAttestationData] Could not find UID for attestation`,
      attestedEvent,
    );
    return;
  }
  const { uid } = attestedEvent;

  try {
    const _attestationData = await client.readContract({
      address: easAddress as `0x${string}`,
      abi: easAbi,
      functionName: "getAttestation",
      args: [uid],
    });

    AttestationSchema.parse(_attestationData);

    return { ...attestedEvent, attestation: _attestationData };
  } catch (e) {
    console.error(
      `[FetchAttestationData] Error fetching attestation data for UID ${uid} on contract ${easAddress}:`,
      e,
    );
    return;
  }
};
