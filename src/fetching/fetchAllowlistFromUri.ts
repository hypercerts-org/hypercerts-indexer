import { fetchFromHttpsOrIpfs } from "@/utils/fetchFromHttpsOrIpfs.js";
import { parseToOzMerkleTree } from "@/utils/parseToOzMerkleTree.js";

export interface FetchAllowListFromUriInput {
  uri?: string;
}

/**
 * Fetches an allow list from a given URI.
 *
 * This function attempts to fetch data from the provided URI using the `fetchFromHttpsOrIpfs` utility function.
 * If no data is found, it logs a debug message and returns undefined.
 * If data is found, it attempts to parse and load the data as a Merkle tree using the `StandardMerkleTree.load` function from the OpenZeppelin library.
 * It first tries to parse the data as a JSON string, and if that fails, it tries to load the data directly.
 * If both attempts fail, it logs a debug message for each failure and returns undefined.
 *
 * @param {FetchAllowListFromUriInput} { uri } - An object containing the URI to fetch the allow list from.
 * @returns {Promise<StandardMerkleTree<[string, bigint]> | undefined>} A promise that resolves to a Merkle tree if the data could be fetched and loaded successfully, otherwise undefined.
 *
 * @example
 * ```typescript
 * const allowList = await fetchAllowListFromUri({ uri: "ipfs://QmXZj9Pm4g7Hv3Z6K4Vw2vW" });
 * ```
 * */
export const fetchAllowListFromUri = async ({
  uri,
}: FetchAllowListFromUriInput) => {
  const fetchResult = await fetchFromHttpsOrIpfs(uri);

  if (!fetchResult) {
    console.debug(
      `[FetchAllowListFromUri] No metadata found on IPFS for URI ${uri}`,
    );
    return;
  }
  return parseToOzMerkleTree(fetchResult, uri);
};
