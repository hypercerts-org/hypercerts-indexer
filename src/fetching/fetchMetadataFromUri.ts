import { validateMetaData } from "@hypercerts-org/sdk";
import { fetchFromHTTPS, fetchFromIPFS } from "@/utils";
import { Tables } from "@/types/database.types";

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

interface FetchMetadataFromUri {
  uri?: string;
}

export const fetchMetadataFromUri = async ({ uri }: FetchMetadataFromUri) => {
  if (!uri || uri === "ipfs://null" || uri === "ipfs://") {
    console.error("[FetchMetadataFromUri] URI is missing");
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
      `[FetchMetadataFromUri] No metadata found on IPFS for URI ${uri}`,
    );
    return;
  }

  const validation = validateMetaData(fetchResult);

  if (!validation.valid) {
    console.error(
      `[FetchMetadataFromUri] Invalid metadata for URI ${uri}`,
      validation.errors,
    );
    return;
  }

  const metadata: Partial<Tables<"metadata">> = {
    name: fetchResult.name,
    description: fetchResult.description,
    external_url: fetchResult.external_url,
    image: fetchResult.image,
    properties: fetchResult.properties,
    contributors: fetchResult.hypercert.contributors.value,
    impact_scope: fetchResult.hypercert.impact_scope.value,
    impact_timeframe_from: fetchResult.hypercert.impact_timeframe.value[0],
    impact_timeframe_to: fetchResult.hypercert.impact_timeframe.value[1],
    work_scope: fetchResult.hypercert.work_scope.value,
    work_timeframe_from: fetchResult.hypercert.work_timeframe.value[0],
    work_timeframe_to: fetchResult.hypercert.work_timeframe.value[1],
    rights: fetchResult.hypercert.rights.value,
    allow_list_uri: fetchResult.allowList,
  };

  return metadata;
};
