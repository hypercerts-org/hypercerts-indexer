import { z } from "zod";
import { ParserMethod } from "@/indexer/LogParser.js";
import { parseToOzMerkleTree } from "@/utils/parseToOzMerkleTree.js";
import { StandardMerkleTreeData } from "@openzeppelin/merkle-tree/dist/standard.js";
import { Tables } from "@/types/database.types.js";
import { supabase } from "@/clients/supabaseClient.js";
import { getAddress, isAddress } from "viem";
import { messages } from "@/utils/validation.js";
import { HypercertMetadata, validateMetaData } from "@hypercerts-org/sdk";

const DO_NOT_PARSE = [
  "ipfs://null",
  "ipfs://",
  "ipfs://example",
  "undefined",
  "null",
];

const UriEventSchema = z.object({
  address: z.string().refine(isAddress, { message: messages.INVALID_ADDRESS }),
  params: z.object({
    value: z.string(),
    id: z.coerce.bigint(),
  }),
});

export type AllowListData = {
  data: StandardMerkleTreeData<[string, bigint]>;
  root: string;
  uri: string;
  parsed: boolean;
};

export type MetadataResult = {
  metadata: Partial<HypercertMetadata & { uri: string; parsed: boolean }>;
  allow_list?: AllowListData;
  hypercert_allow_list?: Tables<"hypercert_allow_lists">;
};

export const parseUriEvent: ParserMethod<MetadataResult> = async ({
  event,
  context: { getData, block, chain_id },
}) => {
  const {
    address,
    params: { value: uri, id: tokenId },
  } = UriEventSchema.parse(event);

  let allow_list;
  let hypercert_allow_list;

  if (!uri || DO_NOT_PARSE.includes(uri)) {
    console.warn(`[parseUriEvent] URI is missing or not accepted: ${uri}`);
    return [{ metadata: { uri, parsed: false } }];
  }

  // Get and validate metadata
  const ipfsData = await getData({ uri });
  if (!ipfsData) {
    console.warn(`[parseUriEvent] Metadata fetching failed. [uri: ${uri}]`);
    return [{ metadata: { uri, parsed: false } }];
  }
  const { valid, data, errors } = validateMetaData(ipfsData);

  if (!valid) {
    console.warn(`[parseUriEvent] Metadata validation failed`, errors);
    if (errors) {
      Object.values(errors).forEach((error) => {
        console.log("error", error);
      });
    }
    return [{ metadata: { uri, parsed: false } }];
  }

  const fetchedMetadata = data as HypercertMetadata;

  const metadata = {
    name: fetchedMetadata.name,
    description: fetchedMetadata.description,
    external_url: fetchedMetadata.external_url,
    image: fetchedMetadata.image,
    properties: fetchedMetadata.properties,
    contributors: fetchedMetadata.hypercert?.contributors.value,
    impact_scope: fetchedMetadata.hypercert?.impact_scope.value,
    impact_timeframe_from:
      fetchedMetadata.hypercert?.impact_timeframe?.value?.[0],
    impact_timeframe_to:
      fetchedMetadata.hypercert?.impact_timeframe?.value?.[1],
    work_scope: fetchedMetadata.hypercert?.work_scope.value,
    work_timeframe_from: fetchedMetadata.hypercert?.work_timeframe?.value?.[0],
    work_timeframe_to: fetchedMetadata.hypercert?.work_timeframe?.value?.[1],
    rights: fetchedMetadata.hypercert?.rights?.value,
    allow_list_uri: fetchedMetadata.allowList,
    parsed: true,
    uri,
  };

  // If allowlist is present, fetch and parse it
  if (metadata.allow_list_uri) {
    const uri = metadata.allow_list_uri;
    const res = await getData({
      uri,
    });

    if (res) {
      const tree = parseToOzMerkleTree(res, uri);

      if (tree) {
        allow_list = {
          data: tree.dump(),
          root: tree.root,
          uri,
          parsed: true,
        };

        const { data: claim_id } = await supabase
          .rpc("get_or_create_claim", {
            p_chain_id: chain_id,
            p_contract_address: getAddress(address),
            p_token_id: tokenId.toString(),
            p_last_update_block_timestamp: block.timestamp.toString(),
            p_last_update_block_number: block.blockNumber,
            p_creation_block_timestamp: block.timestamp.toString(),
            p_creation_block_number: block.blockNumber,
          })
          .throwOnError();

        hypercert_allow_list = {
          id: crypto.randomUUID(),
          claims_id: claim_id,
          allow_list_data_uri: uri,
          parsed: true,
        };
      }
    }
  }

  // Return metadata and allowlist data
  return [
    {
      metadata,
      allow_list,
      hypercert_allow_list,
    },
  ];
};
