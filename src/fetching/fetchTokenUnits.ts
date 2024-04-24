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
}: FetchTokenUnits) => {
  return await client.readContract({
    address: contractAddress,
    abi: [
      parseAbiItem(
        "function unitsOf(uint256 tokenID) view returns(uint256 units)",
      ),
    ],
    functionName: "unitsOf",
    args: [tokenId],
    blockNumber,
  });
};
