import { getDeployment } from "@/utils";
import { client } from "@/clients/evmClient";
import easAbi from "@/abis/eas.json";
import { Address, Hex, isAddress } from "viem";
import { Tables } from "@/types/database-generated.types";

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
 * @returns  - The event data with the attestation data attached
 *
 * @example
 * ```js
 *
 * const easData: AttestationData = {
 * recipient: "0x1234...5678",
 * attester: "0x1234...5678",
 * uid: "0x1234...5678",
 * schema: "0x1234...5678",
 *  };
 *
 * const attestation = await fetchAttestationData(easData);
 * ```
 */
export const fetchAttestationData = async ({
  attestation,
}: {
  attestation?: Partial<Tables<"attestations">>;
}) => {
  const { easAddress } = getDeployment();
  if (!attestation || !attestation.attestation_uid) {
    console.error(`Could not find UID for attestation`, attestation);
    return;
  }
  const { attestation_uid } = attestation;

  try {
    const _attestationData = await client.readContract({
      address: easAddress as `0x${string}`,
      abi: easAbi,
      functionName: "getAttestation",
      args: [attestation_uid],
    });

    if (!_attestationData || !isAttestation(_attestationData)) {
      console.error("Invalid attestation data", _attestationData);
      return;
    }

    const _attestation = attestation;

    _attestation.attestation = JSON.stringify(_attestationData);

    return _attestation;
  } catch (e) {
    console.error(
      `Error fetching attestation data for UID ${attestation_uid} on contract ${easAddress}:`,
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
