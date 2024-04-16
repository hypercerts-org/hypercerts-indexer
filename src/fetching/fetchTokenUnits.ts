import { Hex, parseAbiItem } from "viem";
import { client } from "@/clients/evmClient";

interface FetchTokenUnits {
  contractAddress: Hex;
  tokenId: bigint;
  blockNumber: bigint;
}

export const fetchTokenUnits = async ({
  contractAddress,
  tokenId,
  blockNumber,
}: FetchTokenUnits): Promise<number> => {
  return await client.readContract({
    address: contractAddress,
    abi: [parseAbiItem("function unitsOf(uint256 tokenID)")],
    functionName: "unitsOf",
    args: [tokenId],
    blockNumber,
  });
};
