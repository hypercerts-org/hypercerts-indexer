import { fetchFromHTTPS, fetchFromIPFS } from "@/utils";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";

/*
 * This function fetches the metadata of a claim from the uri as stored in the claim on the contract.
 *
 * Because the uri can be an IPFS URI, an HTTPS URI, or a CID, this function tries to fetch the metadata from the
 * different sources in that order. If the metadata is found, it is validated and returned.
 *
 * @param claim - The claim data.
 * @returns The metadata of the claim.
 *
 * @example
 * ```js
 *
 * const claim: Claim = {
 *  contract_address: "0x1234...5678",
 *  claim_id: 1n,
 *  uri: "ipfs://QmXZj9Pm4g7Hv3Z6K4Vw2vW"
 *  total_units: 100n,
 *  };
 *
 * const metadata = await fetchMetadataFromUri(claim);
 * ```
 */

interface FetchAllowListFromUri {
  uri?: string;
}

export const fetchAllowListFromUri = async ({ uri }: FetchAllowListFromUri) => {
  if (!uri || uri === "ipfs://null" || uri === "ipfs://") {
    console.error("[FetchAllowListFromUri] URI is missing: ", uri);
    return;
  }

  let fetchResult;

  // Try from IPFS
  if (uri.startsWith("ipfs://")) {
    fetchResult = await fetchFromIPFS({ uri });
  }

  // Try from HTTPS
  if (uri.startsWith("https://")) {
    fetchResult = await fetchFromHTTPS({ uri });
  }

  // If nothing found yet, try from IPFS as CID
  if (!fetchResult) {
    fetchResult = await fetchFromIPFS({ uri });
  }

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

    return StandardMerkleTree.load<[string, bigint]>(JSON.parse(fetchResult));
  } catch (error) {
    console.error(
      `[FetchAllowListFromUri] Allow list at ${uri} is not a valid OZ Merkle tree`,
      error,
    );
  }

  // If response object is already a OZ Merkle tree, return it as is
  try {
    console.debug(
      "[FetchAllowListFromUri] Loading OZ Merkle tree directly from response",
    );
    return StandardMerkleTree.load<[string, bigint]>(fetchResult);
  } catch (error) {
    console.error(
      `[FetchAllowListFromUri] Allow list at ${uri} is not a valid OZ Merkle tree`,
      error,
    );
  }
};
