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
 * const claim: ClaimData = {
 *  contractAddress: "0x1234...5678",
 *  claimID: 1n,
 *  uri: "ipfs://QmXZj9Pm4g7Hv3Z6K4Vw2vW"
 *  };
 *
 * const metadata = await fetchMetadataFromUri(claim);
 * ```
 */
export const fetchMetadataFromUri = async ({
  hypercert,
}: {
  hypercert?: Partial<Tables<"hypercerts">>;
}) => {
  if (!hypercert) {
    console.error("Invalid hypercert data for fetching metadata", hypercert);
    return;
  }
  const { uri, claim_id } = hypercert;

  if (!uri) {
    console.error(`Could not get URI for claimID ${claim_id}`);
    return;
  }

  let metadata;

  // Try from IPFS
  if (uri.startsWith("ipfs://")) {
    metadata = await fetchFromIPFS({ uri });
  }

  // Try from HTTPS
  if (uri.startsWith("https://")) {
    metadata = await fetchFromHTTPS({ uri });
  }

  // If nothing found yet, try from IPFS as CID
  if (!metadata) {
    metadata = await fetchFromIPFS({ uri });
  }

  if (!metadata) {
    console.error(
      `No metadata found on IPFS for URI ${uri} of claimID ${claim_id}`,
    );
    return;
  }

  const validation = validateMetaData(metadata);

  if (!validation.valid) {
    console.error(
      `Invalid metadata for URI ${uri} of claimID ${claim_id}`,
      validation.errors,
    );
    return;
  }

  const _hypercert = hypercert;

  _hypercert.name = metadata.name;
  _hypercert.description = metadata.description;
  _hypercert.external_url = metadata.external_url;
  _hypercert.image = metadata.image;
  _hypercert.properties = metadata.properties;
  _hypercert.contributors = metadata.hypercert.contributors.value;
  _hypercert.impact_scope = metadata.hypercert.impact_scope.value;
  _hypercert.impact_timeframe_from =
    metadata.hypercert.impact_timeframe.value[0];
  _hypercert.impact_timeframe_to = metadata.hypercert.impact_timeframe.value[1];
  _hypercert.work_scope = metadata.hypercert.work_scope.value;
  _hypercert.work_timeframe_from = metadata.hypercert.work_timeframe.value[0];
  _hypercert.work_timeframe_to = metadata.hypercert.work_timeframe.value[1];
  _hypercert.rights = metadata.hypercert.rights.value;

  return _hypercert;
};
