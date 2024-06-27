import { publicClient, walletClient } from "./evm";
import { HypercertMinterAbi } from "@hypercerts-org/sdk";
import easAbi from "@/abis/eas.json" assert { type: "json" };
import { encodeAbiParameters, getAddress, parseAbiParameters } from "viem";

export const submitMintClaimTransaction = async ({
  contractAddress = "0xa16DFb32Eb140a6f3F2AC68f41dAd8c7e83C4941" as `0x${string}`,
  account = "0xdf2C3dacE6F31e650FD03B8Ff72beE82Cb1C199A" as `0x${string}`,
  units,
  cid,
}: {
  contractAddress: `0x${string}`;
  account: `0x${string}`;
  units: bigint;
  cid: string;
}) => {
  const { request } = await publicClient.simulateContract({
    address: contractAddress,
    abi: HypercertMinterAbi,
    functionName: "mintClaim",
    args: [account, units, cid, 0n],
    account,
  });

  return await walletClient.writeContract(request);
};

export const submitSplitTransaction = async ({
  contractAddress = "0xa16DFb32Eb140a6f3F2AC68f41dAd8c7e83C4941" as `0x${string}`,
  account = "0xdf2C3dacE6F31e650FD03B8Ff72beE82Cb1C199A" as `0x${string}`,
  hypercertTokenId,
  fractions,
}: {
  contractAddress: `0x${string}`;
  account: `0x${string}`;
  hypercertTokenId: string;
  fractions: bigint[];
}) => {
  const { request } = await publicClient.simulateContract({
    address: contractAddress,
    abi: HypercertMinterAbi,
    functionName: "splitFraction",
    args: [account, hypercertTokenId, fractions],
    account,
  });

  return await walletClient.writeContract(request);
};

export const submitBurnTransaction = async ({
  contractAddress = "0xa16DFb32Eb140a6f3F2AC68f41dAd8c7e83C4941" as `0x${string}`,
  account = "0xdf2C3dacE6F31e650FD03B8Ff72beE82Cb1C199A" as `0x${string}`,
  hypercertTokenId = "340282366920938463463374607431768211457",
}: {
  contractAddress: `0x${string}`;
  account: `0x${string}`;
  hypercertTokenId: string;
}) => {
  return await walletClient.writeContract({
    address: contractAddress,
    abi: HypercertMinterAbi,
    functionName: "burnFraction",
    args: [account, hypercertTokenId],
    account,
  });
};

export const submitTransferTransaction = async ({
  contractAddress = "0xa16DFb32Eb140a6f3F2AC68f41dAd8c7e83C4941" as `0x${string}`,
  account,
  hypercertTokenId,
  recipient,
}: {
  contractAddress: `0x${string}`;
  account: `0x${string}`;
  hypercertTokenId: string;
  recipient: `0x${string}`;
}) => {
  const { request } = await publicClient.simulateContract({
    address: contractAddress,
    abi: HypercertMinterAbi,
    functionName: "safeTransferFrom",
    args: [account, recipient, hypercertTokenId, 1n, ""],
    account,
  });

  return await walletClient.writeContract(request);
};

export interface AttestationRequestData {
  recipient: string;
  data: string;
  expirationTime?: bigint;
  revocable?: boolean;
  refUID?: string;
  value?: bigint;
}

export interface AttestationRequest {
  schema: string;
  data: AttestationRequestData;
}

export const submitAttestTransaction = async ({
  contractAddress = "0xC2679fBD37d54388Ce493F1DB75320D236e1815e" as `0x${string}`,
  account = "0xdf2C3dacE6F31e650FD03B8Ff72beE82Cb1C199A" as `0x${string}`,
  schemaUid,
  requestData,
}: {
  contractAddress: `0x${string}`;
  account: `0x${string}`;
  schemaUid: string;
  requestData: AttestationRequestData;
}) => {
  // /**
  //  * @dev A struct representing the arguments of the attestation request.
  //  */
  // struct AttestationRequestData {
  //   address recipient; // The recipient of the attestation.
  //   uint64 expirationTime; // The time when the attestation expires (Unix timestamp).
  //   bool revocable; // Whether the attestation is revocable.
  //   bytes32 refUID; // The UID of the related attestation.
  //   bytes data; // Custom attestation data.
  //   uint256 value; // An explicit ETH amount to send to the resolver. This is important to prevent accidental user errors.
  // }

  const encodingSchema = `address, uint64, bool, bytes32, bytes, uint256`;

  const encodedData = encodeAbiParameters(
    parseAbiParameters(
      `struct AttestationRequestData { bytes32 schema; address recipient; }`,
    ),
    [
      schemaUid as `0x${string}`,
      [
        getAddress(requestData.recipient),
        requestData.expirationTime ?? 0n,
        requestData.revocable ?? false,
        schemaUid as `0x${string}`,
        requestData.data as `0x${string}`,
        0n,
      ],
    ],
  );

  console.log("ENCODED DATA", encodedData);
  console.log("SCHEMA UID", schemaUid);
  console.log("contractAddress", contractAddress);
  console.log("account", account);

  const { request } = await publicClient.simulateContract({
    address: contractAddress,
    abi: easAbi,
    functionName: "attest",
    args: [
      schemaUid as `0x${string}`,
      [
        getAddress(requestData.recipient),
        requestData.expirationTime ?? 0n,
        requestData.revocable ?? false,
        schemaUid as `0x${string}`,
        requestData.data as `0x${string}`,
        0n,
      ],
    ],
    account,
  });

  return await walletClient.writeContract(request);
};
