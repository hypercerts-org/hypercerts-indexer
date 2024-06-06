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
