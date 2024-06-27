import { publicClient, walletClient } from "./evm";
import { HypercertMinterAbi } from "@hypercerts-org/sdk";

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
