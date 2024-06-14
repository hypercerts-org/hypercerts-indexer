import { walletClient } from "./evm";
import { HypercertMinterAbi } from "@hypercerts-org/sdk";
import { parseEther } from "viem";

export const submitMintClaimTransaction = async ({
  contractAddress = "0xa16DFb32Eb140a6f3F2AC68f41dAd8c7e83C4941" as `0x${string}`,
  account = "0xdf2C3dacE6F31e650FD03B8Ff72beE82Cb1C199A" as `0x${string}`,
  units = parseEther("1"),
  cid = "ipfs://test_cid",
}: {
  contractAddress: `0x${string}`;
  account: `0x${string}`;
  units: bigint;
  cid: string;
}) => {
  return await walletClient.writeContract({
    address: contractAddress,
    abi: HypercertMinterAbi,
    functionName: "mintClaim",
    args: [account, units, cid, 0n],
    account,
  });
};

export const submitSplitTransaction = async ({
  contractAddress = "0xa16DFb32Eb140a6f3F2AC68f41dAd8c7e83C4941" as `0x${string}`,
  account = "0xdf2C3dacE6F31e650FD03B8Ff72beE82Cb1C199A" as `0x${string}`,
  hypercertTokenId = "340282366920938463463374607431768211457",
  fractions = [parseEther("0.5"), parseEther("0.5")],
}: {
  contractAddress: `0x${string}`;
  account: `0x${string}`;
  hypercertTokenId: string;
  fractions: bigint[];
}) => {
  return await walletClient.writeContract({
    address: contractAddress,
    abi: HypercertMinterAbi,
    functionName: "splitFraction",
    args: [account, hypercertTokenId, fractions],
    account,
  });
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
