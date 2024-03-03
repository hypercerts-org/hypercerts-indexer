import { HypercertMetadata, validateMetaData } from "@hypercerts-org/sdk";
import { ClaimData } from "@/parsing/claimStoredEvent";
import { fetchFromHTTPS, fetchFromIPFS } from "@/utils";

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
 * const claim: ClaimData = {
 *  contractAddress: "0x1234...5678",
 *  claimID: 1n,
 *  uri: "ipfs://QmXZj9Pm4g7Hv3Z6K4Vw2vW"
 *  };
 *
 * const metadata = await fetchMetadataFromUri(claim);
 * ```
 */
export const fetchMetadataFromUri = async (claim: ClaimData) => {
  const { uri, claimID, contractAddress } = claim;

  if (!uri) {
    console.error(
      `Could not get URI for claimID ${claimID} on contract ${contractAddress} `,
    );
    return claim;
  }

  let metadata;

  // Try from IPFS
  if (uri.startsWith("ipfs://")) {
    metadata = await fetchFromIPFS(claim);
  }

  // Try from HTTPS
  if (uri.startsWith("https://")) {
    metadata = await fetchFromHTTPS(claim);
  }

  // If nothing found yet, try from IPFS as CID
  if (!metadata) {
    metadata = await fetchFromIPFS(claim);
  }

  if (!metadata) {
    console.error(
      `No metadata found on IPFS for URI ${uri} of claimID ${claimID} on contract ${contractAddress}`,
    );
    return claim;
  }

  const validation = validateMetaData(metadata);

  if (!validation.valid) {
    console.error(
      `Invalid metadata for URI ${uri} of claimID ${claimID} on contract ${contractAddress}:`,
      validation.errors,
    );
    return claim;
  }

  return { ...claim, metadata: metadata as HypercertMetadata };
};
