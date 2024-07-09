import { HypercertMetadataValidator, Metadata } from "@/utils/metadata.zod.js";
import { Database } from "@/types/database.types.js";
import { ParserMethod } from "@/indexer/LogParser.js";
import { HypercertMetadata } from "@hypercerts-org/sdk";

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

export const parseMetadata: ParserMethod<HypercertMetadata> = async ({
  data,
}) => {
  const res = HypercertMetadataValidator.safeParse(data);

  if (!res.success) {
    console.warn(
      `[FetchMetadataFromUri] Metadata validation failed`,
      res.error.message,
    );
    return [];
  }

  const _metadata = res.data;

  const row = {
    name: _metadata.name,
    description: _metadata.description,
    external_url: _metadata.external_url,
    image: _metadata.image,
    properties: _metadata.properties,
    contributors: _metadata.hypercert?.contributors.value,
    impact_scope: _metadata.hypercert?.impact_scope.value,
    impact_timeframe_from:
      _metadata.hypercert?.impact_timeframe?.value?.[0]?.toString(),
    impact_timeframe_to:
      _metadata.hypercert?.impact_timeframe?.value?.[1]?.toString(),
    work_scope: _metadata.hypercert?.work_scope.value,
    work_timeframe_from:
      _metadata.hypercert?.work_timeframe?.value?.[0]?.toString(),
    work_timeframe_to:
      _metadata.hypercert?.work_timeframe?.value?.[1]?.toString(),
    rights: _metadata.hypercert?.rights?.value,
    allow_list_uri: _metadata.allowList,
    parsed: true,
  };

  return [row];
};
