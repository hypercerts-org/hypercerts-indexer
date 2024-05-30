import { getDeployment } from "@/utils";
import { client } from "@/clients/evmClient";
import easAbi from "@/abis/eas.json";
import { Address, Hex, isAddress } from "viem";
import { ParsedAttestedEvent } from "@/parsing/attestedEvent";

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

/*
 * This function fetches the attestation data as stored at the provided UID on the contract.
 *
 * @param attestation - The EAS Attested event data.
 * @returns {Attestation}  - The event data with the attestation data attached
 *
 * @example
 * ```js
 *
 * const easData = {
 *    recipient: "0x1234...5678",
 *    attester: "0x1234...5678",
 *    uid: "0x1234...5678",
 *    schema: "0x1234...5678",
 *  };
 *
 * const attestation: Attestation = await fetchAttestationData(easData);
 * ```
 */

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

    if (!_attestationData || !isAttestation(_attestationData)) {
      console.error(
        "[FetchAttestationData] Invalid attestation data",
        _attestationData,
      );
      return;
    }

    return { ...attestedEvent, attestation: _attestationData };
  } catch (e) {
    console.error(
      `[FetchAttestationData] Error fetching attestation data for UID ${uid} on contract ${easAddress}:`,
      e,
    );
    return;
  }
};

export const isAttestation = (data: unknown): data is Attestation => {
  return (
    typeof data === "object" &&
    data !== null &&
    "uid" in data &&
    "schema" in data &&
    "refUID" in data &&
    "time" in data &&
    "expirationTime" in data &&
    "revocationTime" in data &&
    "recipient" in data &&
    typeof data.recipient === "string" &&
    isAddress(data.recipient) &&
    "revocable" in data &&
    typeof data.revocable === "boolean" &&
    "attester" in data &&
    typeof data.attester === "string" &&
    isAddress(data.attester) &&
    "data" in data
  );
};
