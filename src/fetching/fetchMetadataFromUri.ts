import { fetchFromHttpsOrIpfs } from "@/utils/fetchFromHttpsOrIpfs.js";
import { HypercertMetadataValidator } from "@/utils/metadata.zod.js";
import { Database } from "@/types/database.types.js";

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
  const fetchResult = await fetchFromHttpsOrIpfs(uri);

  if (!fetchResult) {
    console.warn(
      `[FetchMetadataFromUri] No metadata found on IPFS for URI ${uri}`,
    );
    return;
  }

  const res = HypercertMetadataValidator.safeParse(fetchResult);

  if (!res.success) {
    console.warn(
      `[FetchMetadataFromUri] Invalid metadata for URI ${uri}`,
      res.error.message,
    );
    return;
  }

  const _metadata = res.data;

  const row: Database["public"]["Tables"]["metadata"]["Insert"] = {
    name: _metadata.name,
    description: _metadata.description,
    external_url: _metadata.external_url,
    image: _metadata.image,
    // @ts-expect-error - json array typing error
    properties: _metadata.properties,
    contributors: _metadata.hypercert?.contributors.value,
    impact_scope: _metadata.hypercert?.impact_scope.value,
    impact_timeframe_from: _metadata.hypercert?.impact_timeframe?.value?.[0],
    impact_timeframe_to: _metadata.hypercert?.impact_timeframe?.value?.[1],
    work_scope: _metadata.hypercert?.work_scope.value,
    work_timeframe_from: _metadata.hypercert?.work_timeframe?.value?.[0],
    work_timeframe_to: _metadata.hypercert?.work_timeframe?.value?.[1],
    rights: _metadata.hypercert?.rights?.value,
    allow_list_uri: _metadata.allowList,
    uri,
    parsed: true,
  };

  return row;
};
