import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { fetchFromHttpsOrIpfs } from "@/utils/fetchFromHttpsOrIpfs";

/**
 * This function fetches an allow list from a given URI.
 *
 * The URI can be an IPFS URI, an HTTPS URI, or a CID. The function tries to fetch the allow list from the
 * different sources in that order. If the allow list is found, it is validated and returned.
 *
 * @param uri - The URI where the allow list is located.
 * @returns The allow list as an OpenZeppelin Merkle tree if found and valid, otherwise undefined.
 *
 * @example
 * ```typescript
 * const allowList = await fetchAllowListFromUri({ uri: "ipfs://QmXZj9Pm4g7Hv3Z6K4Vw2vW" });
 * ```
 */

interface FetchAllowListFromUri {
  uri?: string;
}

export const fetchAllowListFromUri = async ({ uri }: FetchAllowListFromUri) => {
  const fetchResult = await fetchFromHttpsOrIpfs(uri);

  if (!fetchResult) {
    console.error(
      `[FetchAllowListFromUri] No metadata found on IPFS for URI ${uri}`,
    );
    return;
  }

  // If response object is already a OZ Merkle tree, return it as is
  try {
    console.debug(
      "[FetchAllowListFromUri] Loading OZ Merkle tree from response by parsing as JSON",
    );

    return StandardMerkleTree.load<[string, bigint]>(
      JSON.parse(fetchResult as string),
    );
  } catch (error) {
    console.warn(
      `[FetchAllowListFromUri] Allow list at ${uri} is not a valid OZ Merkle tree`,
      error,
    );
  }

  // If response object is already a OZ Merkle tree, return it as is
  try {
    console.debug(
      "[FetchAllowListFromUri] Loading OZ Merkle tree directly from response",
    );
    return StandardMerkleTree.load<[string, bigint]>(fetchResult as never);
  } catch (error) {
    console.warn(
      `[FetchAllowListFromUri] Allow list at ${uri} is not a valid OZ Merkle tree`,
      error,
    );
  }
};
